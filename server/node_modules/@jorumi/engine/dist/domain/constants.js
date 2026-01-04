"use strict";
/**
 * JORUMI Game Engine - Game Constants
 *
 * Constantes del juego según el manual oficial
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_LIMITS = exports.DICE_CONFIGURATION = exports.WORKSHOP_CONVERSIONS = exports.VICTORY_REQUIREMENTS = exports.MOVEMENT_RULES = exports.COMBAT_MECHANICS = exports.SURVIVAL_MECHANICS = exports.CHARACTER_GATHERING_CAPACITY = exports.BUILDING_COSTS = exports.INITIAL_CONFIG = void 0;
const types_1 = require("./types");
// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================
exports.INITIAL_CONFIG = {
    STARTING_GHETTOS: 2,
    STARTING_POPULATION_PER_GHETTO: 10,
    STARTING_CHARACTERS_PER_TYPE: 1,
    INITIAL_RESOURCES: {
        [types_1.ResourceType.FOOD]: 5,
        [types_1.ResourceType.MEDICINE]: 3,
        [types_1.ResourceType.METAL]: 2,
        [types_1.ResourceType.MINERALS]: 0,
    },
    ALIEN_INITIAL_SHIELD: 3,
    ALIEN_INITIAL_CONTROL_TOKENS: 2,
    MOTHERSHIP_INITIAL_HEALTH: 20,
    MOTHERSHIP_INITIAL_SHIELD: 5,
};
// ============================================================================
// COSTOS DE CONSTRUCCIÓN
// ============================================================================
/**
 * Manual: Costos de recursos para construir edificios
 */
exports.BUILDING_COSTS = {
    [types_1.BuildingType.BUNKER]: {
        [types_1.ResourceType.METAL]: 3,
        [types_1.ResourceType.FOOD]: 0,
        [types_1.ResourceType.MEDICINE]: 0,
        [types_1.ResourceType.MINERALS]: 0,
    },
    [types_1.BuildingType.HOSPITAL]: {
        [types_1.ResourceType.METAL]: 2,
        [types_1.ResourceType.MEDICINE]: 2,
        [types_1.ResourceType.FOOD]: 0,
        [types_1.ResourceType.MINERALS]: 0,
    },
    [types_1.BuildingType.WORKSHOP]: {
        [types_1.ResourceType.METAL]: 4,
        [types_1.ResourceType.FOOD]: 0,
        [types_1.ResourceType.MEDICINE]: 0,
        [types_1.ResourceType.MINERALS]: 0,
    },
    [types_1.BuildingType.BEACON]: {
        [types_1.ResourceType.METAL]: 5,
        [types_1.ResourceType.MINERALS]: 3,
        [types_1.ResourceType.FOOD]: 0,
        [types_1.ResourceType.MEDICINE]: 0,
    },
};
// ============================================================================
// CAPACIDADES DE PERSONAJES
// ============================================================================
/**
 * Manual: Capacidades de recolección por tipo de personaje
 */
exports.CHARACTER_GATHERING_CAPACITY = {
    [types_1.CharacterType.PEASANT]: {
        [types_1.ResourceType.FOOD]: 3,
    },
    [types_1.CharacterType.MINER]: {
        [types_1.ResourceType.MINERALS]: 2,
        [types_1.ResourceType.METAL]: 2,
    },
    [types_1.CharacterType.DOCTOR]: {
        healsPerAction: 2,
    },
    [types_1.CharacterType.SOLDIER]: {
        attackPower: 3,
    },
    [types_1.CharacterType.CONSTRUCTOR]: {
        buildSpeed: 1, // Turnos necesarios para construir
    },
};
// ============================================================================
// MECÁNICAS DE SUPERVIVENCIA
// ============================================================================
/**
 * Manual: Consumo de comida y mecánicas de supervivencia
 */
exports.SURVIVAL_MECHANICS = {
    FOOD_CONSUMPTION_PER_HUMAN: 1, // Comida por humano por turno
    STARVATION_DEATHS_RATIO: 0.5, // 50% de humanos mueren sin comida
    MEDICINE_TO_HEAL_ONE: 1, // Medicina para curar un herido
    WOUNDED_TO_DEAD_RATIO: 0.3, // 30% de heridos mueren sin medicina
};
// ============================================================================
// MECÁNICAS DE COMBATE
// ============================================================================
/**
 * Manual: Mecánicas de combate y daño
 */
exports.COMBAT_MECHANICS = {
    SOLDIER_BASE_ATTACK: 3,
    ALIEN_BASE_DEFENSE: 2,
    SHIELD_DAMAGE_REDUCTION: 1,
    MOTHERSHIP_CRITICAL_HIT_CHANCE: 0.16, // 1/6 en dado especial
    BOMB_DESTROYS_TILE: true,
};
// ============================================================================
// DISTANCIAS Y MOVIMIENTO
// ============================================================================
/**
 * Manual: Reglas de movimiento en mapa hexagonal
 */
exports.MOVEMENT_RULES = {
    CHARACTER_MOVE_RANGE: 2, // Casillas por turno
    ALIEN_MOVE_RANGE: 3, // Casillas por turno alienígena
    ADJACENT_DISTANCE: 1,
};
// ============================================================================
// CONDICIONES DE VICTORIA
// ============================================================================
/**
 * Manual: Requisitos para cada condición de victoria
 */
exports.VICTORY_REQUIREMENTS = {
    MOTHERSHIP_DESTROYED: {
        mothershipHealth: 0,
    },
    ESCAPE_SHIP: {
        minimumHumans: 5,
        requiresAuxiliaryShip: true,
    },
    BEACON_ACTIVATED: {
        requiresBeacon: true,
        turnsToWait: 3,
    },
    TOTAL_DEFEAT: {
        maximumHumans: 0,
    },
};
// ============================================================================
// CONVERSIONES DE RECURSOS
// ============================================================================
/**
 * Manual: Conversiones posibles en el taller (workshop)
 */
exports.WORKSHOP_CONVERSIONS = [
    {
        name: 'Metal to Minerals',
        input: { [types_1.ResourceType.METAL]: 2 },
        output: { [types_1.ResourceType.MINERALS]: 1 },
    },
    {
        name: 'Food to Medicine',
        input: { [types_1.ResourceType.FOOD]: 3 },
        output: { [types_1.ResourceType.MEDICINE]: 1 },
    },
];
// ============================================================================
// CONFIGURACIÓN DE DADOS
// ============================================================================
/**
 * Manual: Configuración de caras de dados personalizados
 */
exports.DICE_CONFIGURATION = {
    ALIEN_ATTACK_FACES: ['SHIELD', 'SHIELD', 'CONTROL', 'ATTACK', 'ATTACK', 'DOUBLE_ATTACK'],
    ALIEN_ACTION_FACES: ['MOVE', 'MOVE', 'SCAN', 'SCAN', 'BOMB', 'SPECIAL'],
    STANDARD_D6_FACES: [1, 2, 3, 4, 5, 6],
    COMBAT_D6_FACES: [1, 2, 3, 4, 5, 6],
};
// ============================================================================
// LÍMITES DEL JUEGO
// ============================================================================
exports.GAME_LIMITS = {
    MAX_TILES: 50,
    MAX_GHETTOS: 5,
    MAX_CHARACTERS_PER_TYPE: 3,
    MAX_BUILDINGS_PER_GHETTO: 4,
    MAX_TURNS: 50, // Límite opcional para evitar partidas infinitas
    MAX_ALIEN_SHIELD: 6,
    MAX_CONTROL_TOKENS: 5,
};
//# sourceMappingURL=constants.js.map