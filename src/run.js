let autofarm = new AutoFarm()

autofarm.interface()
autofarm.ready(function () {
    let $start = document.querySelector('#autofarm-start')

    $start.addEventListener('click', function () {
        if (autofarm.paused) {
            autofarm.start()
            $start.innerHTML = 'Pausar'
        } else {
            autofarm.pause()
            $start.innerHTML = 'Iniciar'
        }
    })
})
