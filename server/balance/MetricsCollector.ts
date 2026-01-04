/**
 * JORUMI Balance System - Metrics Collector
 * 
 * Sistema de recolección y agregación de métricas de partidas.
 * Registra estadísticas clave durante las simulaciones para análisis de balance.
 * 
 * PRINCIPIOS:
 * - Métricas inmutables y reproducibles
 * - Agregación eficiente de múltiples partidas
 * - Soporte para análisis estadístico
 * - No afecta al motor de juego
 */

import {
  GameState,
  VictoryCondition,
  PlayerRole,
  GhettoControlStatus,
} from '../../engine/domain/types';
import { BalanceConfig } from './BalanceConfig';

// ============================================================================
// TIPOS DE MÉTRICAS
// ============================================================================

/**
 * Métricas de una partida individual
 */
export interface GameMetrics {
  // Identificación
  gameId: string;
  configId: string;
  seed: number;
  timestamp: Date;
  
  // Resultado
  winner: PlayerRole;
  victoryCondition: VictoryCondition;
  totalTurns: number;
  
  // Métricas de humanos
  humans: HumanMetrics;
  
  // Métricas alienígenas
  alien: AlienMetrics;
  
  // Métricas de recursos
  resources: ResourceMetrics;
  
  // Métricas de construcción
  buildings: BuildingMetrics;
  
  // Métricas de combate
  combat: CombatMetrics;
  
  // Eventos especiales
  events: GameEvent[];
  
  // Progresión temporal
  turnSnapshots: TurnSnapshot[];
}

/**
 * Métricas relacionadas con humanos
 */
export interface HumanMetrics {
  // Población
  initialPopulation: number;
  finalPopulation: number;
  finalWounded: number;
  totalDeaths: number;
  deathsByStarvation: number;
  deathsByAlienAttack: number;
  deathsByWounds: number;
  
  // Guettos
  initialGhettos: number;
  finalGhettos: number;
  ghettosLost: number;
  ghettosLiberated: number;
  
  // Personajes
  totalCharacterActions: number;
  characterDeaths: number;
  
  // Supervivencia
  turnsWithFoodShortage: number;
  turnsWithMedicineShortage: number;
}

/**
 * Métricas relacionadas con alienígena
 */
export interface AlienMetrics {
  // Estado final
  finalMothershipHealth: number;
  finalMothershipShield: number;
  finalAlienShield: number;
  
  // Daño
  totalDamageReceived: number;
  totalDamageDealt: number;
  timesShieldBroken: number;
  
  // Control
  ghettosControlled: number;
  turnsControllingGhettos: number;
  resourcesStolen: number;
  
  // Acciones
  totalAttacks: number;
  totalBombs: number;
  totalScans: number;
  tilesDestroyed: number;
}

/**
 * Métricas de recursos
 */
export interface ResourceMetrics {
  // Acumulación total
  totalFoodGathered: number;
  totalMedicineGathered: number;
  totalMetalGathered: number;
  totalMineralsGathered: number;
  
  // Consumo
  totalFoodConsumed: number;
  totalMedicineUsed: number;
  totalMetalUsed: number;
  totalMineralsUsed: number;
  
  // Desperdicio
  foodWasted: number;
  medicineWasted: number;
  metalWasted: number;
  mineralsWasted: number;
  
  // Conversiones
  resourcesConverted: number;
  
  // Estado final
  finalFoodStored: number;
  finalMedicineStored: number;
  finalMetalStored: number;
  finalMineralsStored: number;
}

/**
 * Métricas de construcción
 */
export interface BuildingMetrics {
  totalBuildingsConstructed: number;
  bunkersBuilt: number;
  hospitalsBuilt: number;
  workshopsBuilt: number;
  beaconsBuilt: number;
  buildingsDestroyed: number;
  turnsToFirstBuilding: number;
}

/**
 * Métricas de combate
 */
export interface CombatMetrics {
  totalCombatActions: number;
  totalDamageToMothership: number;
  totalDamageToHumans: number;
  criticalHitsLanded: number;
  attacksBlocked: number;
}

/**
 * Evento especial en la partida
 */
export interface GameEvent {
  turn: number;
  type: GameEventType;
  description: string;
  impact: number; // -100 a 100 (negativo = malo para humanos)
}

export enum GameEventType {
  GHETTO_LOST = 'GHETTO_LOST',
  GHETTO_LIBERATED = 'GHETTO_LIBERATED',
  BUILDING_COMPLETED = 'BUILDING_COMPLETED',
  BUILDING_DESTROYED = 'BUILDING_DESTROYED',
  MASS_STARVATION = 'MASS_STARVATION',
  CRITICAL_HIT = 'CRITICAL_HIT',
  SHIELD_BROKEN = 'SHIELD_BROKEN',
  BEACON_ACTIVATED = 'BEACON_ACTIVATED',
  MOTHERSHIP_DAMAGED = 'MOTHERSHIP_DAMAGED',
}

/**
 * Snapshot del estado en un turno específico
 */
export interface TurnSnapshot {
  turn: number;
  humanPopulation: number;
  humanWounded: number;
  ghettosUnderControl: number;
  alienShield: number;
  mothershipHealth: number;
  totalFood: number;
  totalMinerals: number;
}

// ============================================================================
// MÉTRICAS AGREGADAS
// ============================================================================

/**
 * Métricas agregadas de múltiples partidas
 */
export interface AggregatedMetrics {
  // Identificación
  configId: string;
  totalGames: number;
  timestamp: Date;
  
  // Resultados
  results: ResultStatistics;
  
  // Duración
  duration: DurationStatistics;
  
  // Humanos
  humans: AggregatedHumanStats;
  
  // Alienígena
  alien: AggregatedAlienStats;
  
  // Recursos
  resources: AggregatedResourceStats;
  
  // Condiciones de victoria
  victoryConditions: VictoryConditionStats;
  
  // Estabilidad
  stability: StabilityMetrics;
}

/**
 * Estadísticas de resultados
 */
export interface ResultStatistics {
  humanWins: number;
  humanWinRate: number;
  alienWins: number;
  alienWinRate: number;
  
  // Distribución de victorias por tipo
  winsByCondition: Record<VictoryCondition, number>;
}

/**
 * Estadísticas de duración
 */
export interface DurationStatistics {
  averageTurns: number;
  medianTurns: number;
  minTurns: number;
  maxTurns: number;
  standardDeviation: number;
}

/**
 * Estadísticas agregadas de humanos
 */
export interface AggregatedHumanStats {
  avgFinalPopulation: number;
  avgDeaths: number;
  avgStarvationDeaths: number;
  avgCombatDeaths: number;
  survivalRate: number;
  
  avgGhettosLost: number;
  avgTurnsWithShortage: number;
}

/**
 * Estadísticas agregadas de alienígena
 */
export interface AggregatedAlienStats {
  avgFinalHealth: number;
  avgDamageReceived: number;
  avgGhettosControlled: number;
  avgResourcesStolen: number;
  
  avgAttacksPerGame: number;
  avgBombsPerGame: number;
}

/**
 * Estadísticas agregadas de recursos
 */
export interface AggregatedResourceStats {
  avgFoodGathered: number;
  avgFoodConsumed: number;
  avgFoodWasted: number;
  foodUtilizationRate: number;
  
  avgMineralsGathered: number;
  avgMineralsUsed: number;
  mineralUtilizationRate: number;
  
  resourceEfficiency: number;
}

/**
 * Estadísticas por condición de victoria
 */
export interface VictoryConditionStats {
  mothershipDestroyed: {
    count: number;
    avgTurns: number;
    avgFinalPopulation: number;
  };
  escapeShip: {
    count: number;
    avgTurns: number;
    avgFinalPopulation: number;
  };
  beaconActivated: {
    count: number;
    avgTurns: number;
    avgFinalPopulation: number;
  };
  totalDefeat: {
    count: number;
    avgTurns: number;
  };
}

/**
 * Métricas de estabilidad
 */
export interface StabilityMetrics {
  winRateStability: number;      // 0-1: Qué tan consistentes son los resultados
  durationStability: number;     // 0-1: Qué tan consistente es la duración
  outcomeVariance: number;       // Varianza en las condiciones de victoria
  predictability: number;        // 0-1: Qué tan predecible es el resultado
}

// ============================================================================
// COLLECTOR CLASS
// ============================================================================

/**
 * Recolector de métricas de partidas
 */
export class MetricsCollector {
  private metrics: GameMetrics[] = [];
  private config: BalanceConfig;
  
  constructor(config: BalanceConfig) {
    this.config = config;
  }
  
  /**
   * Inicia la recolección de métricas para una nueva partida
   */
  startGame(gameId: string, seed: number): GameMetricsBuilder {
    return new GameMetricsBuilder(gameId, this.config.id, seed);
  }
  
  /**
   * Registra las métricas de una partida completada
   */
  recordGame(metrics: GameMetrics): void {
    this.metrics.push(metrics);
  }
  
  /**
   * Obtiene todas las métricas individuales
   */
  getAllMetrics(): GameMetrics[] {
    return [...this.metrics];
  }
  
  /**
   * Obtiene el número total de partidas registradas
   */
  getTotalGames(): number {
    return this.metrics.length;
  }
  
  /**
   * Agrega todas las métricas en estadísticas consolidadas
   */
  aggregate(): AggregatedMetrics {
    if (this.metrics.length === 0) {
      throw new Error('No metrics to aggregate');
    }
    
    return {
      configId: this.config.id,
      totalGames: this.metrics.length,
      timestamp: new Date(),
      
      results: this.aggregateResults(),
      duration: this.aggregateDuration(),
      humans: this.aggregateHumans(),
      alien: this.aggregateAlien(),
      resources: this.aggregateResources(),
      victoryConditions: this.aggregateVictoryConditions(),
      stability: this.calculateStability(),
    };
  }
  
  /**
   * Limpia todas las métricas
   */
  clear(): void {
    this.metrics = [];
  }
  
  // ========================================================================
  // MÉTODOS DE AGREGACIÓN
  // ========================================================================
  
  private aggregateResults(): ResultStatistics {
    const humanWins = this.metrics.filter(m => m.winner === PlayerRole.HUMAN).length;
    const alienWins = this.metrics.filter(m => m.winner === PlayerRole.ALIEN).length;
    
    const winsByCondition: Record<VictoryCondition, number> = {
      [VictoryCondition.MOTHERSHIP_DESTROYED]: 0,
      [VictoryCondition.ESCAPE_SHIP]: 0,
      [VictoryCondition.BEACON_ACTIVATED]: 0,
      [VictoryCondition.TOTAL_DEFEAT]: 0,
    };
    
    this.metrics.forEach(m => {
      winsByCondition[m.victoryCondition]++;
    });
    
    return {
      humanWins,
      humanWinRate: humanWins / this.metrics.length,
      alienWins,
      alienWinRate: alienWins / this.metrics.length,
      winsByCondition,
    };
  }
  
  private aggregateDuration(): DurationStatistics {
    const turns = this.metrics.map(m => m.totalTurns);
    const sorted = [...turns].sort((a, b) => a - b);
    
    const avg = turns.reduce((a, b) => a + b, 0) / turns.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = turns.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / turns.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      averageTurns: avg,
      medianTurns: median,
      minTurns: sorted[0],
      maxTurns: sorted[sorted.length - 1],
      standardDeviation: stdDev,
    };
  }
  
  private aggregateHumans(): AggregatedHumanStats {
    const n = this.metrics.length;
    
    return {
      avgFinalPopulation: this.avg(m => m.humans.finalPopulation),
      avgDeaths: this.avg(m => m.humans.totalDeaths),
      avgStarvationDeaths: this.avg(m => m.humans.deathsByStarvation),
      avgCombatDeaths: this.avg(m => m.humans.deathsByAlienAttack),
      survivalRate: this.avg(m => m.humans.finalPopulation / m.humans.initialPopulation),
      avgGhettosLost: this.avg(m => m.humans.ghettosLost),
      avgTurnsWithShortage: this.avg(m => m.humans.turnsWithFoodShortage),
    };
  }
  
  private aggregateAlien(): AggregatedAlienStats {
    return {
      avgFinalHealth: this.avg(m => m.alien.finalMothershipHealth),
      avgDamageReceived: this.avg(m => m.alien.totalDamageReceived),
      avgGhettosControlled: this.avg(m => m.alien.ghettosControlled),
      avgResourcesStolen: this.avg(m => m.alien.resourcesStolen),
      avgAttacksPerGame: this.avg(m => m.alien.totalAttacks),
      avgBombsPerGame: this.avg(m => m.alien.totalBombs),
    };
  }
  
  private aggregateResources(): AggregatedResourceStats {
    const avgFoodGathered = this.avg(m => m.resources.totalFoodGathered);
    const avgFoodConsumed = this.avg(m => m.resources.totalFoodConsumed);
    const avgFoodWasted = this.avg(m => m.resources.foodWasted);
    
    const avgMineralsGathered = this.avg(m => m.resources.totalMineralsGathered);
    const avgMineralsUsed = this.avg(m => m.resources.totalMineralsUsed);
    
    return {
      avgFoodGathered,
      avgFoodConsumed,
      avgFoodWasted,
      foodUtilizationRate: avgFoodGathered > 0 ? avgFoodConsumed / avgFoodGathered : 0,
      
      avgMineralsGathered,
      avgMineralsUsed,
      mineralUtilizationRate: avgMineralsGathered > 0 ? avgMineralsUsed / avgMineralsGathered : 0,
      
      resourceEfficiency: this.calculateResourceEfficiency(),
    };
  }
  
  private aggregateVictoryConditions(): VictoryConditionStats {
    const byCondition = (condition: VictoryCondition) => 
      this.metrics.filter(m => m.victoryCondition === condition);
    
    const stats = (condition: VictoryCondition) => {
      const games = byCondition(condition);
      if (games.length === 0) {
        return { count: 0, avgTurns: 0, avgFinalPopulation: 0 };
      }
      
      return {
        count: games.length,
        avgTurns: games.reduce((sum, g) => sum + g.totalTurns, 0) / games.length,
        avgFinalPopulation: games.reduce((sum, g) => sum + g.humans.finalPopulation, 0) / games.length,
      };
    };
    
    return {
      mothershipDestroyed: stats(VictoryCondition.MOTHERSHIP_DESTROYED),
      escapeShip: stats(VictoryCondition.ESCAPE_SHIP),
      beaconActivated: stats(VictoryCondition.BEACON_ACTIVATED),
      totalDefeat: {
        count: byCondition(VictoryCondition.TOTAL_DEFEAT).length,
        avgTurns: stats(VictoryCondition.TOTAL_DEFEAT).avgTurns,
      },
    };
  }
  
  private calculateStability(): StabilityMetrics {
    const results = this.aggregateResults();
    const duration = this.aggregateDuration();
    
    // Win rate stability: Qué tan cerca está del 50-50
    const winRateStability = 1 - Math.abs(0.5 - results.humanWinRate) * 2;
    
    // Duration stability: Coeficiente de variación invertido
    const cv = duration.standardDeviation / duration.averageTurns;
    const durationStability = Math.max(0, 1 - cv);
    
    // Outcome variance: Qué tan distribuidas están las victorias
    const totalWins = this.metrics.length;
    const conditions = Object.values(results.winsByCondition);
    const expectedPerCondition = totalWins / conditions.length;
    const outcomeVariance = conditions.reduce((sum, count) => 
      sum + Math.pow(count - expectedPerCondition, 2), 0) / conditions.length;
    
    // Predictability: Combinación de estabilidades
    const predictability = (winRateStability + durationStability) / 2;
    
    return {
      winRateStability,
      durationStability,
      outcomeVariance,
      predictability,
    };
  }
  
  private calculateResourceEfficiency(): number {
    // Eficiencia = (recursos usados) / (recursos recolectados)
    const totalGathered = this.avg(m => 
      m.resources.totalFoodGathered +
      m.resources.totalMedicineGathered +
      m.resources.totalMetalGathered +
      m.resources.totalMineralsGathered
    );
    
    const totalUsed = this.avg(m =>
      m.resources.totalFoodConsumed +
      m.resources.totalMedicineUsed +
      m.resources.totalMetalUsed +
      m.resources.totalMineralsUsed
    );
    
    return totalGathered > 0 ? totalUsed / totalGathered : 0;
  }
  
  private avg(selector: (m: GameMetrics) => number): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((sum, m) => sum + selector(m), 0) / this.metrics.length;
  }
}

// ============================================================================
// BUILDER PARA MÉTRICAS DE PARTIDA
// ============================================================================

/**
 * Constructor de métricas para una partida individual
 */
export class GameMetricsBuilder {
  private metrics: Partial<GameMetrics>;
  private events: GameEvent[] = [];
  private snapshots: TurnSnapshot[] = [];
  
  constructor(gameId: string, configId: string, seed: number) {
    this.metrics = {
      gameId,
      configId,
      seed,
      timestamp: new Date(),
      events: [],
      turnSnapshots: [],
    };
  }
  
  /**
   * Registra el estado inicial del juego
   */
  recordInitialState(state: GameState): void {
    let totalPopulation = 0;
    state.ghettos.forEach(g => {
      totalPopulation += g.population + g.wounded;
    });
    
    this.metrics.humans = {
      initialPopulation: totalPopulation,
      finalPopulation: 0,
      finalWounded: 0,
      totalDeaths: 0,
      deathsByStarvation: 0,
      deathsByAlienAttack: 0,
      deathsByWounds: 0,
      initialGhettos: state.ghettos.size,
      finalGhettos: 0,
      ghettosLost: 0,
      ghettosLiberated: 0,
      totalCharacterActions: 0,
      characterDeaths: 0,
      turnsWithFoodShortage: 0,
      turnsWithMedicineShortage: 0,
    };
    
    this.metrics.alien = {
      finalMothershipHealth: 0,
      finalMothershipShield: 0,
      finalAlienShield: 0,
      totalDamageReceived: 0,
      totalDamageDealt: 0,
      timesShieldBroken: 0,
      ghettosControlled: 0,
      turnsControllingGhettos: 0,
      resourcesStolen: 0,
      totalAttacks: 0,
      totalBombs: 0,
      totalScans: 0,
      tilesDestroyed: 0,
    };
    
    this.metrics.resources = {
      totalFoodGathered: 0,
      totalMedicineGathered: 0,
      totalMetalGathered: 0,
      totalMineralsGathered: 0,
      totalFoodConsumed: 0,
      totalMedicineUsed: 0,
      totalMetalUsed: 0,
      totalMineralsUsed: 0,
      foodWasted: 0,
      medicineWasted: 0,
      metalWasted: 0,
      mineralsWasted: 0,
      resourcesConverted: 0,
      finalFoodStored: 0,
      finalMedicineStored: 0,
      finalMetalStored: 0,
      finalMineralsStored: 0,
    };
    
    this.metrics.buildings = {
      totalBuildingsConstructed: 0,
      bunkersBuilt: 0,
      hospitalsBuilt: 0,
      workshopsBuilt: 0,
      beaconsBuilt: 0,
      buildingsDestroyed: 0,
      turnsToFirstBuilding: -1,
    };
    
    this.metrics.combat = {
      totalCombatActions: 0,
      totalDamageToMothership: 0,
      totalDamageToHumans: 0,
      criticalHitsLanded: 0,
      attacksBlocked: 0,
    };
  }
  
  /**
   * Registra un snapshot del turno actual
   */
  recordTurnSnapshot(state: GameState): void {
    let totalPopulation = 0;
    let totalWounded = 0;
    let totalFood = 0;
    let totalMinerals = 0;
    let ghettosUnderHumanControl = 0;
    
    state.ghettos.forEach(g => {
      totalPopulation += g.population;
      totalWounded += g.wounded;
      totalFood += g.resources.FOOD;
      totalMinerals += g.resources.MINERALS;
      if (g.controlStatus === GhettoControlStatus.HUMAN) {
        ghettosUnderHumanControl++;
      }
    });
    
    this.snapshots.push({
      turn: state.turn,
      humanPopulation: totalPopulation,
      humanWounded: totalWounded,
      ghettosUnderControl: ghettosUnderHumanControl,
      alienShield: state.alien.shieldLevel,
      mothershipHealth: state.alien.mothershipHealth,
      totalFood,
      totalMinerals,
    });
  }
  
  /**
   * Registra un evento especial
   */
  recordEvent(turn: number, type: GameEventType, description: string, impact: number): void {
    this.events.push({ turn, type, description, impact });
  }
  
  /**
   * Registra muerte de humanos
   */
  recordDeaths(count: number, cause: 'starvation' | 'attack' | 'wounds'): void {
    if (!this.metrics.humans) return;
    
    this.metrics.humans.totalDeaths += count;
    
    switch (cause) {
      case 'starvation':
        this.metrics.humans.deathsByStarvation += count;
        break;
      case 'attack':
        this.metrics.humans.deathsByAlienAttack += count;
        break;
      case 'wounds':
        this.metrics.humans.deathsByWounds += count;
        break;
    }
  }
  
  /**
   * Registra recolección de recursos
   */
  recordResourceGathering(resource: 'food' | 'medicine' | 'metal' | 'minerals', amount: number): void {
    if (!this.metrics.resources) return;
    
    switch (resource) {
      case 'food':
        this.metrics.resources.totalFoodGathered += amount;
        break;
      case 'medicine':
        this.metrics.resources.totalMedicineGathered += amount;
        break;
      case 'metal':
        this.metrics.resources.totalMetalGathered += amount;
        break;
      case 'minerals':
        this.metrics.resources.totalMineralsGathered += amount;
        break;
    }
  }
  
  /**
   * Registra construcción de edificio
   */
  recordBuildingConstructed(type: string, turn: number): void {
    if (!this.metrics.buildings) return;
    
    this.metrics.buildings.totalBuildingsConstructed++;
    
    if (this.metrics.buildings.turnsToFirstBuilding === -1) {
      this.metrics.buildings.turnsToFirstBuilding = turn;
    }
    
    switch (type) {
      case 'BUNKER':
        this.metrics.buildings.bunkersBuilt++;
        break;
      case 'HOSPITAL':
        this.metrics.buildings.hospitalsBuilt++;
        break;
      case 'WORKSHOP':
        this.metrics.buildings.workshopsBuilt++;
        break;
      case 'BEACON':
        this.metrics.buildings.beaconsBuilt++;
        break;
    }
  }
  
  /**
   * Registra daño al alienígena
   */
  recordAlienDamage(damage: number): void {
    if (!this.metrics.alien) return;
    this.metrics.alien.totalDamageReceived += damage;
  }
  
  /**
   * Registra daño a humanos
   */
  recordHumanDamage(damage: number): void {
    if (!this.metrics.combat) return;
    this.metrics.combat.totalDamageToHumans += damage;
  }
  
  /**
   * Finaliza y construye las métricas completas
   */
  build(finalState: GameState): GameMetrics {
    // Registrar estado final
    let finalPopulation = 0;
    let finalWounded = 0;
    let finalGhettos = 0;
    
    finalState.ghettos.forEach(g => {
      finalPopulation += g.population;
      finalWounded += g.wounded;
      if (g.controlStatus === GhettoControlStatus.HUMAN) {
        finalGhettos++;
      }
    });
    
    if (this.metrics.humans) {
      this.metrics.humans.finalPopulation = finalPopulation;
      this.metrics.humans.finalWounded = finalWounded;
      this.metrics.humans.finalGhettos = finalGhettos;
    }
    
    if (this.metrics.alien) {
      this.metrics.alien.finalMothershipHealth = finalState.alien.mothershipHealth;
      this.metrics.alien.finalMothershipShield = finalState.alien.mothershipShield;
      this.metrics.alien.finalAlienShield = finalState.alien.shieldLevel;
    }
    
    this.metrics.winner = finalState.winner!;
    this.metrics.victoryCondition = finalState.victoryCondition!;
    this.metrics.totalTurns = finalState.turn;
    this.metrics.events = this.events;
    this.metrics.turnSnapshots = this.snapshots;
    
    return this.metrics as GameMetrics;
  }
}


