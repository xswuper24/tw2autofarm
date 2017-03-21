if (typeof autofarm !== 'undefined') {
    autofarm.pause()
}

autofarm = new AutoFarm({
    radius: 5,
    interval: 4,
    currentOnly: false
})

autofarm.on('noVillages', function () {
    console.info('noVillages: Nenhuma aldeia disponível para atacar.')
})

autofarm.on('villageNoTargets', function () {
    console.info('villageNoTargets: A aldeia atual não tem nenhum alvo disponível.')
})

autofarm.on('noTargets', function () {
    console.info('noTargets: Nenhum alvo disponível.')
})

autofarm.on('nextTarget', function () {
    console.info('nextTarget: Alterando para o próximo alvo.')
})

autofarm.on('nextVillage', function () {
    console.info('nextVillage: Alterando para a próxima aldeia.')
})

autofarm.on('ignoredTarget', function (village) {
    console.info('ignoredTarget: Alvo ignorado.')
})

autofarm.on('allVillageNoUnits', function () {
    console.info('allVillageNoUnits: Sem tropas em nenhuma aldeia para atacar.')
})

autofarm.on('commandLimit', function () {
    console.info('commandLimit: Limite de 50 ataques por aldeia atingido.')
})

autofarm.on('sendCommand', function () {
    console.info('sendCommand: Comand enviado.')
})

autofarm.on('villageNoUnits', function () {
    console.info('villageNoUnits: Sem tropas na aldeia')
})

autofarm.on('noUnitsNoCommands', function () {
    console.info('noUnitsNoCommands: Sem tropas nem comandos retornando.')
})

autofarm.on('noPreset', function () {
    console.info('noPreset: Predefinição não foi criada.')
})

autofarm.on('nextCommandIn', function (time) {
    console.info(`nextCommandIn: Próximo comando em ${time}ms.`)
})

autofarm.ready(function () {
    autofarm.start()
})
