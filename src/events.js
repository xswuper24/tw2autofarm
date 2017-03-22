/**
 * Chama os eventos.
 * @param {String} - Nome do evento.
 * @param {Array} data - Lista de dados.
 */
AutoFarm.prototype.event = function (type, data) {
    if (type in this.eventListeners) {
        this.eventListeners[type].apply(this, data)
    }

    return this
}

/**
 * Registra um evento.
 * @param {String} type - Nome do evento.
 * @param {Function} handler - Função chamada quando o evento for disparado.
 */
AutoFarm.prototype.on = function (type, handler) {
    if (typeof handler === 'function') {
        this.eventListeners[type] = handler
    }

    return this
}
