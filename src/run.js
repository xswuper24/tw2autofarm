if (typeof autofarm === 'undefined') {
    let pid = modelDataService.getSelectedCharacter().getId()
    let settings = localStorage.getItem(`${pid}_autofarm`)
    settings = settings ? JSON.parse(settings) : {}

    autofarm = new AutoFarm(settings)
    autofarm.interface()

    autofarm.ready(function () {
        $start.addEventListener('click', function () {
            if (autofarm.paused) {
                if (!autofarm.preset) {

                    $rootScope.$broadcast(eventTypeProvider.MESSAGE_ERROR, {
                        message: 'Configure uma predefinição primeiro!'
                    })

                    return false
                }

                autofarm.start()
            } else {
                autofarm.pause()
            }
        })
    })

    let $start = document.querySelector('#autofarm-start')

    autofarm.on('start', function () {
        $start.innerHTML = 'Pausar'
        $start.classList.remove('btn-green')
        $start.classList.add('btn-red')
    }).on('pause', function () {
        $start.innerHTML = 'Iniciar'
        $start.classList.remove('btn-red')
        $start.classList.add('btn-green')
    })
}
