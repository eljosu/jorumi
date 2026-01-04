/**
 * JORUMI Game Engine - Game Constants
 * 
 * Constantes del juego según el manual oficial
 */

import { ResourceType, BuildingType, CharacterType } from './types';

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================

export const INITIAL_CONFIG = {
  STARTING_GHETTOS: 2,
  STARTING_POPULATION_PER_GHETTO: 10,
  STARTING_CHARACTERS_PER_TYPE: 1,
  INITIAL_RESOURCES: {
    [ResourceType.FOOD]: 5,
    [ResourceType.MEDICINE]: 3,
    [ResourceType.METAL]: 2,
    [ResourceType.MINERALS]: 0,
  },
  ALIEN_INITIAL_SHIELD: 3,
  ALIEN_INITIAL_CONTROL_TOKENS: 2,
  MOTHERSHIP_INITIAL_HEALTH: 20,
  MOTHERSHIP_INITIAL_SHIELD: 5,
} as const;

// ============================================================================
// COSTOS DE CONSTRUCCIÓN
// ============================================================================

/**
 * Manual: Costos de recursos para construir edificios
 */
export const BUILDING_COSTS = {
  [BuildingType.BUNKER]: {
    [ResourceType.METAL]: 3,
    [ResourceType.FOOD]: 0,
    [ResourceType.MEDICINE]: 0,
    [ResourceType.MINERALS]: 0,
  },
  [BuildingType.HOSPITAL]: {
    [ResourceType.METAL]: 2,
    [ResourceType.MEDICINE]: 2,
    [ResourceType.FOOD]: 0,
    [ResourceType.MINERALS]: 0,
  },
  [BuildingType.WORKSHOP]: {
    [ResourceType.METAL]: 4,
    [ResourceType.FOOD]: 0,
    [ResourceType.MEDICINE]: 0,
    [ResourceType.MINERALS]: 0,
  },
  [BuildingType.BEACON]: {
    [ResourceType.METAL]: 5,
    [ResourceType.MINERALS]: 3,
    [ResourceType.FOOD]: 0,
    [ResourceType.MEDICINE]: 0,
  },
} as const;

// ============================================================================
// CAPACIDADES DE PERSONAJES
// ============================================================================

/**
 * Manual: Capacidades de recolección por tipo de personaje
 */
export const CHARACTER_GATHERING_CAPACITY = {
  [CharacterType.PEASANT]: {
    [ResourceType.FOOD]: 3,
  },
  [CharacterType.MINER]: {
    [ResourceType.MINERALS]: 2,
    [ResourceType.METAL]: 2,
  },
  [CharacterType.DOCTOR]: {
    healsPerAction: 2,
  },
  [CharacterType.SOLDIER]: {
    attackPower: 3,
  },
  [CharacterType.CONSTRUCTOR]: {
    buildSpeed: 1, // Turnos necesarios para construir
  },
} as const;

// ============================================================================
// MECÁNICAS DE SUPERVIVENCIA
// ============================================================================

/**
 * Manual: Consumo de comida y mecánicas de supervivencia
 */
export const SURVIVAL_MECHANICS = {
  FOOD_CONSUMPTION_PER_HUMAN: 1,        // Comida por humano por turno
  STARVATION_DEATHS_RATIO: 0.5,        // 50% de humanos mueren sin comida
  MEDICINE_TO_HEAL_ONE: 1,             // Medicina para curar un herido
  WOUNDED_TO_DEAD_RATIO: 0.3,          // 30% de heridos mueren sin medicina
} as const;

// ============================================================================
// MECÁNICAS DE COMBATE
// ============================================================================

/**
 * Manual: Mecánicas de combate y daño
 */
export const COMBAT_MECHANICS = {
  SOLDIER_BASE_ATTACK: 3,
  ALIEN_BASE_DEFENSE: 2,
  SHIELD_DAMAGE_REDUCTION: 1,
  MOTHERSHIP_CRITICAL_HIT_CHANCE: 0.16, // 1/6 en dado especial
  BOMB_DESTROYS_TILE: true,
} as const;

// ============================================================================
// DISTANCIAS Y MOVIMIENTO
// ============================================================================

/**
 * Manual: Reglas de movimiento en mapa hexagonal
 */
export const MOVEMENT_RULES = {
  CHARACTER_MOVE_RANGE: 2,    // Casillas por turno
  ALIEN_MOVE_RANGE: 3,        // Casillas por turno alienígena
  ADJACENT_DISTANCE: 1,
} as const;

// ============================================================================
// CONDICIONES DE VICTORIA
// ============================================================================

/**
 * Manual: Requisitos para cada condición de victoria
 */
export const VICTORY_REQUIREMENTS = {
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
} as const;

// ============================================================================
// CONVERSIONES DE RECURSOS
// ============================================================================

/**
 * Manual: Conversiones posibles en el taller (workshop)
 */
export const WORKSHOP_CONVERSIONS = [
  {
    name: 'Metal to Minerals',
    input: { [ResourceType.METAL]: 2 },
    output: { [ResourceType.MINERALS]: 1 },
  },
  {
    name: 'Food to Medicine',
    input: { [ResourceType.FOOD]: 3 },
    output: { [ResourceType.MEDICINE]: 1 },
  },
] as const;

// ============================================================================
// CONFIGURACIÓN DE DADOS
// ============================================================================

/**
 * Manual: Configuración de caras de dados personalizados
 */
export const DICE_CONFIGURATION = {
  ALIEN_ATTACK_FACES: ['SHIELD', 'SHIELD', 'CONTROL', 'ATTACK', 'ATTACK', 'DOUBLE_ATTACK'],
  ALIEN_ACTION_FACES: ['MOVE', 'MOVE', 'SCAN', 'SCAN', 'BOMB', 'SPECIAL'],
  STANDARD_D6_FACES: [1, 2, 3, 4, 5, 6],
  COMBAT_D6_FACES: [1, 2, 3, 4, 5, 6],
} as const;

// ============================================================================
// LÍMITES DEL JUEGO
// ============================================================================

export const GAME_LIMITS = {
  MAX_TILES: 50,
  MAX_GHETTOS: 5,
  MAX_CHARACTERS_PER_TYPE: 3,
  MAX_BUILDINGS_PER_GHETTO: 4,
  MAX_TURNS: 50, // Límite opcional para evitar partidas infinitas
  MAX_ALIEN_SHIELD: 6,
  MAX_CONTROL_TOKENS: 5,
} as const;


