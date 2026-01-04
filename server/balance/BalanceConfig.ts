/**
 * JORUMI Balance System - Balance Configuration
 * 
 * Configuración centralizada de todos los parámetros ajustables del juego.
 * Estos parámetros permiten ajustar el balance sin modificar las reglas base.
 * 
 * PRINCIPIOS:
 * - Todos los valores son explícitos y documentados
 * - Cada parámetro tiene un rango válido
 * - Los valores por defecto corresponden al manual original
 * - Los cambios son rastreables y reproducibles
 */

import { ResourceType, BuildingType, CharacterType } from '../../engine/domain/types';

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

/**
 * Configuración completa de balance del juego
 */
export interface BalanceConfig {
  // Identificación y metadata
  id: string;
  name: string;
  version: string;
  description: string;
  createdAt: Date;
  
  // Configuración inicial
  initial: InitialConfig;
  
  // Supervivencia
  survival: SurvivalConfig;
  
  // Combate
  combat: CombatConfig;
  
  // Recolección de recursos
  gathering: GatheringConfig;
  
  // Construcción
  building: BuildingConfig;
  
  // Alienígena
  alien: AlienConfig;
  
  // Condiciones de victoria
  victory: VictoryConfig;
  
  // Movimiento
  movement: MovementConfig;
  
  // Límites del juego
  limits: GameLimits;
}

/**
 * Configuración inicial del juego
 */
export interface InitialConfig {
  // Guettos
  startingGhettos: number;              // [1-3] Cantidad inicial de guettos
  populationPerGhetto: number;          // [5-15] Humanos por guetto al inicio
  charactersPerType: number;            // [1-3] Personajes de cada tipo
  
  // Recursos iniciales por guetto
  initialFood: number;                  // [2-10] Comida inicial
  initialMedicine: number;              // [1-5] Medicina inicial
  initialMetal: number;                 // [1-5] Metal inicial
  initialMinerals: number;              // [0-3] Minerales iniciales
}

/**
 * Configuración de supervivencia
 */
export interface SurvivalConfig {
  // Consumo de comida
  foodConsumptionPerHuman: number;      // [0.5-2] Comida por humano por turno
  starvationDeathsRatio: number;        // [0.2-0.8] % de muertes sin comida
  
  // Medicina y heridos
  medicineToHealOne: number;            // [0.5-2] Medicina para curar 1 herido
  woundedToDeadRatio: number;           // [0.1-0.5] % de heridos que mueren
  
  // Eventos aleatorios
  foodShortageProbability: number;      // [0-0.3] Probabilidad de escasez de comida
  foodShortageLossRatio: number;        // [0.2-0.5] % de comida perdida en escasez
}

/**
 * Configuración de combate
 */
export interface CombatConfig {
  // Daño base
  soldierBaseAttack: number;            // [2-5] Ataque base del soldado
  alienBaseDefense: number;             // [1-4] Defensa base alienígena
  shieldDamageReduction: number;        // [0.5-2] Reducción de daño por escudo
  
  // Críticos y efectos especiales
  mothershipCriticalHitChance: number;  // [0.1-0.3] Probabilidad de golpe crítico
  criticalHitMultiplier: number;        // [1.5-3] Multiplicador de daño crítico
  
  // Daño de ataques alienígenas
  alienAttackDamage: number;            // [1-4] Daño de ataque simple
  alienDoubleAttackDamage: number;      // [2-6] Daño de ataque doble
  
  // Bombas
  bombDestroysTile: boolean;            // Si las bombas destruyen losetas
  bombCollateralDamage: number;         // [0-3] Daño colateral a humanos
}

/**
 * Configuración de recolección de recursos
 */
export interface GatheringConfig {
  // Capacidades por personaje
  peasantFood: number;                  // [2-5] Comida por campesino
  minerMinerals: number;                // [1-3] Minerales por minero
  minerMetal: number;                   // [1-3] Metal por minero
  
  // Bonificaciones
  forestFoodBonus: number;              // [0-2] Bonus de comida en bosque
  mineMineralBonus: number;             // [0-2] Bonus de minerales en mina
  ruinsResourceMultiplier: number;      // [1-2] Multiplicador en ruinas
  
  // Eficiencia
  gatheringEfficiency: number;          // [0.5-1.5] Multiplicador global de recolección
}

/**
 * Configuración de construcción
 */
export interface BuildingConfig {
  // Costos de edificios
  bunkerMetalCost: number;              // [2-5] Metal para búnker
  hospitalMetalCost: number;            // [1-4] Metal para hospital
  hospitalMedicineCost: number;         // [1-4] Medicina para hospital
  workshopMetalCost: number;            // [3-6] Metal para taller
  beaconMetalCost: number;              // [4-8] Metal para baliza
  beaconMineralCost: number;            // [2-5] Minerales para baliza
  
  // Efectos de edificios
  bunkerDamageReduction: number;        // [1-4] Reducción de daño del búnker
  hospitalHealingBonus: number;         // [1-4] Bonus de curación del hospital
  
  // Conversiones en taller
  metalToMineralsCost: number;          // [2-4] Metal para 1 mineral
  foodToMedicineCost: number;           // [2-5] Comida para 1 medicina
}

/**
 * Configuración alienígena
 */
export interface AlienConfig {
  // Estado inicial
  initialShield: number;                // [2-5] Escudo inicial
  initialControlTokens: number;         // [1-4] Tokens de control iniciales
  mothershipInitialHealth: number;      // [15-30] Vida inicial de nave
  mothershipInitialShield: number;      // [3-8] Escudo inicial de nave
  
  // Regeneración
  shieldRegenerationRate: number;       // [0-2] Escudo regenerado por turno
  shieldRegenerationThreshold: number;  // [1-3] Escudo mínimo para regenerar
  
  // Control de guettos
  controlTokensPerTurn: number;         // [0-2] Tokens ganados por turno
  controlCost: number;                  // [1-3] Tokens para controlar 1 guetto
  
  // Daño a humanos
  attackWoundedRatio: number;           // [0.3-0.7] % de humanos heridos en ataque
  controlResourceStealRatio: number;    // [0.2-0.6] % de recursos robados al controlar
}

/**
 * Configuración de condiciones de victoria
 */
export interface VictoryConfig {
  // Victoria humana - Nave destruida
  mothershipDestroyedThreshold: number; // [0] Vida de nave para victoria
  
  // Victoria humana - Escape
  escapeShipMinimumHumans: number;      // [3-8] Humanos mínimos para escapar
  escapeShipRequiresAuxiliary: boolean; // Si requiere nave auxiliar
  
  // Victoria humana - Baliza
  beaconActivationTurns: number;        // [2-5] Turnos para activar baliza
  beaconRequiresDefense: boolean;       // Si requiere defensa durante activación
  
  // Derrota - Extinción
  totalDefeatThreshold: number;         // [0] Humanos restantes para derrota
  
  // Límite de turnos
  maxTurnsUntilAlienVictory: number;    // [30-100] Turnos hasta victoria alienígena
}

/**
 * Configuración de movimiento
 */
export interface MovementConfig {
  characterMoveRange: number;           // [1-3] Casillas por turno (personajes)
  alienMoveRange: number;               // [2-4] Casillas por turno (alienígena)
  adjacentDistance: number;             // [1] Distancia considerada "adyacente"
}

/**
 * Límites del juego
 */
export interface GameLimits {
  maxTiles: number;                     // [30-100] Máximo de losetas
  maxGhettos: number;                   // [3-8] Máximo de guettos
  maxCharactersPerType: number;         // [2-5] Máximo de personajes por tipo
  maxBuildingsPerGhetto: number;        // [3-6] Máximo de edificios por guetto
  maxTurns: number;                     // [40-100] Turnos máximos
  maxAlienShield: number;               // [4-8] Escudo máximo alienígena
  maxControlTokens: number;             // [3-8] Tokens de control máximos
}

// ============================================================================
// CONFIGURACIÓN POR DEFECTO (MANUAL ORIGINAL)
// ============================================================================

/**
 * Configuración de balance por defecto - Corresponde al manual original
 */
export const DEFAULT_BALANCE_CONFIG: BalanceConfig = {
  id: 'default',
  name: 'Balance Original',
  version: '1.0.0',
  description: 'Configuración de balance según el manual oficial de JORUMI',
  createdAt: new Date('2025-01-01'),
  
  initial: {
    startingGhettos: 2,
    populationPerGhetto: 10,
    charactersPerType: 1,
    initialFood: 5,
    initialMedicine: 3,
    initialMetal: 2,
    initialMinerals: 0,
  },
  
  survival: {
    foodConsumptionPerHuman: 1,
    starvationDeathsRatio: 0.5,
    medicineToHealOne: 1,
    woundedToDeadRatio: 0.3,
    foodShortageProbability: 0.15,
    foodShortageLossRatio: 0.3,
  },
  
  combat: {
    soldierBaseAttack: 3,
    alienBaseDefense: 2,
    shieldDamageReduction: 1,
    mothershipCriticalHitChance: 0.166,
    criticalHitMultiplier: 2,
    alienAttackDamage: 2,
    alienDoubleAttackDamage: 4,
    bombDestroysTile: true,
    bombCollateralDamage: 1,
  },
  
  gathering: {
    peasantFood: 3,
    minerMinerals: 2,
    minerMetal: 2,
    forestFoodBonus: 1,
    mineMineralBonus: 1,
    ruinsResourceMultiplier: 1.5,
    gatheringEfficiency: 1.0,
  },
  
  building: {
    bunkerMetalCost: 3,
    hospitalMetalCost: 2,
    hospitalMedicineCost: 2,
    workshopMetalCost: 4,
    beaconMetalCost: 5,
    beaconMineralCost: 3,
    bunkerDamageReduction: 2,
    hospitalHealingBonus: 2,
    metalToMineralsCost: 2,
    foodToMedicineCost: 3,
  },
  
  alien: {
    initialShield: 3,
    initialControlTokens: 2,
    mothershipInitialHealth: 20,
    mothershipInitialShield: 5,
    shieldRegenerationRate: 1,
    shieldRegenerationThreshold: 2,
    controlTokensPerTurn: 1,
    controlCost: 1,
    attackWoundedRatio: 0.5,
    controlResourceStealRatio: 0.4,
  },
  
  victory: {
    mothershipDestroyedThreshold: 0,
    escapeShipMinimumHumans: 5,
    escapeShipRequiresAuxiliary: true,
    beaconActivationTurns: 3,
    beaconRequiresDefense: false,
    totalDefeatThreshold: 0,
    maxTurnsUntilAlienVictory: 50,
  },
  
  movement: {
    characterMoveRange: 2,
    alienMoveRange: 3,
    adjacentDistance: 1,
  },
  
  limits: {
    maxTiles: 50,
    maxGhettos: 5,
    maxCharactersPerType: 3,
    maxBuildingsPerGhetto: 4,
    maxTurns: 50,
    maxAlienShield: 6,
    maxControlTokens: 5,
  },
};

// ============================================================================
// RANGOS VÁLIDOS
// ============================================================================

/**
 * Rangos válidos para cada parámetro (para validación y tuning)
 */
export interface ParameterRanges {
  [key: string]: {
    min: number;
    max: number;
    step: number;
    description: string;
  };
}

export const PARAMETER_RANGES: ParameterRanges = {
  // Initial
  'initial.startingGhettos': { min: 1, max: 3, step: 1, description: 'Guettos iniciales' },
  'initial.populationPerGhetto': { min: 5, max: 15, step: 1, description: 'Población inicial' },
  'initial.initialFood': { min: 2, max: 10, step: 1, description: 'Comida inicial' },
  
  // Survival
  'survival.foodConsumptionPerHuman': { min: 0.5, max: 2, step: 0.1, description: 'Consumo de comida' },
  'survival.starvationDeathsRatio': { min: 0.2, max: 0.8, step: 0.05, description: 'Ratio de muertes por inanición' },
  
  // Combat
  'combat.soldierBaseAttack': { min: 2, max: 5, step: 0.5, description: 'Ataque base del soldado' },
  'combat.alienAttackDamage': { min: 1, max: 4, step: 0.5, description: 'Daño de ataque alienígena' },
  
  // Gathering
  'gathering.peasantFood': { min: 2, max: 5, step: 0.5, description: 'Comida recolectada por campesino' },
  'gathering.gatheringEfficiency': { min: 0.5, max: 1.5, step: 0.1, description: 'Eficiencia global de recolección' },
  
  // Alien
  'alien.initialShield': { min: 2, max: 5, step: 1, description: 'Escudo inicial alienígena' },
  'alien.mothershipInitialHealth': { min: 15, max: 30, step: 1, description: 'Vida inicial nave nodriza' },
  'alien.shieldRegenerationRate': { min: 0, max: 2, step: 0.5, description: 'Regeneración de escudo' },
  
  // Victory
  'victory.escapeShipMinimumHumans': { min: 3, max: 8, step: 1, description: 'Humanos mínimos para escapar' },
  'victory.beaconActivationTurns': { min: 2, max: 5, step: 1, description: 'Turnos para activar baliza' },
  'victory.maxTurnsUntilAlienVictory': { min: 30, max: 100, step: 5, description: 'Turnos máximos' },
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Clona una configuración de balance
 */
export function cloneBalanceConfig(config: BalanceConfig): BalanceConfig {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Valida que una configuración esté dentro de los rangos permitidos
 */
export function validateBalanceConfig(config: BalanceConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validar rangos básicos
  if (config.initial.startingGhettos < 1 || config.initial.startingGhettos > 3) {
    errors.push('startingGhettos debe estar entre 1 y 3');
  }
  
  if (config.initial.populationPerGhetto < 5 || config.initial.populationPerGhetto > 15) {
    errors.push('populationPerGhetto debe estar entre 5 y 15');
  }
  
  if (config.survival.starvationDeathsRatio < 0 || config.survival.starvationDeathsRatio > 1) {
    errors.push('starvationDeathsRatio debe estar entre 0 y 1');
  }
  
  // Validar lógica del juego
  if (config.alien.mothershipInitialHealth <= 0) {
    errors.push('mothershipInitialHealth debe ser mayor que 0');
  }
  
  if (config.victory.escapeShipMinimumHumans > config.initial.populationPerGhetto * config.initial.startingGhettos) {
    errors.push('escapeShipMinimumHumans no puede ser mayor que la población inicial total');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Crea una configuración personalizada a partir de la default
 */
export function createCustomConfig(
  name: string,
  description: string,
  overrides: Partial<BalanceConfig>
): BalanceConfig {
  const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG);
  
  return {
    ...config,
    ...overrides,
    id: `custom-${Date.now()}`,
    name,
    description,
    createdAt: new Date(),
  };
}

/**
 * Serializa una configuración a JSON
 */
export function serializeConfig(config: BalanceConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Deserializa una configuración desde JSON
 */
export function deserializeConfig(json: string): BalanceConfig {
  const config = JSON.parse(json);
  config.createdAt = new Date(config.createdAt);
  return config;
}



