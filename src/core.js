/*!
 * Tribal Wars 2 Auto Farm v@@version
 * https://gitlab.com/mafrazzrafael/tw2autofarm
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
    this.settings = {}

    for (let item in this.defaults) {
        this.settings[item] = settings[item] === void 0
            ? this.defaults[item]
            : settings[item]
    }

    /**
     * Objeto com todos os dados do jogador.
     * @type {Object}
     */
    this.player = modelDataService.getSelectedCharacter()
    this.player.villages = []

    let playerVillages = this.player.getVillages()

    for (let id in playerVillages) {
        this.player.villages.push(playerVillages[id])
    }

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

    // Detecta todos comandos enviados no jogo (não apenas pelo script)
    // e identifica os que foram enviados pelo script.
    $rootScope.$on(eventTypeProvider.COMMAND_SENT, ($event, data) => {
        if (this.commandProgressId === data.target.id) {
            this.commandProgressCallback(data)
            this.commandProgressCallback = null
            this.commandProgressId = null
        }
    })

    $rootScope.$on(eventTypeProvider.ARMY_PRESET_UPDATE, () => {
        socketService.emit(routeProvider.GET_PRESETS, {}, (data) => {
            this.preset = this.getPreset(false, data.presets)

            if (!this.preset) {
                this.event('noPreset')
                this.pause()
            }
        })
    })

    /**
     * Callbacks usados pelos eventos que são disparados no
     * decorrer do script.
     * @type {Object}
     */
    this.eventListeners = {}

    /**
     * Preset usado como referência para enviar os comandos
     * @type {Object}
     */
    this.preset = null

    /**
     * Preset usado para enviar os comandos
     * @type {Object}
     */
    this.ignoredVillages = this.getIgnoredVillages()

    return this
}

/**
 * Inicia os comandos.
 * @return {Boolean}
 */
AutoFarm.prototype.start = function () {
    if (!this.preset) {
        this.event('noPreset')

        return false
    }

    this.paused = false
    this.commandInit()

    return true
}

/**
 * Pausa os comandos.
 * @return {Boolean}
 */
AutoFarm.prototype.pause = function () {
    this.paused = true
    clearTimeout(this.timerId)

    return true
}

/**
 * Carrega todos todas necessários antes de iniciar os comandos.
 * @param {Function} callback
 * @return {Boolean}
 */
AutoFarm.prototype.ready = function (callback) {
    this.getPreset((preset) => {
        if (preset) {
            this.preset = preset
        } else {
            this.event('noPreset')
        }

        this.prepareVillage(callback)
    })
}

/**
 * Prepara a lista de alvos da aldeia atualmente selecionada.
 * @param {Function} callback - Chamado ao finalizar a atualização de alvos.
 * @param {Number} _lastVillage - Parametro interno para detectar aldeias
 *     que não possuem alvos.
 */
AutoFarm.prototype.prepareVillage = function (callback, _lastVillage = 0) {
    let sid = this.selectedVillage.getId()

    // Caso nenhum aldeia do jogador esteja disponível.
    // Causas: sem alvos ou ignoradas.
    if (_lastVillage === this.player.villages.length) {
        return this.event('noVillages')
    }

    if (this.ignoredVillages.includes(sid)) {
        if (this.settings.currentOnly) {
            return this.event('noVillages')
        }

        this.nextVillage()
        this.prepareVillage(callback, ++_lastVillage)
        
        return
    }

    this.getTargets(function () {
        let hasTargets = this.nextTarget(true)

        if (!hasTargets) {
            if (this.settings.currentOnly) {
                return this.event('noVillages')
            }

            this.nextVillage()
            this.prepareVillage(callback, ++_lastVillage)
        } else {
            callback()
        }
    })
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
            this.event('villageNoTargets')

            return false
        }

        this.event('ignoredTarget', [target])

        return this.nextTarget(false, ++_noTargets)
    }

    if (!_initial) {
        this.event('nextTarget')
    }

    return true
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

        callback.call(this)
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

    this.event('nextVillage')

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
            this.nextTarget(true)
            
            return true
        }
    }

    return false
}

/**
 * Verifica se a aldeia que está tentando enviar um comando possui
 *     a quantidade de unidades minimas especificadas no preset.
 * @param {Function} villageUnits - Quantidade de unidades disponíveis
 *     na aldeia.
 */
AutoFarm.prototype.presetAvail = function (villageUnits) {
    for (let unit in this.preset.units) {
        if (villageUnits[unit].in_town < this.preset.units[unit]) {
            return false
        }
    }

    return true
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
AutoFarm.prototype.getPreset = function (callback, presets) {
    if (presets) {
        for (let id in presets) {
            if (presets[id].name === this.settings.presetName) {
                if (callback) {
                    callback(presets[id])
                }

                return presets[id]
            }
        }

        if (callback) {
            callback(false)
        }

        return false
    }

    if (modelDataService.getPresetList().isLoaded()) {
        return this.getPreset(callback,
            modelDataService.getPresetList().presets)
    }

    socketService.emit(routeProvider.GET_PRESETS, {}, (data) => {
        this.getPreset(callback, data.presets)
    })
}

/**
 * Obtem a lista de aldeias pertencentes ao grupo de aldeias que serão
 *     ignoradas tanta para enviar quanto para receber comandos.
 * @return {Array}
 */
AutoFarm.prototype.getIgnoredVillages = function () {
    let groups = modelDataService.getGroupList().getGroups()

    for (let id in groups) {
        if (groups[id].name === this.settings.groupIgnore) {
            return modelDataService.getGroupList().getGroupVillageIds(id)
        }
    }

    return []
}
