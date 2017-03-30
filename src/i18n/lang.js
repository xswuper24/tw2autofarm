AutoFarm.prototype.i18n = function () {
    let locales = @@langs

    let gameLang = require('conf/locale').LANGUAGE

    let aliases = {
        'pt_pt': 'pt_br',
        'en_dk': 'en_us'
    }

    if (gameLang in aliases) {
        gameLang = aliases[gameLang]
    }

    this.lang = gameLang in locales
        ? locales[gameLang]
        : locales['en_us']
}
