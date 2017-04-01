if (typeof autofarm === 'undefined') {
    let pid = modelDataService.getSelectedCharacter().getId()
    let settings = localStorage.getItem(`${pid}_autofarm`)
    settings = settings ? JSON.parse(settings) : {}

    autofarm = new AutoFarm(settings)
    autofarmInterface = new AutoFarmInterface(autofarm)

    let $start = $('#autofarm-start')

    autofarm.on('start', function () {
        $start.html(autofarm.lang.general.pause)
        $start.removeClass('btn-green')
        $start.addClass('btn-red')

        $rootScope.$broadcast(eventTypeProvider.MESSAGE_SUCCESS, {
            message: autofarm.lang.events.start
        })
    })

    autofarm.on('pause', function () {
        $start.html(autofarm.lang.general.start)
        $start.removeClass('btn-red')
        $start.addClass('btn-green')

        $rootScope.$broadcast(eventTypeProvider.MESSAGE_SUCCESS, {
            message: autofarm.lang.events.pause
        })
    })

    $start.on('click', function () {
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
    })
}
