/**
 * JORUMI Balance System - Main Exports
 * 
 * Sistema completo de balance y tuning automático para JORUMI.
 * 
 * @example
 * ```ts
 * import { 
 *   DEFAULT_BALANCE_CONFIG,
 *   SimulationRunner,
 *   BalanceAnalyzer,
 *   AutoTuner 
 * } from './balance';
 * 
 * // Ejecutar simulación
 * const runner = new SimulationRunner(config);
 * const result = await runner.run();
 * 
 * // Analizar balance
 * const analyzer = new BalanceAnalyzer(config);
 * const report = analyzer.analyze(result, aggregated);
 * 
 * // Auto-tuning
 * const tuner = new AutoTuner(tuningConfig);
 * const tuningResult = await tuner.tune(config);
 * ```
 */

// ============================================================================
// CONFIGURACIÓN DE BALANCE
// ============================================================================

export {
  // Tipos
  BalanceConfig,
  InitialConfig,
  SurvivalConfig,
  CombatConfig,
  GatheringConfig,
  BuildingConfig,
  AlienConfig,
  VictoryConfig,
  MovementConfig,
  GameLimits,
  ParameterRanges,
  
  // Constantes
  DEFAULT_BALANCE_CONFIG,
  PARAMETER_RANGES,
  
  // Utilidades
  cloneBalanceConfig,
  validateBalanceConfig,
  createCustomConfig,
  serializeConfig,
  deserializeConfig,
} from './BalanceConfig';

// ============================================================================
// MÉTRICAS
// ============================================================================

export {
  // Tipos de métricas
  GameMetrics,
  HumanMetrics,
  AlienMetrics,
  ResourceMetrics,
  BuildingMetrics,
  CombatMetrics,
  GameEvent,
  GameEventType,
  TurnSnapshot,
  
  // Métricas agregadas
  AggregatedMetrics,
  ResultStatistics,
  DurationStatistics,
  AggregatedHumanStats,
  AggregatedAlienStats,
  AggregatedResourceStats,
  VictoryConditionStats,
  StabilityMetrics,
  
  // Classes
  MetricsCollector,
  GameMetricsBuilder,
} from './MetricsCollector';

// ============================================================================
// SIMULACIÓN
// ============================================================================

export {
  // Tipos
  SimulationConfig,
  HumanStrategy,
  SimulationResult,
  SimulationSummary,
  SimulationProgress,
  
  // Class
  SimulationRunner,
  
  // Utilidades
  createDefaultSimulationConfig,
  runQuickSimulation,
  compareConfigs,
} from './SimulationRunner';

// ============================================================================
// ANÁLISIS
// ============================================================================

export {
  // Tipos
  BalanceReport,
  BalanceScore,
  BalanceGrade,
  BalanceIssue,
  IssueSeverity,
  IssueCategory,
  BalanceRecommendation,
  ParameterAdjustment,
  WinRateAnalysis,
  DurationAnalysis,
  ResourceAnalysis,
  VictoryConditionAnalysis,
  StabilityAnalysis,
  
  // Constantes
  BALANCE_THRESHOLDS,
  
  // Class
  BalanceAnalyzer,
  
  // Utilidades
  generateTextReport,
  exportReportJSON,
} from './BalanceAnalyzer';

// ============================================================================
// AUTO-TUNING
// ============================================================================

export {
  // Tipos
  TuningStrategy,
  TuningConfig,
  TuningIteration,
  TuningResult,
  ParameterChange,
  
  // Class
  AutoTuner,
  
  // Utilidades
  createDefaultTuningConfig,
  quickTune,
  generateTuningReport,
} from './AutoTuner';



