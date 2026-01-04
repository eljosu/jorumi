/**
 * JORUMI Balance System - Balance Analyzer
 * 
 * Sistema de análisis y detección de desbalances.
 * Analiza métricas agregadas e identifica problemas de balance.
 * 
 * PRINCIPIOS:
 * - Detección basada en umbrales configurables
 * - Análisis estadístico robusto
 * - Recomendaciones accionables
 * - Priori zación de problemas
 */

import { AggregatedMetrics } from './MetricsCollector';
import { SimulationResult } from './SimulationRunner';
import { BalanceConfig, PARAMETER_RANGES } from './BalanceConfig';

// ============================================================================
// TIPOS DE ANÁLISIS
// ============================================================================

/**
 * Reporte completo de análisis de balance
 */
export interface BalanceReport {
  // Identificación
  configId: string;
  configName: string;
  timestamp: Date;
  
  // Métricas base
  totalGamesAnalyzed: number;
  
  // Calificación general
  overallScore: BalanceScore;
  overallGrade: BalanceGrade;
  
  // Problemas detectados
  issues: BalanceIssue[];
  
  // Recomendaciones
  recommendations: BalanceRecommendation[];
  
  // Análisis detallado por categoría
  winRateAnalysis: WinRateAnalysis;
  durationAnalysis: DurationAnalysis;
  resourceAnalysis: ResourceAnalysis;
  victoryConditionAnalysis: VictoryConditionAnalysis;
  stabilityAnalysis: StabilityAnalysis;
}

/**
 * Puntuación de balance (0-100)
 */
export interface BalanceScore {
  total: number;           // [0-100] Puntuación total
  winRate: number;         // [0-100] Balance de victorias
  duration: number;        // [0-100] Duración apropiada
  diversity: number;       // [0-100] Diversidad de estrategias
  stability: number;       // [0-100] Consistencia de resultados
  engagement: number;      // [0-100] Intensidad del juego
}

/**
 * Grado de balance
 */
export enum BalanceGrade {
  EXCELLENT = 'EXCELLENT',     // 90-100: Excelente balance
  GOOD = 'GOOD',               // 75-89: Buen balance
  ACCEPTABLE = 'ACCEPTABLE',   // 60-74: Balance aceptable
  POOR = 'POOR',               // 40-59: Balance pobre
  CRITICAL = 'CRITICAL',       // 0-39: Balance crítico
}

/**
 * Problema de balance detectado
 */
export interface BalanceIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  impact: number;            // -100 a 100 (negativo = malo)
  affectedMetrics: string[];
  suggestedParameters: string[];
}

export enum IssueSeverity {
  CRITICAL = 'CRITICAL',     // Requiere corrección inmediata
  HIGH = 'HIGH',             // Problema significativo
  MEDIUM = 'MEDIUM',         // Problema moderado
  LOW = 'LOW',               // Problema menor
  INFO = 'INFO',             // Solo informativo
}

export enum IssueCategory {
  WIN_RATE = 'WIN_RATE',
  GAME_LENGTH = 'GAME_LENGTH',
  RESOURCE_BALANCE = 'RESOURCE_BALANCE',
  VICTORY_CONDITION = 'VICTORY_CONDITION',
  EARLY_GAME = 'EARLY_GAME',
  LATE_GAME = 'LATE_GAME',
  STRATEGY_DIVERSITY = 'STRATEGY_DIVERSITY',
  STABILITY = 'STABILITY',
}

/**
 * Recomendación de ajuste
 */
export interface BalanceRecommendation {
  id: string;
  priority: number;          // 1-10 (10 = más prioritario)
  title: string;
  description: string;
  parameterAdjustments: ParameterAdjustment[];
  expectedImpact: string;
  reasoning: string;
}

/**
 * Ajuste de parámetro sugerido
 */
export interface ParameterAdjustment {
  parameter: string;         // Ruta del parámetro (e.g., "alien.initialShield")
  currentValue: number;
  suggestedValue: number;
  change: number;            // Diferencia
  changePercentage: number;  // % de cambio
  rationale: string;
}

/**
 * Análisis de win rate
 */
export interface WinRateAnalysis {
  humanWinRate: number;
  alienWinRate: number;
  isBalanced: boolean;
  deviation: number;         // Desviación del 50%
  recommendation: string;
}

/**
 * Análisis de duración
 */
export interface DurationAnalysis {
  avgTurns: number;
  medianTurns: number;
  tooShort: boolean;
  tooLong: boolean;
  isAppropriate: boolean;
  recommendation: string;
}

/**
 * Análisis de recursos
 */
export interface ResourceAnalysis {
  foodUtilization: number;
  mineralUtilization: number;
  overallEfficiency: number;
  wasteRate: number;
  isBalanced: boolean;
  underutilizedResources: string[];
  recommendation: string;
}

/**
 * Análisis de condiciones de victoria
 */
export interface VictoryConditionAnalysis {
  distribution: Record<string, number>;
  isDiverse: boolean;
  dominantCondition?: string;
  underusedConditions: string[];
  recommendation: string;
}

/**
 * Análisis de estabilidad
 */
export interface StabilityAnalysis {
  winRateStability: number;
  durationStability: number;
  outcomeVariance: number;
  isPredictable: boolean;
  isTooRandom: boolean;
  recommendation: string;
}

// ============================================================================
// UMBRALES DE DETECCIÓN
// ============================================================================

/**
 * Umbrales para detección de problemas
 */
export const BALANCE_THRESHOLDS = {
  // Win rate
  IDEAL_WIN_RATE: 0.50,
  ACCEPTABLE_WIN_RATE_MIN: 0.45,
  ACCEPTABLE_WIN_RATE_MAX: 0.55,
  CRITICAL_WIN_RATE_MIN: 0.35,
  CRITICAL_WIN_RATE_MAX: 0.65,
  
  // Duración
  MIN_TURNS: 10,
  MAX_TURNS: 45,
  IDEAL_MIN_TURNS: 15,
  IDEAL_MAX_TURNS: 35,
  
  // Recursos
  MIN_RESOURCE_UTILIZATION: 0.60,
  IDEAL_RESOURCE_UTILIZATION: 0.75,
  MAX_WASTE_RATE: 0.30,
  
  // Condiciones de victoria
  MIN_CONDITION_USAGE: 0.10,  // Al menos 10% de victorias por condición
  MAX_CONDITION_DOMINANCE: 0.70, // No más del 70% por una sola condición
  
  // Estabilidad
  MIN_STABILITY: 0.60,
  IDEAL_STABILITY: 0.75,
  MAX_VARIANCE: 0.40,
};

// ============================================================================
// BALANCE ANALYZER
// ============================================================================

/**
 * Analizador de balance
 */
export class BalanceAnalyzer {
  private config: BalanceConfig;
  
  constructor(config: BalanceConfig) {
    this.config = config;
  }
  
  /**
   * Analiza un resultado de simulación
   */
  analyze(result: SimulationResult, aggregated: AggregatedMetrics): BalanceReport {
    const issues: BalanceIssue[] = [];
    
    // Analizar cada categoría
    const winRateAnalysis = this.analyzeWinRate(aggregated, issues);
    const durationAnalysis = this.analyzeDuration(aggregated, issues);
    const resourceAnalysis = this.analyzeResources(aggregated, issues);
    const victoryConditionAnalysis = this.analyzeVictoryConditions(aggregated, issues);
    const stabilityAnalysis = this.analyzeStability(aggregated, issues);
    
    // Calcular puntuación
    const score = this.calculateScore(
      winRateAnalysis,
      durationAnalysis,
      resourceAnalysis,
      victoryConditionAnalysis,
      stabilityAnalysis
    );
    
    // Generar recomendaciones
    const recommendations = this.generateRecommendations(issues, aggregated);
    
    // Ordenar issues por severidad
    issues.sort((a, b) => {
      const severityOrder = {
        [IssueSeverity.CRITICAL]: 5,
        [IssueSeverity.HIGH]: 4,
        [IssueSeverity.MEDIUM]: 3,
        [IssueSeverity.LOW]: 2,
        [IssueSeverity.INFO]: 1,
      };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    
    return {
      configId: this.config.id,
      configName: this.config.name,
      timestamp: new Date(),
      totalGamesAnalyzed: result.completedGames,
      overallScore: score,
      overallGrade: this.calculateGrade(score.total),
      issues,
      recommendations,
      winRateAnalysis,
      durationAnalysis,
      resourceAnalysis,
      victoryConditionAnalysis,
      stabilityAnalysis,
    };
  }
  
  // ==========================================================================
  // ANÁLISIS POR CATEGORÍA
  // ==========================================================================
  
  /**
   * Analiza el balance de win rate
   */
  private analyzeWinRate(metrics: AggregatedMetrics, issues: BalanceIssue[]): WinRateAnalysis {
    const humanWinRate = metrics.results.humanWinRate;
    const alienWinRate = metrics.results.alienWinRate;
    const deviation = Math.abs(humanWinRate - BALANCE_THRESHOLDS.IDEAL_WIN_RATE);
    
    const isBalanced = 
      humanWinRate >= BALANCE_THRESHOLDS.ACCEPTABLE_WIN_RATE_MIN &&
      humanWinRate <= BALANCE_THRESHOLDS.ACCEPTABLE_WIN_RATE_MAX;
    
    // Detectar problemas
    if (humanWinRate < BALANCE_THRESHOLDS.CRITICAL_WIN_RATE_MIN) {
      issues.push({
        id: 'win-rate-critical-alien',
        severity: IssueSeverity.CRITICAL,
        category: IssueCategory.WIN_RATE,
        title: 'Alienígena dominante',
        description: `Los alienígenas ganan ${(alienWinRate * 100).toFixed(1)}% de las partidas. El juego está fuertemente desbalanceado a favor del alienígena.`,
        impact: -80,
        affectedMetrics: ['humanWinRate', 'alienWinRate'],
        suggestedParameters: [
          'alien.mothershipInitialHealth',
          'alien.initialShield',
          'combat.alienAttackDamage',
        ],
      });
    } else if (humanWinRate > BALANCE_THRESHOLDS.CRITICAL_WIN_RATE_MAX) {
      issues.push({
        id: 'win-rate-critical-human',
        severity: IssueSeverity.CRITICAL,
        category: IssueCategory.WIN_RATE,
        title: 'Humanos dominantes',
        description: `Los humanos ganan ${(humanWinRate * 100).toFixed(1)}% de las partidas. El juego está fuertemente desbalanceado a favor de los humanos.`,
        impact: -80,
        affectedMetrics: ['humanWinRate', 'alienWinRate'],
        suggestedParameters: [
          'initial.populationPerGhetto',
          'gathering.peasantFood',
          'combat.soldierBaseAttack',
        ],
      });
    } else if (!isBalanced) {
      const severity = deviation > 0.075 ? IssueSeverity.HIGH : IssueSeverity.MEDIUM;
      const favoredSide = humanWinRate > 0.5 ? 'humanos' : 'alienígena';
      
      issues.push({
        id: 'win-rate-imbalance',
        severity,
        category: IssueCategory.WIN_RATE,
        title: `Desbalance moderado hacia ${favoredSide}`,
        description: `Win rate: ${(humanWinRate * 100).toFixed(1)}% humanos, ${(alienWinRate * 100).toFixed(1)}% alienígena. Se recomienda ajuste.`,
        impact: -deviation * 100,
        affectedMetrics: ['humanWinRate'],
        suggestedParameters: ['survival.foodConsumptionPerHuman', 'alien.attackWoundedRatio'],
      });
    }
    
    let recommendation = '';
    if (isBalanced) {
      recommendation = 'El win rate está bien balanceado.';
    } else if (humanWinRate < 0.5) {
      recommendation = `Reducir dificultad alienígena o mejorar capacidades humanas.`;
    } else {
      recommendation = `Aumentar dificultad alienígena o reducir ventajas humanas.`;
    }
    
    return {
      humanWinRate,
      alienWinRate,
      isBalanced,
      deviation,
      recommendation,
    };
  }
  
  /**
   * Analiza la duración de las partidas
   */
  private analyzeDuration(metrics: AggregatedMetrics, issues: BalanceIssue[]): DurationAnalysis {
    const avgTurns = metrics.duration.averageTurns;
    const medianTurns = metrics.duration.medianTurns;
    
    const tooShort = avgTurns < BALANCE_THRESHOLDS.MIN_TURNS;
    const tooLong = avgTurns > BALANCE_THRESHOLDS.MAX_TURNS;
    const isAppropriate = 
      avgTurns >= BALANCE_THRESHOLDS.IDEAL_MIN_TURNS &&
      avgTurns <= BALANCE_THRESHOLDS.IDEAL_MAX_TURNS;
    
    if (tooShort) {
      issues.push({
        id: 'duration-too-short',
        severity: IssueSeverity.HIGH,
        category: IssueCategory.GAME_LENGTH,
        title: 'Partidas demasiado cortas',
        description: `Las partidas duran en promedio ${avgTurns.toFixed(1)} turnos. Esto sugiere que un bando domina demasiado rápido.`,
        impact: -50,
        affectedMetrics: ['averageTurns'],
        suggestedParameters: [
          'alien.mothershipInitialHealth',
          'survival.starvationDeathsRatio',
        ],
      });
    } else if (tooLong) {
      issues.push({
        id: 'duration-too-long',
        severity: IssueSeverity.MEDIUM,
        category: IssueCategory.GAME_LENGTH,
        title: 'Partidas demasiado largas',
        description: `Las partidas duran en promedio ${avgTurns.toFixed(1)} turnos. El juego puede sentirse arrastrado.`,
        impact: -30,
        affectedMetrics: ['averageTurns'],
        suggestedParameters: [
          'combat.soldierBaseAttack',
          'victory.beaconActivationTurns',
        ],
      });
    }
    
    let recommendation = '';
    if (isAppropriate) {
      recommendation = 'La duración de las partidas es apropiada.';
    } else if (tooShort) {
      recommendation = 'Aumentar vida de nave nodriza o reducir letalidad.';
    } else {
      recommendation = 'Aumentar daño de combate o acelerar condiciones de victoria.';
    }
    
    return {
      avgTurns,
      medianTurns,
      tooShort,
      tooLong,
      isAppropriate,
      recommendation,
    };
  }
  
  /**
   * Analiza el balance de recursos
   */
  private analyzeResources(metrics: AggregatedMetrics, issues: BalanceIssue[]): ResourceAnalysis {
    const foodUtil = metrics.resources.foodUtilizationRate;
    const mineralUtil = metrics.resources.mineralUtilizationRate;
    const efficiency = metrics.resources.resourceEfficiency;
    const wasteRate = 1 - efficiency;
    
    const underutilized: string[] = [];
    
    if (foodUtil < BALANCE_THRESHOLDS.MIN_RESOURCE_UTILIZATION) {
      underutilized.push('comida');
    }
    if (mineralUtil < BALANCE_THRESHOLDS.MIN_RESOURCE_UTILIZATION) {
      underutilized.push('minerales');
    }
    
    const isBalanced = 
      foodUtil >= BALANCE_THRESHOLDS.MIN_RESOURCE_UTILIZATION &&
      mineralUtil >= BALANCE_THRESHOLDS.MIN_RESOURCE_UTILIZATION &&
      wasteRate <= BALANCE_THRESHOLDS.MAX_WASTE_RATE;
    
    if (underutilized.length > 0) {
      issues.push({
        id: 'resources-underutilized',
        severity: IssueSeverity.MEDIUM,
        category: IssueCategory.RESOURCE_BALANCE,
        title: 'Recursos infrautilizados',
        description: `Los siguientes recursos están infrautilizados: ${underutilized.join(', ')}. Esto reduce la profundidad estratégica.`,
        impact: -40,
        affectedMetrics: ['resourceUtilization'],
        suggestedParameters: [
          'gathering.peasantFood',
          'building.beaconMineralCost',
        ],
      });
    }
    
    if (wasteRate > BALANCE_THRESHOLDS.MAX_WASTE_RATE) {
      issues.push({
        id: 'resources-wasted',
        severity: IssueSeverity.LOW,
        category: IssueCategory.RESOURCE_BALANCE,
        title: 'Alto desperdicio de recursos',
        description: `${(wasteRate * 100).toFixed(1)}% de los recursos recolectados se desperdician. Considerar reducir generación o aumentar costos.`,
        impact: -20,
        affectedMetrics: ['resourceEfficiency'],
        suggestedParameters: [
          'gathering.gatheringEfficiency',
          'survival.foodConsumptionPerHuman',
        ],
      });
    }
    
    let recommendation = '';
    if (isBalanced) {
      recommendation = 'Los recursos están bien balanceados.';
    } else {
      recommendation = 'Ajustar costos de edificios y tasa de recolección.';
    }
    
    return {
      foodUtilization: foodUtil,
      mineralUtilization: mineralUtil,
      overallEfficiency: efficiency,
      wasteRate,
      isBalanced,
      underutilizedResources: underutilized,
      recommendation,
    };
  }
  
  /**
   * Analiza la diversidad de condiciones de victoria
   */
  private analyzeVictoryConditions(
    metrics: AggregatedMetrics,
    issues: BalanceIssue[]
  ): VictoryConditionAnalysis {
    const distribution: Record<string, number> = {};
    const total = metrics.totalGames;
    
    Object.entries(metrics.results.winsByCondition).forEach(([condition, count]) => {
      distribution[condition] = count / total;
    });
    
    // Detectar condición dominante
    let dominantCondition: string | undefined;
    let maxUsage = 0;
    const underused: string[] = [];
    
    Object.entries(distribution).forEach(([condition, rate]) => {
      if (rate > maxUsage) {
        maxUsage = rate;
        dominantCondition = condition;
      }
      
      if (rate < BALANCE_THRESHOLDS.MIN_CONDITION_USAGE && rate > 0) {
        underused.push(condition);
      }
    });
    
    const isDiverse = maxUsage <= BALANCE_THRESHOLDS.MAX_CONDITION_DOMINANCE;
    
    if (!isDiverse && dominantCondition) {
      issues.push({
        id: 'victory-condition-dominant',
        severity: IssueSeverity.MEDIUM,
        category: IssueCategory.VICTORY_CONDITION,
        title: 'Condición de victoria dominante',
        description: `${dominantCondition} representa ${(maxUsage * 100).toFixed(1)}% de las victorias. Falta diversidad estratégica.`,
        impact: -35,
        affectedMetrics: ['victoryConditions'],
        suggestedParameters: [
          'victory.beaconActivationTurns',
          'victory.escapeShipMinimumHumans',
        ],
      });
    }
    
    if (underused.length > 0) {
      issues.push({
        id: 'victory-condition-underused',
        severity: IssueSeverity.LOW,
        category: IssueCategory.VICTORY_CONDITION,
        title: 'Condiciones de victoria infrautilizadas',
        description: `Las siguientes condiciones apenas se usan: ${underused.join(', ')}.`,
        impact: -25,
        affectedMetrics: ['victoryConditions'],
        suggestedParameters: [
          'building.beaconMetalCost',
          'alien.mothershipInitialHealth',
        ],
      });
    }
    
    let recommendation = '';
    if (isDiverse) {
      recommendation = 'Buena diversidad en condiciones de victoria.';
    } else {
      recommendation = 'Balancear costos y dificultad de diferentes condiciones de victoria.';
    }
    
    return {
      distribution,
      isDiverse,
      dominantCondition,
      underusedConditions: underused,
      recommendation,
    };
  }
  
  /**
   * Analiza la estabilidad de resultados
   */
  private analyzeStability(metrics: AggregatedMetrics, issues: BalanceIssue[]): StabilityAnalysis {
    const winRateStability = metrics.stability.winRateStability;
    const durationStability = metrics.stability.durationStability;
    const outcomeVariance = metrics.stability.outcomeVariance;
    const predictability = metrics.stability.predictability;
    
    const isPredictable = predictability >= BALANCE_THRESHOLDS.MIN_STABILITY;
    const isTooRandom = predictability < 0.40;
    
    if (isTooRandom) {
      issues.push({
        id: 'stability-too-random',
        severity: IssueSeverity.MEDIUM,
        category: IssueCategory.STABILITY,
        title: 'Resultados demasiado aleatorios',
        description: `La predictibilidad es ${(predictability * 100).toFixed(1)}%. Los resultados varían demasiado entre partidas.`,
        impact: -45,
        affectedMetrics: ['predictability'],
        suggestedParameters: [
          'survival.foodShortageProbability',
          'combat.mothershipCriticalHitChance',
        ],
      });
    } else if (!isPredictable) {
      issues.push({
        id: 'stability-low',
        severity: IssueSeverity.LOW,
        category: IssueCategory.STABILITY,
        title: 'Estabilidad baja',
        description: `Los resultados tienen cierta variabilidad. Considerar reducir elementos aleatorios.`,
        impact: -15,
        affectedMetrics: ['stability'],
        suggestedParameters: [],
      });
    }
    
    let recommendation = '';
    if (isPredictable && !isTooRandom) {
      recommendation = 'La estabilidad es adecuada.';
    } else if (isTooRandom) {
      recommendation = 'Reducir elementos aleatorios y fortalecer decisiones estratégicas.';
    } else {
      recommendation = 'Considerar ajustar probabilidades de eventos aleatorios.';
    }
    
    return {
      winRateStability,
      durationStability,
      outcomeVariance,
      isPredictable,
      isTooRandom,
      recommendation,
    };
  }
  
  // ==========================================================================
  // PUNTUACIÓN Y CALIFICACIÓN
  // ==========================================================================
  
  /**
   * Calcula la puntuación de balance
   */
  private calculateScore(
    winRate: WinRateAnalysis,
    duration: DurationAnalysis,
    resources: ResourceAnalysis,
    victories: VictoryConditionAnalysis,
    stability: StabilityAnalysis
  ): BalanceScore {
    // Win rate score (máximo si está cerca del 50%)
    const winRateScore = Math.max(0, 100 - (winRate.deviation * 200));
    
    // Duration score
    const durationScore = duration.isAppropriate ? 100 :
      duration.tooShort ? 50 : 70;
    
    // Diversity score (condiciones de victoria)
    const diversityScore = victories.isDiverse ? 100 : 60;
    
    // Stability score
    const stabilityScore = stability.isPredictable ? 
      (stability.isTooRandom ? 60 : 100) : 70;
    
    // Engagement score (basado en recursos y duración)
    const engagementScore = (resources.overallEfficiency * 100 + durationScore) / 2;
    
    // Puntuación total (promedio ponderado)
    const total = 
      winRateScore * 0.35 +
      durationScore * 0.20 +
      diversityScore * 0.15 +
      stabilityScore * 0.15 +
      engagementScore * 0.15;
    
    return {
      total,
      winRate: winRateScore,
      duration: durationScore,
      diversity: diversityScore,
      stability: stabilityScore,
      engagement: engagementScore,
    };
  }
  
  /**
   * Calcula el grado de balance
   */
  private calculateGrade(score: number): BalanceGrade {
    if (score >= 90) return BalanceGrade.EXCELLENT;
    if (score >= 75) return BalanceGrade.GOOD;
    if (score >= 60) return BalanceGrade.ACCEPTABLE;
    if (score >= 40) return BalanceGrade.POOR;
    return BalanceGrade.CRITICAL;
  }
  
  // ==========================================================================
  // GENERACIÓN DE RECOMENDACIONES
  // ==========================================================================
  
  /**
   * Genera recomendaciones accionables
   */
  private generateRecommendations(
    issues: BalanceIssue[],
    metrics: AggregatedMetrics
  ): BalanceRecommendation[] {
    const recommendations: BalanceRecommendation[] = [];
    
    // Recomendación #1: Ajustar win rate si es necesario
    const winRateDeviation = Math.abs(metrics.results.humanWinRate - 0.5);
    if (winRateDeviation > 0.05) {
      const adjustments: ParameterAdjustment[] = [];
      
      if (metrics.results.humanWinRate < 0.5) {
        // Favorecer humanos
        adjustments.push(this.createAdjustment(
          'alien.mothershipInitialHealth',
          this.config.alien.mothershipInitialHealth,
          Math.floor(this.config.alien.mothershipInitialHealth * 0.9),
          'Reducir vida de nave nodriza para facilitar victoria humana'
        ));
      } else {
        // Favorecer alienígena
        adjustments.push(this.createAdjustment(
          'survival.foodConsumptionPerHuman',
          this.config.survival.foodConsumptionPerHuman,
          this.config.survival.foodConsumptionPerHuman * 1.1,
          'Aumentar consumo de comida para incrementar presión sobre humanos'
        ));
      }
      
      recommendations.push({
        id: 'rec-winrate',
        priority: 10,
        title: 'Ajustar balance de victorias',
        description: `El win rate está en ${(metrics.results.humanWinRate * 100).toFixed(1)}%. Se recomienda ajustar parámetros para acercarlo al 50%.`,
        parameterAdjustments: adjustments,
        expectedImpact: `Mejorar win rate en ~${(winRateDeviation * 50).toFixed(1)}%`,
        reasoning: 'Un win rate balanceado cerca del 50% asegura que ambos bandos tienen oportunidades equitativas.',
      });
    }
    
    // Recomendación #2: Ajustar duración si es necesario
    if (metrics.duration.averageTurns < BALANCE_THRESHOLDS.IDEAL_MIN_TURNS) {
      recommendations.push({
        id: 'rec-duration-short',
        priority: 8,
        title: 'Alargar duración de partidas',
        description: 'Las partidas son demasiado cortas.',
        parameterAdjustments: [
          this.createAdjustment(
            'alien.mothershipInitialHealth',
            this.config.alien.mothershipInitialHealth,
            this.config.alien.mothershipInitialHealth + 5,
            'Aumentar vida de nave para prolongar partidas'
          ),
        ],
        expectedImpact: 'Aumentar duración promedio en 5-10 turnos',
        reasoning: 'Partidas más largas permiten más desarrollo estratégico.',
      });
    }
    
    // Recomendación #3: Mejorar utilización de recursos
    if (metrics.resources.foodUtilizationRate < BALANCE_THRESHOLDS.MIN_RESOURCE_UTILIZATION) {
      recommendations.push({
        id: 'rec-food-util',
        priority: 6,
        title: 'Mejorar relevancia de comida',
        description: 'La comida está infrautilizada.',
        parameterAdjustments: [
          this.createAdjustment(
            'survival.foodConsumptionPerHuman',
            this.config.survival.foodConsumptionPerHuman,
            this.config.survival.foodConsumptionPerHuman * 1.2,
            'Aumentar consumo para hacer comida más crítica'
          ),
        ],
        expectedImpact: 'Aumentar relevancia de gestión de comida',
        reasoning: 'Recursos relevantes aumentan la profundidad estratégica.',
      });
    }
    
    // Ordenar por prioridad
    recommendations.sort((a, b) => b.priority - a.priority);
    
    return recommendations;
  }
  
  /**
   * Crea un ajuste de parámetro
   */
  private createAdjustment(
    parameter: string,
    current: number,
    suggested: number,
    rationale: string
  ): ParameterAdjustment {
    const change = suggested - current;
    const changePercentage = (change / current) * 100;
    
    return {
      parameter,
      currentValue: current,
      suggestedValue: suggested,
      change,
      changePercentage,
      rationale,
    };
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Genera un reporte en formato texto legible
 */
export function generateTextReport(report: BalanceReport): string {
  let text = '';
  
  text += `═══════════════════════════════════════════════════════════\n`;
  text += `  JORUMI - REPORTE DE BALANCE\n`;
  text += `═══════════════════════════════════════════════════════════\n\n`;
  
  text += `Configuración: ${report.configName}\n`;
  text += `Partidas analizadas: ${report.totalGamesAnalyzed}\n`;
  text += `Fecha: ${report.timestamp.toLocaleString()}\n\n`;
  
  text += `┌─────────────────────────────────────────────────────────┐\n`;
  text += `│ CALIFICACIÓN GENERAL: ${report.overallGrade.padEnd(15)} │\n`;
  text += `│ Puntuación: ${report.overallScore.total.toFixed(1)}/100${' '.repeat(34)}│\n`;
  text += `└─────────────────────────────────────────────────────────┘\n\n`;
  
  text += `PUNTUACIONES DETALLADAS:\n`;
  text += `  • Win Rate:     ${report.overallScore.winRate.toFixed(1)}/100\n`;
  text += `  • Duración:     ${report.overallScore.duration.toFixed(1)}/100\n`;
  text += `  • Diversidad:   ${report.overallScore.diversity.toFixed(1)}/100\n`;
  text += `  • Estabilidad:  ${report.overallScore.stability.toFixed(1)}/100\n`;
  text += `  • Engagement:   ${report.overallScore.engagement.toFixed(1)}/100\n\n`;
  
  if (report.issues.length > 0) {
    text += `PROBLEMAS DETECTADOS (${report.issues.length}):\n`;
    text += `─────────────────────────────────────────────────────────\n`;
    
    report.issues.forEach((issue, i) => {
      text += `${i + 1}. [${issue.severity}] ${issue.title}\n`;
      text += `   ${issue.description}\n\n`;
    });
  }
  
  if (report.recommendations.length > 0) {
    text += `RECOMENDACIONES:\n`;
    text += `─────────────────────────────────────────────────────────\n`;
    
    report.recommendations.forEach((rec, i) => {
      text += `${i + 1}. ${rec.title} (Prioridad: ${rec.priority}/10)\n`;
      text += `   ${rec.description}\n`;
      text += `   Impacto esperado: ${rec.expectedImpact}\n\n`;
      
      if (rec.parameterAdjustments.length > 0) {
        text += `   Ajustes sugeridos:\n`;
        rec.parameterAdjustments.forEach(adj => {
          text += `   • ${adj.parameter}: ${adj.currentValue} → ${adj.suggestedValue}\n`;
          text += `     (${adj.changePercentage >= 0 ? '+' : ''}${adj.changePercentage.toFixed(1)}%)\n`;
        });
        text += `\n`;
      }
    });
  }
  
  text += `═══════════════════════════════════════════════════════════\n`;
  
  return text;
}

/**
 * Exporta el reporte a JSON
 */
export function exportReportJSON(report: BalanceReport): string {
  return JSON.stringify(report, null, 2);
}


