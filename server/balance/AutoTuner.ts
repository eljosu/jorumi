/**
 * JORUMI Balance System - Auto Tuner
 * 
 * Sistema de ajuste automático de parámetros de balance.
 * Itera sobre configuraciones para encontrar el balance óptimo.
 * 
 * PRINCIPIOS:
 * - Ajustes pequeños y controlados
 * - Historial completo de configuraciones probadas
 * - Múltiples estrategias de optimización
 * - Reproducible y traceable
 */

import { BalanceConfig, cloneBalanceConfig, validateBalanceConfig, PARAMETER_RANGES } from './BalanceConfig';
import { SimulationRunner, SimulationConfig, SimulationResult, createDefaultSimulationConfig } from './SimulationRunner';
import { BalanceAnalyzer, BalanceReport, BalanceGrade } from './BalanceAnalyzer';
import { MetricsCollector } from './MetricsCollector';
import { DifficultyLevel } from '../ai/types';

// ============================================================================
// TIPOS DE TUNING
// ============================================================================

/**
 * Estrategia de optimización
 */
export enum TuningStrategy {
  GRID_SEARCH = 'GRID_SEARCH',         // Búsqueda exhaustiva en grid
  HILL_CLIMBING = 'HILL_CLIMBING',     // Escalada de colina
  SIMULATED_ANNEALING = 'SIMULATED_ANNEALING', // Recocido simulado
  RANDOM_SEARCH = 'RANDOM_SEARCH',     // Búsqueda aleatoria
  GRADIENT_DESCENT = 'GRADIENT_DESCENT', // Descenso de gradiente (aproximado)
}

/**
 * Configuración de tuning
 */
export interface TuningConfig {
  // Estrategia
  strategy: TuningStrategy;
  
  // Parámetros a ajustar
  parametersToTune: string[];          // Nombres de parámetros (e.g., "alien.initialShield")
  
  // Objetivo de optimización
  targetWinRate: number;               // Win rate objetivo (default: 0.5)
  targetDurationMin: number;           // Duración mínima objetivo
  targetDurationMax: number;           // Duración máxima objetivo
  
  // Límites de optimización
  maxIterations: number;               // Máximo de iteraciones
  gamesPerIteration: number;           // Partidas por configuración
  convergenceThreshold: number;        // Umbral de convergencia (diferencia mínima)
  
  // Tamaño de paso
  stepSize: number;                    // Tamaño de paso (0-1, relativo al rango)
  
  // Opciones
  verbose: boolean;
  saveHistory: boolean;
  parallelEvaluation?: boolean;
}

/**
 * Resultado de una iteración de tuning
 */
export interface TuningIteration {
  iteration: number;
  config: BalanceConfig;
  simulationResult: SimulationResult;
  report: BalanceReport;
  fitness: number;                     // Puntuación de fitness (0-100)
  timestamp: Date;
}

/**
 * Resultado completo de tuning
 */
export interface TuningResult {
  // Identificación
  startConfig: BalanceConfig;
  finalConfig: BalanceConfig;
  strategy: TuningStrategy;
  timestamp: Date;
  
  // Ejecución
  totalIterations: number;
  totalGamesSimulated: number;
  totalExecutionTimeMs: number;
  converged: boolean;
  
  // Resultados
  initialFitness: number;
  finalFitness: number;
  improvement: number;                 // Mejora absoluta en fitness
  improvementPercentage: number;
  
  // Mejor configuración encontrada
  bestConfig: BalanceConfig;
  bestFitness: number;
  bestReport: BalanceReport;
  
  // Historial
  history: TuningIteration[];
  
  // Estadísticas
  parametersChanged: ParameterChange[];
}

/**
 * Cambio de parámetro
 */
export interface ParameterChange {
  parameter: string;
  initialValue: number;
  finalValue: number;
  change: number;
  changePercentage: number;
}

// ============================================================================
// AUTO TUNER
// ============================================================================

/**
 * Sistema de ajuste automático
 */
export class AutoTuner {
  private config: TuningConfig;
  private history: TuningIteration[] = [];
  private bestIteration?: TuningIteration;
  
  constructor(config: TuningConfig) {
    this.config = config;
  }
  
  /**
   * Ejecuta el proceso de tuning
   */
  async tune(initialConfig: BalanceConfig): Promise<TuningResult> {
    const startTime = Date.now();
    
    this.log(`Starting auto-tuning with strategy: ${this.config.strategy}`);
    this.log(`Parameters to tune: ${this.config.parametersToTune.join(', ')}`);
    this.log(`Max iterations: ${this.config.maxIterations}`);
    
    // Evaluar configuración inicial
    const initialIteration = await this.evaluateConfig(initialConfig, 0);
    this.history.push(initialIteration);
    this.bestIteration = initialIteration;
    
    this.log(`Initial fitness: ${initialIteration.fitness.toFixed(2)}`);
    
    // Ejecutar estrategia de optimización
    let currentConfig = cloneBalanceConfig(initialConfig);
    let converged = false;
    let iteration = 1;
    
    while (iteration < this.config.maxIterations && !converged) {
      this.log(`\n=== Iteration ${iteration} ===`);
      
      // Generar candidato según estrategia
      const candidateConfig = await this.generateCandidate(currentConfig, iteration);
      
      // Evaluar candidato
      const candidateIteration = await this.evaluateConfig(candidateConfig, iteration);
      this.history.push(candidateIteration);
      
      // Actualizar mejor configuración
      if (candidateIteration.fitness > (this.bestIteration?.fitness || 0)) {
        this.bestIteration = candidateIteration;
        this.log(`NEW BEST! Fitness: ${candidateIteration.fitness.toFixed(2)}`);
      }
      
      // Decidir si aceptar candidato
      const accepted = this.acceptCandidate(
        currentConfig,
        candidateConfig,
        this.history[this.history.length - 2]?.fitness || 0,
        candidateIteration.fitness,
        iteration
      );
      
      if (accepted) {
        currentConfig = candidateConfig;
        this.log(`Candidate ACCEPTED`);
      } else {
        this.log(`Candidate REJECTED`);
      }
      
      // Verificar convergencia
      converged = this.checkConvergence();
      
      iteration++;
    }
    
    const totalTime = Date.now() - startTime;
    
    this.log(`\nTuning completed!`);
    this.log(`Total iterations: ${iteration - 1}`);
    this.log(`Best fitness: ${this.bestIteration!.fitness.toFixed(2)}`);
    this.log(`Improvement: ${(this.bestIteration!.fitness - initialIteration.fitness).toFixed(2)}`);
    
    // Construir resultado
    return this.buildResult(initialConfig, initialIteration, totalTime, converged);
  }
  
  /**
   * Evalúa una configuración
   */
  private async evaluateConfig(
    config: BalanceConfig,
    iteration: number
  ): Promise<TuningIteration> {
    this.log(`Evaluating configuration: ${config.name}`);
    
    // Crear configuración de simulación
    const simConfig = createDefaultSimulationConfig(config, this.config.gamesPerIteration);
    simConfig.verbose = false;
    
    // Ejecutar simulación
    const runner = new SimulationRunner(simConfig);
    const simResult = await runner.run();
    
    // Analizar resultados
    const collector = new MetricsCollector(config);
    simResult.metrics.forEach(m => collector.recordGame(m));
    const aggregated = collector.aggregate();
    
    const analyzer = new BalanceAnalyzer(config);
    const report = analyzer.analyze(simResult, aggregated);
    
    // Calcular fitness
    const fitness = this.calculateFitness(simResult, report);
    
    this.log(`Fitness: ${fitness.toFixed(2)} (Win rate: ${(simResult.summary.humanWinRate * 100).toFixed(1)}%, Avg turns: ${simResult.summary.avgTurns.toFixed(1)})`);
    
    return {
      iteration,
      config: cloneBalanceConfig(config),
      simulationResult: simResult,
      report,
      fitness,
      timestamp: new Date(),
    };
  }
  
  /**
   * Calcula el fitness de una configuración
   * Fitness = qué tan cerca está de los objetivos
   */
  private calculateFitness(result: SimulationResult, report: BalanceReport): number {
    const weights = {
      winRate: 0.40,
      duration: 0.25,
      grade: 0.20,
      stability: 0.15,
    };
    
    // Win rate fitness (100 si está en el target)
    const winRateDeviation = Math.abs(result.summary.humanWinRate - this.config.targetWinRate);
    const winRateFitness = Math.max(0, 100 - (winRateDeviation * 200));
    
    // Duration fitness
    const avgTurns = result.summary.avgTurns;
    let durationFitness = 0;
    
    if (avgTurns >= this.config.targetDurationMin && avgTurns <= this.config.targetDurationMax) {
      durationFitness = 100;
    } else if (avgTurns < this.config.targetDurationMin) {
      const deviation = this.config.targetDurationMin - avgTurns;
      durationFitness = Math.max(0, 100 - (deviation * 5));
    } else {
      const deviation = avgTurns - this.config.targetDurationMax;
      durationFitness = Math.max(0, 100 - (deviation * 3));
    }
    
    // Grade fitness (basado en la calificación del reporte)
    const gradeFitness = report.overallScore.total;
    
    // Stability fitness
    const stabilityFitness = report.overallScore.stability;
    
    // Fitness total
    const totalFitness = 
      winRateFitness * weights.winRate +
      durationFitness * weights.duration +
      gradeFitness * weights.grade +
      stabilityFitness * weights.stability;
    
    return totalFitness;
  }
  
  /**
   * Genera un candidato según la estrategia
   */
  private async generateCandidate(
    currentConfig: BalanceConfig,
    iteration: number
  ): Promise<BalanceConfig> {
    switch (this.config.strategy) {
      case TuningStrategy.HILL_CLIMBING:
        return this.generateHillClimbingCandidate(currentConfig);
      
      case TuningStrategy.RANDOM_SEARCH:
        return this.generateRandomCandidate(currentConfig);
      
      case TuningStrategy.SIMULATED_ANNEALING:
        return this.generateAnnealingCandidate(currentConfig, iteration);
      
      case TuningStrategy.GRID_SEARCH:
        return this.generateGridSearchCandidate(currentConfig, iteration);
      
      default:
        return this.generateHillClimbingCandidate(currentConfig);
    }
  }
  
  /**
   * Genera candidato para hill climbing
   * Ajusta un parámetro aleatorio en una dirección
   */
  private generateHillClimbingCandidate(config: BalanceConfig): BalanceConfig {
    const candidate = cloneBalanceConfig(config);
    
    // Seleccionar parámetro aleatorio
    const param = this.config.parametersToTune[
      Math.floor(Math.random() * this.config.parametersToTune.length)
    ];
    
    // Obtener valor actual y rango
    const currentValue = this.getParameterValue(candidate, param);
    const range = PARAMETER_RANGES[param];
    
    if (!range) {
      this.log(`Warning: No range defined for parameter ${param}`);
      return candidate;
    }
    
    // Calcular paso
    const rangeSize = range.max - range.min;
    const step = rangeSize * this.config.stepSize;
    
    // Decidir dirección (aleatorio)
    const direction = Math.random() < 0.5 ? 1 : -1;
    const newValue = currentValue + (step * direction);
    
    // Clamp al rango
    const clampedValue = Math.max(range.min, Math.min(range.max, newValue));
    
    // Aplicar
    this.setParameterValue(candidate, param, clampedValue);
    
    candidate.id = `tuned-${Date.now()}`;
    candidate.name = `Tuned (iteration ${this.history.length})`;
    
    return candidate;
  }
  
  /**
   * Genera candidato aleatorio
   */
  private generateRandomCandidate(config: BalanceConfig): BalanceConfig {
    const candidate = cloneBalanceConfig(config);
    
    // Ajustar cada parámetro con cierta probabilidad
    this.config.parametersToTune.forEach(param => {
      if (Math.random() < 0.3) { // 30% chance de ajustar cada parámetro
        const range = PARAMETER_RANGES[param];
        if (range) {
          const randomValue = range.min + Math.random() * (range.max - range.min);
          this.setParameterValue(candidate, param, randomValue);
        }
      }
    });
    
    candidate.id = `tuned-${Date.now()}`;
    candidate.name = `Random (iteration ${this.history.length})`;
    
    return candidate;
  }
  
  /**
   * Genera candidato para simulated annealing
   */
  private generateAnnealingCandidate(config: BalanceConfig, iteration: number): BalanceConfig {
    // Similar a hill climbing pero con temperatura decreciente
    const temperature = 1 - (iteration / this.config.maxIterations);
    const candidate = cloneBalanceConfig(config);
    
    const param = this.config.parametersToTune[
      Math.floor(Math.random() * this.config.parametersToTune.length)
    ];
    
    const currentValue = this.getParameterValue(candidate, param);
    const range = PARAMETER_RANGES[param];
    
    if (range) {
      const rangeSize = range.max - range.min;
      const maxStep = rangeSize * this.config.stepSize * temperature;
      const step = (Math.random() * 2 - 1) * maxStep; // Random en [-maxStep, maxStep]
      
      const newValue = Math.max(range.min, Math.min(range.max, currentValue + step));
      this.setParameterValue(candidate, param, newValue);
    }
    
    candidate.id = `tuned-${Date.now()}`;
    candidate.name = `Annealing (iteration ${iteration})`;
    
    return candidate;
  }
  
  /**
   * Genera candidato para grid search
   */
  private generateGridSearchCandidate(config: BalanceConfig, iteration: number): BalanceConfig {
    // Búsqueda sistemática en el espacio de parámetros
    const candidate = cloneBalanceConfig(config);
    
    // Por simplicidad, explorar secuencialmente
    const paramIndex = iteration % this.config.parametersToTune.length;
    const param = this.config.parametersToTune[paramIndex];
    
    const range = PARAMETER_RANGES[param];
    if (range) {
      const steps = 5; // Dividir rango en 5 pasos
      const stepIndex = Math.floor(iteration / this.config.parametersToTune.length) % steps;
      const value = range.min + (stepIndex / (steps - 1)) * (range.max - range.min);
      
      this.setParameterValue(candidate, param, value);
    }
    
    candidate.id = `tuned-${Date.now()}`;
    candidate.name = `Grid (iteration ${iteration})`;
    
    return candidate;
  }
  
  /**
   * Decide si aceptar un candidato
   */
  private acceptCandidate(
    currentConfig: BalanceConfig,
    candidateConfig: BalanceConfig,
    currentFitness: number,
    candidateFitness: number,
    iteration: number
  ): boolean {
    switch (this.config.strategy) {
      case TuningStrategy.HILL_CLIMBING:
        // Solo aceptar si mejora
        return candidateFitness > currentFitness;
      
      case TuningStrategy.SIMULATED_ANNEALING:
        // Aceptar mejoras, y aceptar empeoramientos con probabilidad decreciente
        if (candidateFitness > currentFitness) {
          return true;
        }
        
        const temperature = 1 - (iteration / this.config.maxIterations);
        const delta = candidateFitness - currentFitness;
        const probability = Math.exp(delta / (10 * temperature));
        
        return Math.random() < probability;
      
      case TuningStrategy.RANDOM_SEARCH:
      case TuningStrategy.GRID_SEARCH:
        // Siempre seguir adelante (no hay "candidato actual")
        return true;
      
      default:
        return candidateFitness > currentFitness;
    }
  }
  
  /**
   * Verifica si ha convergido
   */
  private checkConvergence(): boolean {
    if (this.history.length < 5) {
      return false;
    }
    
    // Verificar si los últimos N iteraciones tienen fitness similar
    const recent = this.history.slice(-5);
    const fitnessValues = recent.map(it => it.fitness);
    
    const avg = fitnessValues.reduce((a, b) => a + b, 0) / fitnessValues.length;
    const maxDeviation = Math.max(...fitnessValues.map(f => Math.abs(f - avg)));
    
    return maxDeviation < this.config.convergenceThreshold;
  }
  
  /**
   * Construye el resultado final
   */
  private buildResult(
    initialConfig: BalanceConfig,
    initialIteration: TuningIteration,
    totalTime: number,
    converged: boolean
  ): TuningResult {
    const finalIteration = this.history[this.history.length - 1];
    const improvement = this.bestIteration!.fitness - initialIteration.fitness;
    const improvementPercentage = (improvement / initialIteration.fitness) * 100;
    
    // Calcular cambios de parámetros
    const parametersChanged: ParameterChange[] = this.config.parametersToTune.map(param => {
      const initialValue = this.getParameterValue(initialConfig, param);
      const finalValue = this.getParameterValue(this.bestIteration!.config, param);
      const change = finalValue - initialValue;
      
      return {
        parameter: param,
        initialValue,
        finalValue,
        change,
        changePercentage: (change / initialValue) * 100,
      };
    });
    
    const totalGames = this.history.reduce((sum, it) => sum + it.simulationResult.completedGames, 0);
    
    return {
      startConfig: initialConfig,
      finalConfig: finalIteration.config,
      strategy: this.config.strategy,
      timestamp: new Date(),
      totalIterations: this.history.length,
      totalGamesSimulated: totalGames,
      totalExecutionTimeMs: totalTime,
      converged,
      initialFitness: initialIteration.fitness,
      finalFitness: finalIteration.fitness,
      improvement,
      improvementPercentage,
      bestConfig: this.bestIteration!.config,
      bestFitness: this.bestIteration!.fitness,
      bestReport: this.bestIteration!.report,
      history: this.config.saveHistory ? this.history : [],
      parametersChanged,
    };
  }
  
  // ==========================================================================
  // UTILIDADES DE PARÁMETROS
  // ==========================================================================
  
  /**
   * Obtiene el valor de un parámetro por su path
   */
  private getParameterValue(config: BalanceConfig, path: string): number {
    const parts = path.split('.');
    let current: any = config;
    
    for (const part of parts) {
      current = current[part];
      if (current === undefined) {
        throw new Error(`Parameter path not found: ${path}`);
      }
    }
    
    return current as number;
  }
  
  /**
   * Establece el valor de un parámetro por su path
   */
  private setParameterValue(config: BalanceConfig, path: string, value: number): void {
    const parts = path.split('.');
    const lastPart = parts.pop()!;
    
    let current: any = config;
    for (const part of parts) {
      current = current[part];
    }
    
    current[lastPart] = value;
  }
  
  /**
   * Logging interno
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[AutoTuner] ${message}`);
    }
  }
}

// ============================================================================
// FACTORY Y HELPERS
// ============================================================================

/**
 * Crea una configuración de tuning por defecto
 */
export function createDefaultTuningConfig(): TuningConfig {
  return {
    strategy: TuningStrategy.HILL_CLIMBING,
    parametersToTune: [
      'alien.mothershipInitialHealth',
      'alien.initialShield',
      'survival.foodConsumptionPerHuman',
      'gathering.peasantFood',
      'combat.soldierBaseAttack',
    ],
    targetWinRate: 0.50,
    targetDurationMin: 15,
    targetDurationMax: 35,
    maxIterations: 20,
    gamesPerIteration: 100,
    convergenceThreshold: 2.0,
    stepSize: 0.1,
    verbose: true,
    saveHistory: true,
  };
}

/**
 * Ejecuta un tuning rápido
 */
export async function quickTune(initialConfig: BalanceConfig): Promise<TuningResult> {
  const tuningConfig = createDefaultTuningConfig();
  tuningConfig.maxIterations = 10;
  tuningConfig.gamesPerIteration = 50;
  
  const tuner = new AutoTuner(tuningConfig);
  return await tuner.tune(initialConfig);
}

/**
 * Genera reporte de tuning en texto
 */
export function generateTuningReport(result: TuningResult): string {
  let text = '';
  
  text += `═══════════════════════════════════════════════════════════\n`;
  text += `  JORUMI - REPORTE DE AUTO-TUNING\n`;
  text += `═══════════════════════════════════════════════════════════\n\n`;
  
  text += `Estrategia: ${result.strategy}\n`;
  text += `Fecha: ${result.timestamp.toLocaleString()}\n\n`;
  
  text += `EJECUCIÓN:\n`;
  text += `  • Iteraciones: ${result.totalIterations}\n`;
  text += `  • Partidas simuladas: ${result.totalGamesSimulated}\n`;
  text += `  • Tiempo total: ${(result.totalExecutionTimeMs / 1000).toFixed(1)}s\n`;
  text += `  • Convergió: ${result.converged ? 'Sí' : 'No'}\n\n`;
  
  text += `RESULTADOS:\n`;
  text += `  • Fitness inicial: ${result.initialFitness.toFixed(2)}\n`;
  text += `  • Fitness final: ${result.finalFitness.toFixed(2)}\n`;
  text += `  • Mejor fitness: ${result.bestFitness.toFixed(2)}\n`;
  text += `  • Mejora: ${result.improvement >= 0 ? '+' : ''}${result.improvement.toFixed(2)} (${result.improvementPercentage >= 0 ? '+' : ''}${result.improvementPercentage.toFixed(1)}%)\n\n`;
  
  text += `CAMBIOS DE PARÁMETROS:\n`;
  text += `─────────────────────────────────────────────────────────\n`;
  
  result.parametersChanged.forEach(change => {
    if (Math.abs(change.change) > 0.01) {
      text += `  • ${change.parameter}:\n`;
      text += `    ${change.initialValue.toFixed(2)} → ${change.finalValue.toFixed(2)} `;
      text += `(${change.change >= 0 ? '+' : ''}${change.changePercentage.toFixed(1)}%)\n`;
    }
  });
  
  text += `\n`;
  text += `MEJOR CONFIGURACIÓN:\n`;
  text += `  • Nombre: ${result.bestConfig.name}\n`;
  text += `  • ID: ${result.bestConfig.id}\n`;
  text += `  • Calificación: ${result.bestReport.overallGrade}\n`;
  text += `  • Puntuación: ${result.bestReport.overallScore.total.toFixed(1)}/100\n\n`;
  
  text += `═══════════════════════════════════════════════════════════\n`;
  
  return text;
}



