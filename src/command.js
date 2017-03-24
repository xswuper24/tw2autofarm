/**
 * Inicia o ciclo de comandos do script
 * @param {Number} _commandAttempt - Uso interno, conta quantas tentativas
 *      sem sucesso de enviar comandos o script teve.
 */
AutoFarm.prototype.commandInit = function (_commandAttempt = 0) {
    if (this.paused) {
        return false
    }

    // Se nenhuma aldeia conseguir enviar algum comando, o script
    // aguardará algum comando de dentre todas aldeias returnar
    // para dar continuidade.
    if (this.commandAttemptLimit(_commandAttempt)) {
        return this.event('allVillageNoUnits')
    }

    let sid = this.selectedVillage.getId()

    // Se aldeia ainda não tiver obtido a lista de alvos, obtem
    // os alvos e executa o comando novamente para dar continuidade.
    if (!this.targetList[sid]) {
        return this.getTargets(function () {
            // Apenas seleciona o primeiro alvo da lista
            let hasTargets = this.nextTarget(true)

            if (hasTargets) {
                this.commandInit(_commandAttempt)
            } else {
                this.nextVillage()
                this.commandInit(_commandAttempt)
            }
        })
    } else {
        this.nextTarget(true)
    }
    
    // Se a aldeia estiver no limite de 50 comandos ou não tem unidades
    // sulficientes para enviar o comando.
    if (sid in this.villagesNextReturn) {
        this.nextVillage()
        this.commandInit(++_commandAttempt)

        return false
    }

    // Caso a aldeia selecionada seja adicionada na lista
    // de aldeias ignoradas no meio da execução.

    // TODO: verificar se o script continua funcionando depois disso
    if (this.ignoredVillages.includes(sid)) {
        return this.nextVillage()
    }

    this.getVillageCommands((commands) => {
        // Quando o limite de comandos for atingido...
        // 1: Se o jogador tiver apenas uma aldeia, o script
        // aguardará o retorno do comando mais próximo e
        // reinicia a função.
        // 2: Vai para a próxima a aldeia e reinicia a função.
        if (commands.length >= 50) {
            this.event('commandLimit')
            this.getNextReturn(commands)

            if (this.uniqueVillage || this.settings.currentOnly) {
                let backTime = this.villagesNextReturn[sid]

                this.timerId = setTimeout(() => {
                    this.commandInit()
                }, backTime)
            } else {
                this.nextVillage()
                this.getTargets(() => {
                    this.commandInit()
                })
            }

            return false
        }

        this.getVillageUnits((villageUnits) => {
            let presetAvail = this.presetAvail(villageUnits)

            if (presetAvail) {
                this.sendCommand(() => {
                    this.event('sendCommand')
                    this.nextTarget()

                    let time = this.settings.interval * 1000

                    this.timerId = setTimeout(() => {

                        this.commandInit()
                    }, time)

                    this.event('nextCommandIn', [time])
                })
            } else {
                this.event('villageNoUnits')
                this.getNextReturn(commands)
                this.commandVillageNoUnits(commands)
            }
        })
    })
}

/**
 * Calcula o tempo de retorno (em milisegundos) do comando
 * mais proximo de voltar à aldeia.
 * @param {Object} commands - Lista de comandos da aldeia.
 * @return {Boolean}
 */
AutoFarm.prototype.getNextReturn = function (commands) {
    let vid = this.selectedVillage.getId()
    let backIn = this.getNeabyCommand(commands)

    this.villagesNextReturn[vid] = backIn

    setTimeout(() => {
        delete this.villagesNextReturn[vid]

        this.event('commandReturn', [vid])
    }, backIn)

    return true
}

/**
 * Envia um comando
 * @param {function} callback
 * @return {Boolean}
 */
AutoFarm.prototype.sendCommand = function (callback) {
    socketService.emit(routeProvider.SEND_CUSTOM_ARMY, {
        start_village: this.selectedVillage.getId(),
        target_village: this.selectedTarget.id,
        type: 'attack',
        units: this.preset.units,
        catapult_target: '',
        officers: {},
        icon: 0
    })

    this.commandProgressId = this.selectedTarget.id
    this.commandProgressCallback = callback

    return true
}

/**
 * Lida com aldeias que não possuem mais a quantidade
 * mínima para continuar enviando comandos.
 * @param {Object} commands - Lista de comandos da aldeia.
 * @return {Boolean}
 */
AutoFarm.prototype.commandVillageNoUnits = function (commands) {
    if (this.uniqueVillage || this.settings.currentOnly) {
        if (!commands.length) {
            this.event('noUnitsNoCommands')

            return false
        }

        let backTime = this.getNeabyCommand(commands)

        if (backTime) {
            this.timerId = setTimeout(() => {
                this.commandInit()
            }, backTime)
        } else {
            this.event('noUnitsNoCommands')
        }
    } else {
        this.nextVillage()
        this.commandInit()
    }

    return true
}

/**
 * Checa se o script tentou enviar comandos de todas aldeias do jogador
 * sem sucesso.
 * @param {Number} _commandAttempt - Uso interno, conta quantas tentativas
 *      sem sucesso de enviar comandos o script teve.
 * @return {Boolean}
 */
AutoFarm.prototype.commandAttemptLimit = function (_commandAttempt) {
    if (this.player.villages.length === _commandAttempt) {
        let next = this.nextVillageUnits()

        this.timerId = setTimeout(() => {
            this.selectVillage(next.vid)
            this.commandInit()
        }, next.time)

        return true
    }

    return false
}

/**
 * Obtem a aldeia dentre todas aldeias que houver o comando
 * com o menor tempo de retorno.
 * @return {Object}
 */
AutoFarm.prototype.nextVillageUnits = function () {
    let sortable = []

    for (let vid in this.villagesNextReturn) {
        sortable.push({
            vid: vid,
            time: this.villagesNextReturn[vid]
        })
    }

    sortable.sort((a, b) => a.time - b.time)

    return sortable[0]
}

/**
 * Obtem o tempo do comando com o menor tempo de retorno dentre
 * todos os comandos.
 * @param {Object} commands - Lista de comandos da aldeia.
 * @return {Number}
 */
AutoFarm.prototype.getNeabyCommand = function (commands) {
    let now = new Date().getTime() / 1000
    let timers = []

    for (let i = 0; i < commands.length; i++) {
        let cmd = commands[i]

        if (cmd.type === 'support' && cmd.direction === 'forward') {
            continue
        }

        let time = cmd.time_completed - cmd.time_start
        let remain = cmd.time_completed - now

        if (cmd.direction === 'forward') {
            remain += time
        }

        timers.push(remain)
    }

    timers.sort((a, b) => a - b)

    return Math.round((timers[0] * 1000) + 5000)
}
