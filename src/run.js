if (typeof autofarm === 'undefined') {
    let pid = modelDataService.getSelectedCharacter().getId()
    let settings = localStorage.getItem(`${pid}_autofarm`)
    settings = settings ? JSON.parse(settings) : {}

    autofarm = new AutoFarm(settings)
    interface = new AutoFarmInterface(autofarm)

    autofarm.on('start', function () {
        interface.$start.html(autofarm.lang.general.pause)
        interface.$start.removeClass('btn-green')
        interface.$start.addClass('btn-red')

        $rootScope.$broadcast(eventTypeProvider.MESSAGE_SUCCESS, {
            message: autofarm.lang.events.started
        })
    })

    autofarm.on('pause', function () {
        interface.$start.html(autofarm.lang.general.start)
        interface.$start.removeClass('btn-red')
        interface.$start.addClass('btn-green')

        $rootScope.$broadcast(eventTypeProvider.MESSAGE_SUCCESS, {
            message: autofarm.lang.events.paused
        })
    })

    autofarm.on('presetsChange', () => {
        interface.updatePresetList()
    })

    autofarm.on('groupsChanged', () => {
        interface.updateGroupList()
    })

    let startFarm = function () {
        if (autofarm.paused) {
            if (!autofarm.presets.length) {

                $rootScope.$broadcast(eventTypeProvider.MESSAGE_ERROR, {
                    message: autofarm.lang.events.presetFirst
                })

                return false
            }

            autofarm.start()
        } else {
            autofarm.pause()
        }
    }

    interface.$start.on('click', startFarm)
    Mousetrap.bind('shift+f', startFarm)
}
