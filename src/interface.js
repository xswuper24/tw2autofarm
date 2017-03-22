AutoFarm.prototype.interface = function () {
    let css = '#autofarm-button {position: relative;top: 0px;' +
        'left: 0px;font-size: 11px;margin-bottom: 10px}' +
        '#autofarm-modal {visibility: hidden}' +
        '#autofarm-modal .inner-wrapper {width: 500px}' +
        '#autofarm-modal input {background: #b89064;width: 150px}' +
        '#autofarm-modal .box-paper {color: black; max-height: 250px}'

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
        '<h3>Farmador Automático <span class="small">v' + this.version + '</span></h3>' +
        '<ul class="list-btn sprite">' +
        '<li>' +
        '<a href="#" class="btn-red icon-26x26-close" id="autofarm-close"></a>' +
        '</li>' +
        '</ul>' +   
        '</header>' +
        '<div class="win-main">' +
        '<div class="box-paper">' +
        '<h3>Prédefinição</h3>' +
        '<p>O AutoFarm utiliza uma prédefinição para enviar os comandos, então é preciso que a conta tenha uma prédefinição nomeada <b>.farm</b> para que os farms iniciem.</p>' +
        '<p>Não é preciso ter a prédefinição ativada nas aldeias para funcionar.</p>' +
        '<p>Serão usados apenas o número de tropas especificados na prédefinição, <b>oficiais</b> não serão utilizados.</p>' +
        '<p>É possível alterar a quantidade de tropas na prédefinição enquanto o AutoFarm estiver ativado enviando os comandos. Os novos comandos serão enviandos com a nova quantidade de tropas especificada.</p>' +
        '<h3>Ignorando aldeias</h3>' +
        '<p>Qualquer aldeia que houver atribuido um grupo chamado <b>.ignore</b> serão ignorados pelo AutoFarm. O grupo serve tanto os alvos quanto para suas aldeias.</p>' +
        '<h3>Observações</h3>' +
        '<p>Os ataques iniciarão a partir da aldeia que estava selecionada no momento da execução do script.</p>' +
        '<p>A ordem das aldeias no ciclo é seguida em ordem alfabética.</p>' +
        '<h3>Sobre</h3>' +
        '<p>Esse script é desenvolvido por Rafael Mafra e é um projeto de código aberto e pode ser visto <a href="https://gitlab.com/mafrazz/tw2autofarm">aqui</a>.</p>' +
        '</div>' +
        '</div>' +
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
    jsScrollbar($modal.querySelector('.win-main'))

    // events

    $button.addEventListener('click', function () {
        $modal.firstChild.style.visibility = 'visible'
    })

    let $close = document.querySelector('#autofarm-close')

    $close.addEventListener('click', function () {
        $modal.firstChild.style.visibility = 'hidden'
    })
}
