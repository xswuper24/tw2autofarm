AutoFarm.prototype.interface = function () {
    let css = '#autofarm-button {position: relative;top: 0px;' +
        'left: 0px;font-size: 11px;margin-bottom: 10px}' +
        '#autofarm-modal {display: none}' +
        '#autofarm-modal td {text-align: center}' +
        '#autofarm-modal .inner-wrapper {width: 500px}' +
        '#autofarm-modal input {background: #b89064;width: 150px}'

    let button = '<div class="btn-border chat-wrapper btn-green" id="autofarm-button">' +
        '<div class="top-left"></div>' +
        '<div class="top-right"></div>' +
        '<div class="middle-top"></div>' +
        '<div class="middle-bottom"></div>' +
        '<div class="middle-left"></div>' +
        '<div class="middle-right"></div>' +
        '<div class="bottom-left"></div>' +
        '<div class="bottom-right"></div>' +
        '<div class="content">AutoFarm</div>' +
        '</div>'

    let modal = '<div class="twx-modal" id="autofarm-modal">' +
        '<div class="outer-wrapper">' +
        '<div class="middle-wrapper">' +
        '<div class="inner-wrapper">' +
        '<div class="win-content">' +
        '<header class="win-head">' +
        '<h3>Farmador Automático</h3>' +
        '<ul class="list-btn sprite">' +
        '<li>' +
        '<a href="#" class="btn-red icon-26x26-close" id="autofarm-close"></a>' +
        '</li>' +
        '</ul>' +
        '</header>' +
        '<footer class="win-foot sprite-fill">' +
        '<ul class="list-btn list-center">' +
        '<li><a class="btn-red btn-border" id="autofarm-start">Iniciar</a></li>' +
        '</ul>' +
        '</footer>' +
        '</div></div></div></div></div>'


    let $css = document.createElement('style')
    $css.innerHTML = css
    document.querySelector('head').appendChild($css)

    let $button = document.createElement('div')
    let $container = document.querySelector('#toolbar-left')
    $button.innerHTML = button
    $container.insertBefore($button, $container.firstChild)

    let $modal = document.createElement('div')
    $modal.innerHTML = modal
    document.body.appendChild($modal)

    // events

    $button.addEventListener('click', function () {
        $modal.firstChild.style.display = 'block'
    })

    let $close = document.querySelector('#autofarm-close')

    $close.addEventListener('click', function () {
        $modal.firstChild.style.display = 'none'
    })
}
