"use strict";
/**
 * JORUMI Game Engine - Hexagonal Grid Utilities
 *
 * Utilidades para trabajar con coordenadas hexagonales (sistema axial)
 * Manual: El mapa del juego usa una grilla hexagonal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidHexCoordinate = isValidHexCoordinate;
exports.createHexCoordinate = createHexCoordinate;
exports.hexDistance = hexDistance;
exports.getAdjacentHexCoordinates = getAdjacentHexCoordinates;
exports.getHexCoordinatesInRange = getHexCoordinatesInRange;
exports.hexEquals = hexEquals;
exports.hexToString = hexToString;
exports.stringToHex = stringToHex;
exports.hexPath = hexPath;
exports.hexRound = hexRound;
/**
 * Verifica si las coordenadas hexagonales son válidas
 * En coordenadas axiales: q + r + s = 0
 */
function isValidHexCoordinate(coord) {
    return coord.q + coord.r + coord.s === 0;
}
/**
 * Crea coordenadas hexagonales validadas
 */
function createHexCoordinate(q, r) {
    const s = -q - r;
    return { q, r, s };
}
/**
 * Calcula la distancia entre dos coordenadas hexagonales
 * Manual: Usado para determinar rango de movimiento
 */
function hexDistance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}
/**
 * Obtiene las coordenadas de casillas adyacentes
 * Manual: Las casillas adyacentes están a distancia 1
 */
function getAdjacentHexCoordinates(coord) {
    const directions = [
        { q: +1, r: 0, s: -1 },
        { q: +1, r: -1, s: 0 },
        { q: 0, r: -1, s: +1 },
        { q: -1, r: 0, s: +1 },
        { q: -1, r: +1, s: 0 },
        { q: 0, r: +1, s: -1 },
    ];
    return directions.map(dir => ({
        q: coord.q + dir.q,
        r: coord.r + dir.r,
        s: coord.s + dir.s,
    }));
}
/**
 * Obtiene todas las coordenadas dentro de un rango
 * Manual: Usado para determinar área de movimiento de personajes
 */
function getHexCoordinatesInRange(center, range) {
    const results = [];
    for (let q = -range; q <= range; q++) {
        for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
            const s = -q - r;
            const coord = { q: center.q + q, r: center.r + r, s: center.s + s };
            if (hexDistance(center, coord) <= range) {
                results.push(coord);
            }
        }
    }
    return results;
}
/**
 * Verifica si dos coordenadas son iguales
 */
function hexEquals(a, b) {
    return a.q === b.q && a.r === b.r && a.s === b.s;
}
/**
 * Convierte coordenadas hex a string único (para usar como clave)
 */
function hexToString(coord) {
    return `${coord.q},${coord.r},${coord.s}`;
}
/**
 * Convierte string a coordenadas hex
 */
function stringToHex(str) {
    const [q, r, s] = str.split(',').map(Number);
    return { q, r, s };
}
/**
 * Calcula el camino más corto entre dos coordenadas
 * Manual: Usado para movimiento de personajes y alienígena
 */
function hexPath(start, end) {
    const distance = hexDistance(start, end);
    const path = [];
    for (let i = 0; i <= distance; i++) {
        const t = distance === 0 ? 0 : i / distance;
        const q = start.q + (end.q - start.q) * t;
        const r = start.r + (end.r - start.r) * t;
        const s = start.s + (end.s - start.s) * t;
        // Redondear a las coordenadas hexagonales más cercanas
        path.push(hexRound({ q, r, s }));
    }
    return path;
}
/**
 * Redondea coordenadas flotantes a la casilla hexagonal más cercana
 */
function hexRound(coord) {
    let q = Math.round(coord.q);
    let r = Math.round(coord.r);
    let s = Math.round(coord.s);
    const qDiff = Math.abs(q - coord.q);
    const rDiff = Math.abs(r - coord.r);
    const sDiff = Math.abs(s - coord.s);
    if (qDiff > rDiff && qDiff > sDiff) {
        q = -r - s;
    }
    else if (rDiff > sDiff) {
        r = -q - s;
    }
    else {
        s = -q - r;
    }
    return { q, r, s };
}
//# sourceMappingURL=hex.js.map