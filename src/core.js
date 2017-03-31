/*!
 * Tribal Wars 2 Auto Farm v@@version
 * @@repository
 *
 * Copyright Rafael Mafra
 * MIT License
 *
 * @@date
 */

$rootScope = angular.element(document).scope()
modelDataService = injector.get('modelDataService')
socketService = injector.get('socketService')
routeProvider = injector.get('routeProvider')
eventTypeProvider = injector.get('eventTypeProvider')
math = require('helper/math')

/**
 * @class
 * @param {Object} [settings] - Configurações básicas.
 * @param {Number} settings.radius - Distáncia máxima que os alvos podem estar. 
 * @param {Number} settings.interval - Intervalo entre cada comando (segundos).
 * @param {Number} settings.presetName - Nome do preset usado para os comandos.
 * @param {Number} settings.groupIgnore - Nome do grupo usado nas aldeias a
 *     serem ignoradas.
 * @param {Boolean} settings.currentOnly - Apenas a aldeia selecionada será
 *     usada para enviar comandos.
 */
function AutoFarm (settings = {}) {
    /**
     * Versão do script.
     * @type {String}
     */
    this.version = '@@version'

    /**
     * Objeto com todas as configurações padrões.
     * @type {Object}
     */
    this.defaults = {
        radius: 10,
        interval: 1,
        presetName: '.farm',
        groupIgnore: '.ignore',
        currentOnly: false
    }

    /**
     * Objeto com todas as configurações.
     * @type {Object}
     */
    this.settings = angular.merge({}, this.defaults, settings)

    /**
     * Objeto com todos os dados do jogador.
     * @type {Object}
     */
    this.player = modelDataService.getSelectedCharacter()
    this.player.villages = Object.values(this.player.data.villages)

    /**
     * Identifica o status do script.
     * @type {Boolean}
     */
    this.paused = true

    /**
     * Identifica se o jogador possui apenas uma aldeia.
     * @type {Boolean}
     */
    this.uniqueVillage = this.player.villages.length === 1

    /**
     * Aldeia atualmente seleciona.
     * @type {Object}
     */
    this.selectedVillage = modelDataService.getSelectedVillage()

    /**
     * Lista de todos aldeias alvos possíveis para cada aldeia do jogador.
     * @type {Object}
     */
    this.targetList = {}

    /**
     * Lista com todas aldeias que estão com limite de 50 comandos.
     * Os valores são o tempo em que o comando mais proximo retornará.
     * Nota: tempo em milisegundos.
     * @type {Object}
     */
    this.villagesNextReturn = {}

    /**
     * Armazena o id do comando que está sendo enviado
     * no momento pelo script.
     * @type {Object}
     */
    this.commandProgressId = null
    
    /**
     * Armazena o callback do comando que está sendo enviado
     * no momento pelo script.
     * @type {Object}
     */
    this.commandProgressCallback = null

    /**
     * Callbacks usados pelos eventos que são disparados no
     * decorrer do script.
     * @type {Object}
     */
    this.eventListeners = {}

    /**
     * Propriedade usada para permitir ou não o disparo de eventos
     * @type {Boolean}
     */
    this.eventsEnabled = true

    /**
     * Preset usado como referência para enviar os comandos
     * @type {Array}
     */
    this.presets = []

    /**
     * Objeto do group de referência para ignorar aldeias/alvos.
     * Contém ID e nome do grupo.
     * @type {Object}
     */
    this.groupIgnore = null

    /**
     * Lista de aldeias ignoradas
     * @type {Array}
     */
    this.ignoredVillages = null

    this.updateGroupIgnore()
    this.updateIgnoredVillages()
    this.gameListeners()
    this.i18n()

    return this
}

/**
 * Inicia os comandos.
 * @return {Boolean}
 */
AutoFarm.prototype.start = function () {
    if (!this.presets.length) {
        this.event('noPreset')

        return false
    }

    this.paused = false
    this.event('start')
    this.commandInit()

    return true
}

/**
 * Pausa os comandos.
 * @return {Boolean}
 */
AutoFarm.prototype.pause = function () {
    this.paused = true
    this.event('pause')
    clearTimeout(this.timerId)

    return true
}

/**
 * Atualiza as novas configurações passados pelo usuário e as fazem
 *     ter efeito caso o farm esteja em funcionamento.
 * @param {Object} newSettings - Novas configurações.
 */
AutoFarm.prototype.updateSettings = function (newSettings) {
    this.disableEvents()

    let restart = false

    if (!this.paused) {
        restart = true
        this.pause()
    }

    for (let key in newSettings) {
        this.settings[key] = newSettings[key]
    }

    this.updateGroupIgnore()
    this.updateIgnoredVillages()

    this.getPresets(() => {
        if (this.presets.length && restart) {
            this.start()
        }
    })

    this.enableEvents()
}

/**
 * Desativa o disparo de eventos
 */
AutoFarm.prototype.disableEvents = function () {
    this.eventsEnabled = false
}

/**
 * Ativa o disparo de eventos
 */
AutoFarm.prototype.enableEvents = function () {
    this.eventsEnabled = true
}

/**
 * Seleciona o próximo alvo da aldeia.
 * @param {Boolean} _initial - Parametro interno usado na primeira execução
 *     e do script e após cada alteração entre as aldeias do jogador.
 * @param {Number} _noTargets - Parametro interno para identificar aldeias
 *     que não possuem nenhum alvo.
 * @return {Boolean}
 */
AutoFarm.prototype.nextTarget = function (_initial, _noTargets = 0) {
    let sid = this.selectedVillage.getId()
    let targets = this.targetList[sid]

    if (!_initial) {
        targets.index++
    }

    let i = targets.index

    if (typeof targets[i] !== 'undefined') {
        this.selectedTarget = targets[i]
    } else {
        this.selectedTarget = targets[0]
        targets.index = 0
    }

    let target = this.selectedTarget

    if (this.ignoredVillages.includes(target.id)) {
        if (_noTargets === targets.length) {
            return this.event('noTargets')
        }

        this.event('ignoredTarget', [target])

        return this.nextTarget(false, ++_noTargets)
    }

    if (!_initial) {
        this.event('nextTarget', [this.selectedTarget])
    }

    return true
}

/**
 * Apenas um atalho para facilitar a leitura
 */
AutoFarm.prototype.selectFirstTarget = function () {
    return this.nextTarget(true)
}

/**
 * Obtem a lista de alvos para a aldeia selecionada.
 * @param {Function} callback
 * @return {Boolean}
 */
AutoFarm.prototype.getTargets = function (callback) {
    let coords = this.selectedVillage.getPosition()
    let sid = this.selectedVillage.getId()

    if (sid in this.targetList) {
        return callback()
    }

    let size = this.settings.radius

    socketService.emit(routeProvider.MAP_GETVILLAGES, {
        x: coords.x - size,
        y: coords.y - size,
        width: size * 2,
        height: size * 2
    }, (data) => {
        let villages = data.villages
        let nearby = []
        let i = villages.length

        while (i--) {
            let target = villages[i]

            if (target.id === sid || target.character_id) {
                continue
            }

            let distance = math.actualDistance(coords, target)

            if (distance <= this.settings.radius) {
                nearby.push({
                    coords: [target.x, target.y],
                    distance: distance,
                    id: target.id,
                    name: target.name
                })
            }
        }

        if (nearby.length === 0) {
            if (this.nextVillage()) {
                this.getTargets(callback)
            } else {
                this.event('noTargets')
            }

            return false
        }

        this.targetList[sid] = nearby.sort((a, b) => a.distance - b.distance)
        this.targetList[sid].index = 0
        this.selectedTarget = this.targetList[sid][0]

        callback()
    })

    return false
}

/**
 * Seleciona a próxima aldeia do jogador.
 * @param {Number} _loop - Parametro interno usado para identificar quando
 *     todas aldeias do jogador foram ignoradas.
 * @return {Boolean}
 */
AutoFarm.prototype.nextVillage = function (_loop = 0) {
    if (this.uniqueVillage || this.settings.currentOnly) {
        return false
    }

    if (_loop === this.player.villages.length) {
        this.event('noVillages')

        return false
    }

    let nextIndex = this.player.villages.indexOf(this.selectedVillage) + 1

    this.selectedVillage =
        typeof this.player.villages[nextIndex] !== 'undefined'
            ? this.player.villages[nextIndex]
            : this.selectedVillage = this.player.villages[0]

    if (this.ignoredVillages.includes(this.selectedVillage.getId())) {
        return this.nextVillage(++_loop)
    }

    if (this.selectedVillage.getId() in this.villagesNextReturn) {
        return this.nextVillage(++_loop)
    }

    this.event('nextVillage', [this.selectedVillage])

    return true
}

/**
 * Seleciona uma aldeia específica do jogador.
 * @param {Number} vid - ID da aldeia à ser selecionada.
 * @return {Boolean}
 */
AutoFarm.prototype.selectVillage = function (vid) {
    for (let i = 0; i < this.player.villages.length; i++) {
        if (this.player.villages[i].getId() === vid) {
            this.selectedVillage = this.player.villages[i]
            this.firstFirstTarget()
            
            return true
        }
    }

    return false
}

/**
 * Chama os eventos.
 * @param {String} - Nome do evento.
 * @param {Array} data - Lista de dados.
 */
AutoFarm.prototype.event = function (type, data) {
    if (!this.eventsEnabled) {
        return this
    }

    if (type in this.eventListeners) {
        let listeners = this.eventListeners[type]

        for (let i = 0; i < listeners.length; i++) {
            listeners[i].apply(this, data)
        }
    }

    return this
}

/**
 * Registra um evento.
 * @param {String} type - Nome do evento.
 * @param {Function} handler - Função chamada quando o evento for disparado.
 */
AutoFarm.prototype.on = function (type, handler) {
    if (typeof handler === 'function') {
        if (!(type in this.eventListeners)) {
            this.eventListeners[type] = []
        }

        this.eventListeners[type].push(handler)
    }

    return this
}

/**
 * Verifica se a aldeia que está tentando enviar um comando possui
 *     a quantidade de unidades minimas especificadas no preset.
 * @param {Function} villageUnits - Quantidade de unidades disponíveis
 *     na aldeia.
 */
AutoFarm.prototype.presetAvail = function (villageUnits) {
    for (let preset of autofarm.presets) {
        let avail = true

        for (let unit in preset.units) {
            if (villageUnits[unit].in_town < preset.units[unit]) {
                avail = false
            }
        }

        if (avail) {
            return preset
        }
    }

    return false
}

/**
 * Carrega todos os comandos de uma aldeia.
 * @param {Function} callback
 */
AutoFarm.prototype.getVillageCommands = function (callback) {
    socketService.emit(routeProvider.GET_OWN_COMMANDS, {
        village_id: this.selectedVillage.getId()
    }, (data) => {
        callback(data.commands)
    })
}

/**
 * Carrega as unidades de uma aldeia.
 * @param {Function} callback
 */
AutoFarm.prototype.getVillageUnits = function (callback) {
    socketService.emit(routeProvider.VILLAGE_UNIT_INFO, {
        village_id: this.selectedVillage.getId()
    }, (data) => {
        callback(data.available_units)
    })
}

/**
 * Obtem preset apropriado para o script
 * @param {Function} callback
 * @param {Object} presets - Parametro interno usado para evitar
 *     repetição de código.
 */
AutoFarm.prototype.getPresets = function (callback, presets) {
    if (presets) {
        this.presets = []

        for (let id in presets) {
            if (presets[id].name === this.settings.presetName) {
                this.presets.push(presets[id])
            }
        }

        if (callback) {
            callback()
        }

        return true
    }

    if (modelDataService.getPresetList().isLoaded()) {
        return this.getPresets(callback,
            modelDataService.getPresetList().presets)
    }

    socketService.emit(routeProvider.GET_PRESETS, {}, (data) => {
        this.getPresets(callback, data.presets)
    })
}

/**
 * Atualiza o grupo de referência para ignorar aldeias
 */
AutoFarm.prototype.updateGroupIgnore = function () {
    let groups = modelDataService.getGroupList().getGroups()

    for (let id in groups) {
        if (groups[id].name === this.settings.groupIgnore) {
            this.groupIgnore = {
                id: id,
                name: groups[id].name
            }

            return
        }
    }

    this.groupIgnore = null
}

/**
 * Atualiza a lista de aldeias ignoradas
 */
AutoFarm.prototype.updateIgnoredVillages = function () {
    if (!this.groupIgnore) {
        return this.ignoredVillages = []
    }

    this.ignoredVillages =
        modelDataService.getGroupList().getGroupVillageIds(this.groupIgnore.id)
}

/**
 * Detecta todas atualizações de dados do jogo que são importantes
 * para o funcionamento do AutoFarm.
 */
AutoFarm.prototype.gameListeners = function () {
    let updatePresets = () => {
        this.getPresets(false)

        if (!this.presets.length) {
            this.event('noPreset')
            
            if (!this.paused) {
                this.pause()
            }
        }
    }

    // Detecta todos comandos enviados no jogo (não apenas pelo script)
    // e identifica os que foram enviados pelo script.
    // Por que isso?
    // A livraria do jogo não retorna um callback na mesma função
    // quando um comano é enviado, então é preciso ler todos e identificar
    // o que foi enviado pelo script.
    $rootScope.$on(eventTypeProvider.COMMAND_SENT, ($event, data) => {
        if (this.commandProgressId === data.target.id) {
            this.commandProgressCallback(data)
            this.commandProgressCallback = null
            this.commandProgressId = null
        }
    })

    // Detecta alterações nas prédefinições
    $rootScope.$on(eventTypeProvider.ARMY_PRESET_UPDATE, updatePresets)
    $rootScope.$on(eventTypeProvider.ARMY_PRESET_DELETED, updatePresets)

    // Detecta alterações nos grupos de aldeias
    $rootScope.$on(eventTypeProvider.GROUPS_UPDATED, ($event, data) => {
        this.updateGroupIgnore()
        this.updateIgnoredVillages()
    })
}
