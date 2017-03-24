AutoFarm.prototype.interface = function () {
    // @@templates

    let $window
    
    function buildStyle () {
        let style = document.createElement('style')
        style.innerHTML = strings['interface/style.css']
        document.querySelector('head').appendChild(style)
    }

    function buildWindow () {
        $window = document.createElement('section')
        $window.id = 'autofarm-window'
        $window.className = 'autofarm-window twx-window screen left'
        $window.setAttribute('np-controller', 'AutoFarmController')
        $window.setAttribute('np-init', '')
        $window.innerHTML = strings['interface/window.html']

        let container = document.querySelector('#toolbar-right')
        container.parentNode.insertBefore($window, container.nextSibling)

        jsScrollbar($window.querySelector('.win-main'))
        setTabs('info')

        let $close = document.querySelector('#autofarm-close')

        $close.addEventListener('click', function () {
            $window.style.display = 'none'
        })
    }

    function buildButton () {
        let button = document.createElement('div')
        let container = document.querySelector('#toolbar-left')
        
        button.innerHTML = strings['interface/button.html']
        container.insertBefore(button, container.firstChild)

        button.addEventListener('click', function () {
            $window.style.display = 'block'
        })
    }

    function setTabs (activeTab) {
        function each (callback) {
            let tabs = $window.querySelectorAll('.tab')

            for (let tab of tabs) {
                let name = tab.getAttribute('tab')
                
                callback(name, tab)
            }
        }

        function setState () {
            each(function (name, tab) {
                let content = $window.querySelector(`.autofarm-content-${name}`)
                let inner = tab.querySelector('.tab-inner > div')
                let a = tab.querySelector('a')

                if (activeTab === name) {
                    content.style.display = ''
                    tab.classList.add('tab-active')
                    inner.classList.add('box-border-light')
                    a.classList.remove('btn-icon', 'btn-orange')
                } else {
                    content.style.display = 'none'
                    tab.classList.remove('tab-active')
                    inner.classList.remove('box-border-light')
                    a.classList.add('btn-icon', 'btn-orange')
                }
            })
        }

        each(function (name, tab) {
            tab.addEventListener('click', function () {
                activeTab = name
                setState()
            })
        })

        setState()
    }

    buildStyle()
    buildWindow()
    buildButton()
}
