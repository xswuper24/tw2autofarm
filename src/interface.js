AutoFarm.prototype.interface = function () {
    let self = this
    let $window
    let scrollbar
    let newSettings = {}

    let $wrapper = document.querySelector('#wrapper')
    
    function buildStyle () {
        let style = document.createElement('style')
        style.type = 'text/css'
        style.id = 'autofarm-style'
        style.innerHTML = '@@style'

        document.querySelector('head').appendChild(style)
    }

    function buildWindow () {
        $window = document.createElement('section')
        $window.id = 'autofarm-window'
        $window.className = 'autofarm-window twx-window screen left'
        $window.innerHTML = replace({
            version: self.version
        }, '@@window')

        let container = document.querySelector('#toolbar-right')
        container.parentNode.insertBefore($window, container.nextSibling)
        scrollbar = jsScrollbar($window.querySelector('.win-main'))

        setTabs()

        let $close = document.querySelector('#autofarm-close')

        $close.addEventListener('click', function () {
            $window.style.visibility = 'hidden'
            $wrapper.classList.remove('window-open')
        })

        document.addEventListener('keydown', function (event) {
            if (event.keyCode === 27) {
                $window.style.visibility = 'hidden'
                $wrapper.classList.remove('window-open')
            }
        })
    }

    function buildButton () {
        let button = document.createElement('div')
        let container = document.querySelector('#toolbar-left')

        button.id = 'interface-autofarm'
        button.innerHTML = '@@button'
        container.insertBefore(button, container.firstChild)

        button.addEventListener('click', function () {
            $window.style.visibility = 'visible'
            $wrapper.classList.add('window-open')
        })
    }

    function bindSettings () {
        for (let key in self.settings) {
            newSettings[key] = self.settings[key]

            let input = $window.querySelector(`input[name="${key}"]`)

            switch (input.type) {
            case 'text':
            case 'number':
                input.value = self.settings[key]

                input.addEventListener('change', () => {
                    newSettings[key] = /^\d+$/.test(input.value)
                        ? parseInt(input.value, 10)
                        : input.value
                })
                break
            default:
                let change = input.checked ? 'add' : 'remove'

                input.parentNode.classList[change](
                    'icon-26x26-checkbox-checked'
                )

                input.addEventListener('click', () => {
                    newSettings[key] = input.checked
                    change = input.checked ? 'add' : 'remove'
                    input.parentNode.classList[change](
                        'icon-26x26-checkbox-checked'
                    )
                })
                break
            }
        }

        let $save = document.querySelector('#autofarm-save')
        let $form = document.querySelector('#autofarm-settings')

        $form.addEventListener('submit', function (event) {
            event.preventDefault()
        })

        $save.addEventListener('click', function (event) {
            if ($form.checkValidity()) {
                self.updateSettings(newSettings)

                $rootScope.$broadcast(eventTypeProvider.MESSAGE_SUCCESS, {
                    message: 'Configurações salvas!'
                })
            }
        })
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

    function replace (values, template) {
        let rkey = /\{\{ ([a-zA-Z0-9]+) \}\}/g

        template = template.replace(rkey, function (match, key) {
            return values[key]
        })

        return template
    }

    buildStyle()
    buildWindow()
    buildButton()
    bindSettings()
}
