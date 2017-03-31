if (typeof autofarm === 'undefined') {
    let pid = modelDataService.getSelectedCharacter().getId()
    let settings = localStorage.getItem(`${pid}_autofarm`)
    settings = settings ? JSON.parse(settings) : {}

    autofarm = new AutoFarm(settings)
    autofarm.interface()

    let $start = document.querySelector('#autofarm-start')

    autofarm.on('start', function () {
        $start.innerHTML = autofarm.lang.general.pause
        $start.classList.remove('btn-green')
        $start.classList.add('btn-red')

        $rootScope.$broadcast(eventTypeProvider.MESSAGE_SUCCESS, {
            message: autofarm.lang.events.start
        })
    }).on('pause', function () {
        $start.innerHTML = autofarm.lang.general.start
        $start.classList.remove('btn-red')
        $start.classList.add('btn-green')

        $rootScope.$broadcast(eventTypeProvider.MESSAGE_SUCCESS, {
            message: autofarm.lang.events.pause
        })
    })

    autofarm.ready(function () {
        $start.addEventListener('click', function () {
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
    })
}
