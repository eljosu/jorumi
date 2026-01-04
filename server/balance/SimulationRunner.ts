/**
 * JORUMI Balance System - Simulation Runner
 * 
 * Ejecutor de simulaciones masivas de partidas.
 * Permite ejecutar miles de partidas sin UI para evaluar balance.
 * 
 * PRINCIPIOS:
 * - Simulación 100% server-side
 * - Determinista (seeded RNG)
 * - Sin dependencia de UI
 * - Integración con IA alienígena
 * - Recolección automática de métricas
 */

import { GameEngine } from '../../engine/core/game-engine';
import { GameState, GamePhase, PlayerRole, VictoryCondition } from '../../engine/domain/types';
import { AlienAIController, createSilentAlienAI } from '../ai/AlienAIController';
import { DifficultyLevel } from '../ai/types';
import { BalanceConfig } from './BalanceConfig';
import { MetricsCollector, GameMetrics, GameMetricsBuilder, GameEventType } from './MetricsCollector';

// ============================================================================
// TIPOS DE SIMULACIÓN
// ============================================================================

/**
 * Configuración de simulación
 */
export interface SimulationConfig {
  // Balance
  balanceConfig: BalanceConfig;
  
  // Cantidad de partidas
  numGames: number;
  
  // Seeds
  startSeed?: number;        // Seed inicial (se incrementa por partida)
  seeds?: number[];          // Seeds específicos (sobrescribe startSeed)
  
  // IA
  alienDifficulty: DifficultyLevel;
  humanStrategy: HumanStrategy;
  
  // Límites
  maxTurnsPerGame: number;   // Límite de turnos por partida
  timeoutMs?: number;        // Timeout por partida (opcional)
  
  // Opciones
  verbose: boolean;          // Logging detallado
  parallel?: boolean;        // Ejecución paralela (futuro)
  collectSnapshots?: boolean; // Recolectar snapshots por turno
}

/**
 * Estrategia de IA humana
 */
export enum HumanStrategy {
  RANDOM = 'RANDOM',           // Acciones aleatorias válidas
  DEFENSIVE = 'DEFENSIVE',     // Prioriza supervivencia
  AGGRESSIVE = 'AGGRESSIVE',   // Prioriza atacar la nave
  BALANCED = 'BALANCED',       // Balance entre recursos y ataque
  OPTIMAL = 'OPTIMAL',         // Intenta jugar óptimamente
}

/**
 * Resultado de simulación
 */
export interface SimulationResult {
  // Identificación
  configId: string;
  configName: string;
  timestamp: Date;
  
  // Ejecución
  totalGames: number;
  completedGames: number;
  failedGames: number;
  avgExecutionTimeMs: number;
  totalExecutionTimeMs: number;
  
  // Métricas
  metrics: GameMetrics[];
  
  // Resumen rápido
  summary: SimulationSummary;
}

/**
 * Resumen de simulación
 */
export interface SimulationSummary {
  humanWinRate: number;
  alienWinRate: number;
  avgTurns: number;
  avgFinalHumans: number;
  avgFinalAlienHealth: number;
  
  // Por condición de victoria
  mothershipDestroyedCount: number;
  escapeShipCount: number;
  beaconActivatedCount: number;
  totalDefeatCount: number;
}

/**
 * Progreso de simulación
 */
export interface SimulationProgress {
  completed: number;
  total: number;
  percentage: number;
  currentGame: number;
  estimatedTimeRemainingMs: number;
}

// ============================================================================
// SIMULATION RUNNER
// ============================================================================

/**
 * Ejecutor de simulaciones masivas
 */
export class SimulationRunner {
  private config: SimulationConfig;
  private metricsCollector: MetricsCollector;
  private progressCallback?: (progress: SimulationProgress) => void;
  
  constructor(config: SimulationConfig) {
    this.config = config;
    this.metricsCollector = new MetricsCollector(config.balanceConfig);
  }
  
  /**
   * Registra callback para progreso
   */
  onProgress(callback: (progress: SimulationProgress) => void): void {
    this.progressCallback = callback;
  }
  
  /**
   * Ejecuta la simulación completa
   */
  async run(): Promise<SimulationResult> {
    const startTime = Date.now();
    
    this.log(`Starting simulation: ${this.config.numGames} games`);
    this.log(`Balance config: ${this.config.balanceConfig.name}`);
    this.log(`Alien difficulty: ${this.config.alienDifficulty}`);
    this.log(`Human strategy: ${this.config.humanStrategy}`);
    
    // Generar seeds
    const seeds = this.generateSeeds();
    
    // Ejecutar partidas
    let completed = 0;
    let failed = 0;
    const executionTimes: number[] = [];
    
    for (let i = 0; i < seeds.length; i++) {
      const seed = seeds[i];
      
      try {
        // Ejecutar partida
        const gameStartTime = Date.now();
        const metrics = await this.runSingleGame(seed, i + 1);
        const gameExecutionTime = Date.now() - gameStartTime;
        
        // Registrar métricas
        this.metricsCollector.recordGame(metrics);
        executionTimes.push(gameExecutionTime);
        completed++;
        
        this.log(`Game ${i + 1}/${seeds.length} completed in ${gameExecutionTime}ms - Winner: ${metrics.winner}, Turns: ${metrics.totalTurns}`);
      } catch (error) {
        failed++;
        this.log(`Game ${i + 1}/${seeds.length} failed: ${error}`);
      }
      
      // Reportar progreso
      if (this.progressCallback) {
        const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
        const remaining = seeds.length - (i + 1);
        
        this.progressCallback({
          completed: i + 1,
          total: seeds.length,
          percentage: ((i + 1) / seeds.length) * 100,
          currentGame: i + 1,
          estimatedTimeRemainingMs: avgTime * remaining,
        });
      }
    }
    
    const totalTime = Date.now() - startTime;
    const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
    
    this.log(`Simulation completed: ${completed} games, ${failed} failed in ${totalTime}ms`);
    
    // Construir resultado
    const result: SimulationResult = {
      configId: this.config.balanceConfig.id,
      configName: this.config.balanceConfig.name,
      timestamp: new Date(),
      totalGames: this.config.numGames,
      completedGames: completed,
      failedGames: failed,
      avgExecutionTimeMs: avgTime,
      totalExecutionTimeMs: totalTime,
      metrics: this.metricsCollector.getAllMetrics(),
      summary: this.buildSummary(),
    };
    
    return result;
  }
  
  /**
   * Ejecuta una sola partida
   */
  private async runSingleGame(seed: number, gameNumber: number): Promise<GameMetrics> {
    // Crear motor de juego
    const engine = new GameEngine({ enableLogging: this.config.verbose });
    
    // Crear IA alienígena
    const alienAI = createSilentAlienAI(this.config.alienDifficulty);
    
    // Crear builder de métricas
    const metricsBuilder = this.metricsCollector.startGame(`sim-${gameNumber}`, seed);
    
    // Iniciar partida con seed
    const initialState = engine.startGame({
      playerNames: ['Human Player', 'Alien AI'],
      seed,
    });
    
    // Aplicar configuración de balance al estado inicial
    this.applyBalanceConfigToState(initialState);
    
    // Registrar estado inicial
    metricsBuilder.recordInitialState(initialState);
    
    // Loop de juego
    let turns = 0;
    const maxTurns = this.config.maxTurnsPerGame;
    
    while (!engine.getState().gameOver && turns < maxTurns) {
      const state = engine.getState();
      turns = state.turn;
      
      // Recolectar snapshot si está habilitado
      if (this.config.collectSnapshots) {
        metricsBuilder.recordTurnSnapshot(state);
      }
      
      try {
        // Ejecutar fase actual
        await this.executePhase(engine, alienAI, metricsBuilder);
      } catch (error) {
        this.log(`Error in turn ${turns}, phase ${state.phase}: ${error}`);
        throw error;
      }
    }
    
    // Si alcanzó el límite de turnos, victoria alienígena
    const finalState = engine.getState();
    if (!finalState.gameOver) {
      // Forzar victoria alienígena por timeout
      finalState.gameOver = true;
      finalState.winner = PlayerRole.ALIEN;
      finalState.victoryCondition = VictoryCondition.TOTAL_DEFEAT;
    }
    
    // Construir métricas finales
    return metricsBuilder.build(finalState);
  }
  
  /**
   * Ejecuta una fase del juego
   */
  private async executePhase(
    engine: GameEngine,
    alienAI: AlienAIController,
    metricsBuilder: GameMetricsBuilder
  ): Promise<void> {
    const state = engine.getState();
    const phase = state.phase;
    
    switch (phase) {
      case GamePhase.PREPARATION:
        // Fase automática - aplicar mecánicas de supervivencia
        this.executePreparationPhase(engine, metricsBuilder);
        break;
      
      case GamePhase.EXPLORATION:
        // Exploración - los humanos colocan losetas
        this.executeExplorationPhase(engine, metricsBuilder);
        break;
      
      case GamePhase.MOVEMENT:
        // Movimiento de personajes
        this.executeMovementPhase(engine, metricsBuilder);
        break;
      
      case GamePhase.RESOURCE_GATHERING:
        // Recolección de recursos
        this.executeGatheringPhase(engine, metricsBuilder);
        break;
      
      case GamePhase.TRADING:
        // Intercambio y conversiones
        this.executeTradingPhase(engine, metricsBuilder);
        break;
      
      case GamePhase.ALIEN_TURN:
        // Turno alienígena - usar IA
        this.executeAlienPhase(engine, alienAI, metricsBuilder);
        break;
      
      case GamePhase.ROLE_CHECK:
        // Comprobación de roles (automática)
        engine.advancePhase();
        break;
      
      case GamePhase.END_GAME_CHECK:
        // Comprobación de finales (automática)
        engine.advancePhase();
        break;
      
      default:
        engine.advancePhase();
    }
  }
  
  /**
   * Fase de preparación
   */
  private executePreparationPhase(
    engine: GameEngine,
    metricsBuilder: GameMetricsBuilder
  ): void {
    // Esta fase es automática en el motor
    // Aquí solo registramos eventos si hay muertes por inanición
    
    const stateBefore = engine.getState();
    engine.advancePhase();
    const stateAfter = engine.getState();
    
    // Detectar muertes
    let totalPopulationBefore = 0;
    let totalPopulationAfter = 0;
    
    stateBefore.ghettos.forEach(g => totalPopulationBefore += g.population + g.wounded);
    stateAfter.ghettos.forEach(g => totalPopulationAfter += g.population + g.wounded);
    
    const deaths = totalPopulationBefore - totalPopulationAfter;
    if (deaths > 0) {
      metricsBuilder.recordDeaths(deaths, 'starvation');
      metricsBuilder.recordEvent(
        stateAfter.turn,
        GameEventType.MASS_STARVATION,
        `${deaths} humans died from starvation`,
        -deaths * 10
      );
    }
  }
  
  /**
   * Fase de exploración (simplificada)
   */
  private executeExplorationPhase(
    engine: GameEngine,
    metricsBuilder: GameMetricsBuilder
  ): void {
    // Por ahora, simplemente avanzar
    // En el futuro, implementar lógica de exploración
    engine.advancePhase();
  }
  
  /**
   * Fase de movimiento (simplificada)
   */
  private executeMovementPhase(
    engine: GameEngine,
    metricsBuilder: GameMetricsBuilder
  ): void {
    // Por ahora, simplemente avanzar
    // En el futuro, implementar lógica de movimiento según estrategia
    engine.advancePhase();
  }
  
  /**
   * Fase de recolección (simplificada)
   */
  private executeGatheringPhase(
    engine: GameEngine,
    metricsBuilder: GameMetricsBuilder
  ): void {
    // Por ahora, simplemente avanzar
    // En el futuro, implementar lógica de recolección
    engine.advancePhase();
  }
  
  /**
   * Fase de trading (simplificada)
   */
  private executeTradingPhase(
    engine: GameEngine,
    metricsBuilder: GameMetricsBuilder
  ): void {
    // Por ahora, simplemente avanzar
    engine.advancePhase();
  }
  
  /**
   * Fase alienígena - usa IA
   */
  private executeAlienPhase(
    engine: GameEngine,
    alienAI: AlienAIController,
    metricsBuilder: GameMetricsBuilder
  ): void {
    const state = engine.getState();
    
    // Lanzar dados alienígenas
    const attackDice = engine.rollDice('ALIEN_ATTACK');
    const actionDice = engine.rollDice('ALIEN_ACTION');
    
    // Decidir acción
    const decision = alienAI.decideTurn(state, attackDice.result, actionDice.result);
    
    // Aplicar acción
    const result = engine.applyAction(decision.action as any);
    
    if (result.success) {
      // Registrar métricas según tipo de acción
      if (decision.action.type.includes('ATTACK')) {
        metricsBuilder.recordHumanDamage(2); // Simplificado
      }
    }
    
    // Avanzar fase
    engine.advancePhase();
  }
  
  /**
   * Aplica configuración de balance al estado inicial
   */
  private applyBalanceConfigToState(state: GameState): void {
    const config = this.config.balanceConfig;
    
    // Aplicar configuración inicial
    state.ghettos.forEach(ghetto => {
      ghetto.population = config.initial.populationPerGhetto;
      ghetto.resources.FOOD = config.initial.initialFood;
      ghetto.resources.MEDICINE = config.initial.initialMedicine;
      ghetto.resources.METAL = config.initial.initialMetal;
      ghetto.resources.MINERALS = config.initial.initialMinerals;
    });
    
    // Aplicar configuración alienígena
    state.alien.shieldLevel = config.alien.initialShield;
    state.alien.controlTokens = config.alien.initialControlTokens;
    state.alien.mothershipHealth = config.alien.mothershipInitialHealth;
    state.alien.mothershipShield = config.alien.mothershipInitialShield;
  }
  
  /**
   * Genera seeds para las simulaciones
   */
  private generateSeeds(): number[] {
    if (this.config.seeds) {
      return this.config.seeds;
    }
    
    const startSeed = this.config.startSeed ?? Date.now();
    const seeds: number[] = [];
    
    for (let i = 0; i < this.config.numGames; i++) {
      seeds.push(startSeed + i);
    }
    
    return seeds;
  }
  
  /**
   * Construye resumen de resultados
   */
  private buildSummary(): SimulationSummary {
    const metrics = this.metricsCollector.getAllMetrics();
    
    if (metrics.length === 0) {
      return {
        humanWinRate: 0,
        alienWinRate: 0,
        avgTurns: 0,
        avgFinalHumans: 0,
        avgFinalAlienHealth: 0,
        mothershipDestroyedCount: 0,
        escapeShipCount: 0,
        beaconActivatedCount: 0,
        totalDefeatCount: 0,
      };
    }
    
    const humanWins = metrics.filter(m => m.winner === PlayerRole.HUMAN).length;
    const totalTurns = metrics.reduce((sum, m) => sum + m.totalTurns, 0);
    const totalFinalHumans = metrics.reduce((sum, m) => sum + m.humans.finalPopulation, 0);
    const totalFinalAlienHealth = metrics.reduce((sum, m) => sum + m.alien.finalMothershipHealth, 0);
    
    return {
      humanWinRate: humanWins / metrics.length,
      alienWinRate: 1 - (humanWins / metrics.length),
      avgTurns: totalTurns / metrics.length,
      avgFinalHumans: totalFinalHumans / metrics.length,
      avgFinalAlienHealth: totalFinalAlienHealth / metrics.length,
      mothershipDestroyedCount: metrics.filter(m => m.victoryCondition === VictoryCondition.MOTHERSHIP_DESTROYED).length,
      escapeShipCount: metrics.filter(m => m.victoryCondition === VictoryCondition.ESCAPE_SHIP).length,
      beaconActivatedCount: metrics.filter(m => m.victoryCondition === VictoryCondition.BEACON_ACTIVATED).length,
      totalDefeatCount: metrics.filter(m => m.victoryCondition === VictoryCondition.TOTAL_DEFEAT).length,
    };
  }
  
  /**
   * Logging interno
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[SimulationRunner] ${message}`);
    }
  }
}

// ============================================================================
// FACTORY Y HELPERS
// ============================================================================

/**
 * Crea una configuración de simulación por defecto
 */
export function createDefaultSimulationConfig(
  balanceConfig: BalanceConfig,
  numGames: number = 1000
): SimulationConfig {
  return {
    balanceConfig,
    numGames,
    startSeed: Date.now(),
    alienDifficulty: DifficultyLevel.NORMAL,
    humanStrategy: HumanStrategy.BALANCED,
    maxTurnsPerGame: 50,
    verbose: false,
    collectSnapshots: false,
  };
}

/**
 * Crea y ejecuta una simulación rápida
 */
export async function runQuickSimulation(
  balanceConfig: BalanceConfig,
  numGames: number = 100
): Promise<SimulationResult> {
  const config = createDefaultSimulationConfig(balanceConfig, numGames);
  const runner = new SimulationRunner(config);
  return await runner.run();
}

/**
 * Compara dos configuraciones ejecutando simulaciones
 */
export async function compareConfigs(
  configA: BalanceConfig,
  configB: BalanceConfig,
  numGamesPerConfig: number = 500
): Promise<{
  configA: SimulationResult;
  configB: SimulationResult;
  comparison: {
    winRateDifference: number;
    avgTurnsDifference: number;
    recommendation: string;
  };
}> {
  const resultA = await runQuickSimulation(configA, numGamesPerConfig);
  const resultB = await runQuickSimulation(configB, numGamesPerConfig);
  
  const winRateDiff = resultA.summary.humanWinRate - resultB.summary.humanWinRate;
  const turnsDiff = resultA.summary.avgTurns - resultB.summary.avgTurns;
  
  let recommendation = '';
  if (Math.abs(winRateDiff) < 0.05) {
    recommendation = 'Ambas configuraciones están bien balanceadas';
  } else if (winRateDiff > 0) {
    recommendation = `${configA.name} favorece más a humanos (+${(winRateDiff * 100).toFixed(1)}%)`;
  } else {
    recommendation = `${configB.name} favorece más a humanos (+${(Math.abs(winRateDiff) * 100).toFixed(1)}%)`;
  }
  
  return {
    configA: resultA,
    configB: resultB,
    comparison: {
      winRateDifference: winRateDiff,
      avgTurnsDifference: turnsDiff,
      recommendation,
    },
  };
}


