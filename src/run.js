if (typeof af !== 'undefined') {
    af.pause()
}

af = new AutoFarm({
    radius: 3,
    interval: 4,
    currentOnly: false
})

af.on('noVillages', function () {
    console.info('noVillages')
})
.on('villageNoTargets', function () {
    console.info('villageNoTargets')
})
.on('noTargets', function () {
    console.info('noTargets')
})
.on('nextTarget', function () {
    console.info('nextTarget')
})
.on('nextVillage', function () {
    console.info('nextVillage')
})
.on('ignoredTarget', function (village) {
    console.info('ignoredTarget')
})
.on('allVillageNoUnits', function () {
    console.info('allVillageNoUnits')
})
.on('commandLimit', function () {
    console.info('commandLimit')
})
.on('sendCommand', function () {
    console.info('sendCommand')
})
.on('villageNoUnits', function () {
    console.info('villageNoUnits')
})
.on('noUnitsNoCommands', function () {
    console.info('noUnitsNoCommands')
})
.on('noPreset', function () {
    console.info('noPreset')
})
.on('nextCommandIn', function (time) {
    console.info(`nextCommandIn ${time}`)
})
.on('commandReturn', function (vid) {
    // console.info(`commandReturn`)
})
.ready(function () {
    af.start()
})
