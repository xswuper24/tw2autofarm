AutoFarm.prototype.interface = function () {
    let eventsLimit = 20

    let self = this
    let $window
    let scrollbar
    let newSettings = {}

    let $gameWrapper = document.querySelector('#wrapper')

    let $filter = injector.get('$filter')
    let windowDisplayService = injector.get('windowDisplayService')
    let eventQueue = require('queues/EventQueue')
        
    function buildStyle () {
        let style = document.createElement('style')
        style.type = 'text/css'
        style.id = 'autofarm-style'
        style.innerHTML = '@@style'

        document.querySelector('head').appendChild(style)
    }

    function buildWindow () {
        function closeWindow () {
            $window.style.visibility = 'hidden'
            $gameWrapper.classList.remove('window-open')

            eventQueue.trigger(eventQueue.types.RESIZE, {
                'instant': true,
                'right': true
            })
        }

        $window = document.createElement('section')
        $window.id = 'autofarm-window'
        $window.className = 'autofarm-window twx-window screen left'

        $window.innerHTML = replace({
            version: self.version,
            title: self.lang.title,
            info: self.lang.general.info,
            settings: self.lang.general.settings,
            events: self.lang.general.events,
            radius: self.lang.settings.radius,
            maxTravelTime: self.lang.settings.maxTravelTime,
            interval: self.lang.settings.interval,
            currentOnly: self.lang.settings.currentOnly,
            presetName: self.lang.settings.presetName,
            groupIgnore: self.lang.settings.groupIgnore,
            save: self.lang.settings.save,
            nothingYet: self.lang.events.nothingYet,
            start: self.lang.general.start,
            dev: self.lang.info.dev,
            contact: self.lang.info.contact,
            about: self.lang.info.about
        }, '@@window')

        let container = document.querySelector('#toolbar-right')
        container.parentNode.insertBefore($window, container.nextSibling)
        scrollbar = jsScrollbar($window.querySelector('.win-main'))

        bindTabs()

        let $close = document.querySelector('#autofarm-close')
        
        $close.addEventListener('click', closeWindow)

        document.addEventListener('keydown', (event) => {
            if (event.keyCode === 27) {
                closeWindow()
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
            $gameWrapper.classList.add('window-open')

            eventQueue.trigger(eventQueue.types.RESIZE, {
                'instant': true,
                'right': true
            })
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
                let change = self.settings[key] ? 'add' : 'remove'

                if (self.settings[key]) {
                    input.setAttribute('checked', true)
                }

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

        let pid = modelDataService.getSelectedCharacter().getId()

        let $save = document.querySelector('#autofarm-save')
        let $form = document.querySelector('#autofarm-settings')

        $form.addEventListener('submit', function (event) {
            event.preventDefault()
        })

        $save.addEventListener('click', function (event) {
            if ($form.checkValidity()) {
                self.updateSettings(newSettings)

                let json = JSON.stringify(newSettings)
                localStorage.setItem(`${pid}_autofarm`, json)

                $rootScope.$broadcast(eventTypeProvider.MESSAGE_SUCCESS, {
                    message: self.lang.settings.saved
                })
            }
        })
    }

    function bindEvents () {
        let registers = 1
        let $events = document.querySelector('#autofarm-events')

        function addEvent (options) {
            if (registers >= eventsLimit) {
                $events.querySelector('tr:last-child').remove()
            }

            let htmlLinks = []

            if (options.links) {
                for (let i = 0; i < options.links.length; i++) {
                    htmlLinks.push(createLinkIcon(
                        options.links[i].type,
                        options.links[i].name
                    ))
                }

                options.text = sprintf(options.text, htmlLinks)
            }

            let tr = document.createElement('tr')
            tr.className = 'list-item'

            tr.innerHTML = replace({
                date: $filter('readableDateFilter')(Date.now()),
                icon: options.icon,
                text: options.text
            }, '@@event')

            if (options.links) {
                for (let i = 0; i < htmlLinks.length; i++) {
                    options.links[i].elem = tr.querySelector('#' + htmlLinks[i].id)
                    options.links[i].elem.addEventListener('click', function () {
                        windowDisplayService.openVillageInfo(options.links[i].id)
                    })
                }
            }

            $events.insertBefore(tr, $events.firstChild)
            registers++
            scrollbar.recalc()
        }

        function createLinkIcon (type, text) {
            let id = Math.round(Math.random() * 1e5)
            let template = '<a id="l{{ id }}" class="img-link icon-20x20-' + 
                '{{ type }} btn btn-orange padded">{{ text }}</a>'

            let html = replace({
                type: type,
                text: text,
                id: id
            }, template)

            return {
                html: html,
                id: 'l' + id
            }
        }

        function sprintf (format, replaces) {
            return format.replace(/{(\d+)}/g, function (match, number) {
                return typeof replaces[number].html !== 'undefined'
                    ? replaces[number].html
                    : match
            })
        }

        self.on('sendCommand', function (from, to) {
            addEvent({
                links: [
                    { type: 'village', name: from.getName(), id: from.getId() },
                    { type: 'village', name: to.name, id: to.id }
                ],
                text: self.lang.events.sendCommand,
                icon: 'attack'
            })
        })

        self.on('nextVillage', function (next) {
            addEvent({
                links: [
                    { type: 'village', name: next.getName(), id: next.getId() }
                ],
                icon: 'village',
                text: self.lang.events.nextVillage
            })
        })

        self.on('noUnitsNoCommands', function () {
            addEvent({
                icon: 'info',
                text: self.lang.events.noUnitsNoCommands
            })
        })

        self.on('noPreset', function () {
            addEvent({
                icon: 'info',
                text: self.lang.events.noPreset
            })
        })

        self.on('start', function () {
            addEvent({
                icon: 'info',
                text: self.lang.events.start
            })
        })

        self.on('pause', function () {
            addEvent({
                icon: 'info',
                text: self.lang.events.pause
            })
        })

        self.on('noVillages', function () {
            addEvent({
                icon: 'info',
                text: self.lang.events.noVillages
            })
        })

        self.on('commandLimit', function (village) {
            addEvent({
                icon: 'info',
                text: self.lang.events.commandLimit
            })
        })
    }

    function bindTabs (activeTab = 'info') {
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

                    scrollbar.content = content
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
    bindEvents()
}
