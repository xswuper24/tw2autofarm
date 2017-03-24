// if (typeof autofarm === 'undefined') {
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
                $start.classList.remove('btn-green')
                $start.classList.add('btn-red')
            } else {
                autofarm.pause()
                $start.innerHTML = 'Iniciar'
                $start.classList.remove('btn-red')
                $start.classList.add('btn-green')
            }
        })
    })
// }
