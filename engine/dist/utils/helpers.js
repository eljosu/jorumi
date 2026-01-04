"use strict";
/**
 * JORUMI Game Engine - Helper Utilities
 *
 * Funciones auxiliares generales
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyInventory = createEmptyInventory;
exports.cloneInventory = cloneInventory;
exports.addInventories = addInventories;
exports.subtractInventories = subtractInventories;
exports.hasEnoughResources = hasEnoughResources;
exports.getTotalResources = getTotalResources;
exports.generateId = generateId;
exports.deepClone = deepClone;
exports.inRange = inRange;
exports.clamp = clamp;
exports.shuffle = shuffle;
exports.randomElement = randomElement;
const types_1 = require("../domain/types");
/**
 * Crea un inventario de recursos vacío
 */
function createEmptyInventory() {
    return {
        [types_1.ResourceType.FOOD]: 0,
        [types_1.ResourceType.MEDICINE]: 0,
        [types_1.ResourceType.METAL]: 0,
        [types_1.ResourceType.MINERALS]: 0,
    };
}
/**
 * Clona un inventario de recursos
 */
function cloneInventory(inventory) {
    return {
        [types_1.ResourceType.FOOD]: inventory[types_1.ResourceType.FOOD],
        [types_1.ResourceType.MEDICINE]: inventory[types_1.ResourceType.MEDICINE],
        [types_1.ResourceType.METAL]: inventory[types_1.ResourceType.METAL],
        [types_1.ResourceType.MINERALS]: inventory[types_1.ResourceType.MINERALS],
    };
}
/**
 * Suma dos inventarios
 */
function addInventories(a, b) {
    return {
        [types_1.ResourceType.FOOD]: a[types_1.ResourceType.FOOD] + (b[types_1.ResourceType.FOOD] ?? 0),
        [types_1.ResourceType.MEDICINE]: a[types_1.ResourceType.MEDICINE] + (b[types_1.ResourceType.MEDICINE] ?? 0),
        [types_1.ResourceType.METAL]: a[types_1.ResourceType.METAL] + (b[types_1.ResourceType.METAL] ?? 0),
        [types_1.ResourceType.MINERALS]: a[types_1.ResourceType.MINERALS] + (b[types_1.ResourceType.MINERALS] ?? 0),
    };
}
/**
 * Resta inventarios (no permite negativos)
 */
function subtractInventories(a, b) {
    return {
        [types_1.ResourceType.FOOD]: Math.max(0, a[types_1.ResourceType.FOOD] - (b[types_1.ResourceType.FOOD] ?? 0)),
        [types_1.ResourceType.MEDICINE]: Math.max(0, a[types_1.ResourceType.MEDICINE] - (b[types_1.ResourceType.MEDICINE] ?? 0)),
        [types_1.ResourceType.METAL]: Math.max(0, a[types_1.ResourceType.METAL] - (b[types_1.ResourceType.METAL] ?? 0)),
        [types_1.ResourceType.MINERALS]: Math.max(0, a[types_1.ResourceType.MINERALS] - (b[types_1.ResourceType.MINERALS] ?? 0)),
    };
}
/**
 * Verifica si un inventario tiene suficientes recursos
 */
function hasEnoughResources(inventory, required) {
    return (inventory[types_1.ResourceType.FOOD] >= (required[types_1.ResourceType.FOOD] ?? 0) &&
        inventory[types_1.ResourceType.MEDICINE] >= (required[types_1.ResourceType.MEDICINE] ?? 0) &&
        inventory[types_1.ResourceType.METAL] >= (required[types_1.ResourceType.METAL] ?? 0) &&
        inventory[types_1.ResourceType.MINERALS] >= (required[types_1.ResourceType.MINERALS] ?? 0));
}
/**
 * Calcula el total de recursos en un inventario
 */
function getTotalResources(inventory) {
    return (inventory[types_1.ResourceType.FOOD] +
        inventory[types_1.ResourceType.MEDICINE] +
        inventory[types_1.ResourceType.METAL] +
        inventory[types_1.ResourceType.MINERALS]);
}
/**
 * Genera un ID único
 */
function generateId(prefix) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
}
/**
 * Clona profundo de un objeto (solo para objetos serializables)
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Verifica si un número está en un rango
 */
function inRange(value, min, max) {
    return value >= min && value <= max;
}
/**
 * Clamp un valor entre min y max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * Shuffle un array (Fisher-Yates)
 */
function shuffle(array, rng) {
    const result = [...array];
    const random = rng ?? Math.random;
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
/**
 * Selecciona un elemento aleatorio de un array
 */
function randomElement(array, rng) {
    if (array.length === 0) {
        throw new Error('Cannot select from empty array');
    }
    const random = rng ?? Math.random;
    const index = Math.floor(random() * array.length);
    return array[index];
}
//# sourceMappingURL=helpers.js.map