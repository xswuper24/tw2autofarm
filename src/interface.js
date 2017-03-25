AutoFarm.prototype.interface = function () {
    let $window
    let scrollbar
    let version = this.version
    
    function buildStyle () {
        let style = document.createElement('style')
        style.innerHTML = '@@style'

        document.querySelector('head').appendChild(style)
    }

    function buildWindow () {
        $window = document.createElement('section')
        $window.id = 'autofarm-window'
        $window.className = 'autofarm-window twx-window screen left'
        $window.innerHTML = replace({
            version: version
        }, '@@window')

        let container = document.querySelector('#toolbar-right')
        container.parentNode.insertBefore($window, container.nextSibling)
        scrollbar = jsScrollbar($window.querySelector('.win-main'))

        setTabs()

        let $close = document.querySelector('#autofarm-close')

        $close.addEventListener('click', function () {
            $window.style.visibility = 'hidden'
        })
    }

    function buildButton () {
        let button = document.createElement('div')
        let container = document.querySelector('#toolbar-left')
        
        button.innerHTML = '@@button'
        container.insertBefore(button, container.firstChild)

        button.addEventListener('click', function () {
            $window.style.visibility = 'visible'
        })
    }

    function replace (values, template) {
        let rkey = /\{\{ ([a-zA-Z0-9]+) \}\}/g

        template = template.replace(rkey, function (match, key) {
            return values[key]
        })

        return template
    }

    function setTabs (activeTab = 'info') {
        let tabs = $window.querySelectorAll('.tab')

        function setState () {
            for (let tab of tabs) {
                let name = tab.getAttribute('tab')

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

                scrollbar.recalc()
            }
        }

        for (let tab of tabs) {
            let name = tab.getAttribute('tab')
            
            tab.addEventListener('click', function () {
                activeTab = name
                setState()
            })
        }

        setState()
    }

    buildStyle()
    buildWindow()
    buildButton()
}
