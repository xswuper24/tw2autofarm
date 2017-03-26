if (typeof autofarm === 'undefined') {
    autofarm = new AutoFarm()
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
