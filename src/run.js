if (typeof autofarm === 'undefined') {
    autofarm = new AutoFarm()
    autofarm.interface()
    autofarm.ready(function () {
        let $start = document.querySelector('#autofarm-start')

        $start.addEventListener('click', function () {
            if (autofarm.paused) {
                if (!autofarm.preset) {
                    alert('Configure uma predefinição antes de iniciar')
                    return false
                }

                autofarm.start()
                $start.innerHTML = 'Pausar'
            } else {
                autofarm.pause()
                $start.innerHTML = 'Iniciar'
            }
        })
    })

    ga('create', 'UA-92130203-3', 'auto');
    ga('send', 'pageview');
}
