/**
 * Calcula a distáncia entre duas coordenadas xxx|yyy.
 * @param {String|Number} x1
 * @param {String|Number} x2
 * @param {Number} [y1]
 * @param {Number} [y2]
 * @return {Number}
 */
function distanceXY (x1, x2, y1, y2) {
    if (typeof y1 === 'undefined') {
        let start = x1.split('|')
        let target = x2.split('|')

        x1 = parseInt(start[0], 10)
        x2 = parseInt(start[1], 10)
        y1 = parseInt(target[0], 10)
        y2 = parseInt(target[1], 10)
    }

    let raw = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)

    return Math.round(Math.sqrt(raw) * 100) / 100
}
