/**
 * JORUMI AI - Decision Logger
 * 
 * Sistema de logging explicable para decisiones de la IA
 * Útil para debugging, balance y modo espectador
 */

import { AIDecisionLog, AIDecision, GameStateAnalysis, AIAction } from './types';
import { ActionType } from '../../engine/actions/types';

// ============================================================================
// CONFIGURACIÓN DE LOGGING
// ============================================================================

export type LogLevel = 'minimal' | 'normal' | 'verbose';

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  outputToConsole: boolean;
  storeInMemory: boolean;
  maxStoredLogs: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: true,
  level: 'normal',
  outputToConsole: true,
  storeInMemory: true,
  maxStoredLogs: 100,
};

// ============================================================================
// LOGGER CLASS
// ============================================================================

/**
 * Logger para decisiones de la IA
 */
export class AILogger {
  private config: LoggerConfig;
  private logs: AIDecisionLog[] = [];
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Registra una decisión completa de la IA
   */
  logDecision(log: AIDecisionLog): void {
    if (!this.config.enabled) return;
    
    // Almacenar en memoria
    if (this.config.storeInMemory) {
      this.logs.push(log);
      
      // Limitar tamaño del buffer
      if (this.logs.length > this.config.maxStoredLogs) {
        this.logs.shift();
      }
    }
    
    // Output a consola
    if (this.config.outputToConsole) {
      this.printDecisionToConsole(log);
    }
  }
  
  /**
   * Imprime una decisión a la consola de forma legible
   */
  private printDecisionToConsole(log: AIDecisionLog): void {
    const { level } = this.config;
    const { turnNumber, phase, difficulty, decision, stateAnalysis, executionTime } = log;
    
    console.log('\n' + '='.repeat(70));
    console.log(`🤖 ALIEN AI DECISION - Turn ${turnNumber} - Phase: ${phase}`);
    console.log('='.repeat(70));
    
    // Minimal: solo acción
    console.log(`\n📋 ACTION: ${this.formatActionType(decision.action.type)}`);
    console.log(`   Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
    console.log(`   Difficulty: ${difficulty}`);
    
    if (level === 'minimal') {
      console.log('='.repeat(70) + '\n');
      return;
    }
    
    // Normal: incluir reasoning
    console.log(`\n💭 REASONING:`);
    console.log(`   ${decision.reasoning}`);
    
    console.log(`\n📊 HEURISTICS:`);
    console.log(`   Threat Level:      ${decision.heuristics.threatLevel.toFixed(1)}`);
    console.log(`   Opportunity:       ${decision.heuristics.opportunityScore.toFixed(1)}`);
    console.log(`   Strategic Value:   ${decision.heuristics.strategicValue.toFixed(1)}`);
    console.log(`   Risk Assessment:   ${decision.heuristics.riskAssessment.toFixed(1)}`);
    console.log(`   Victory Progress:  ${decision.heuristics.victoryProgress.toFixed(1)}`);
    console.log(`   ─────────────────────────────`);
    console.log(`   TOTAL SCORE:       ${decision.heuristics.totalScore.toFixed(1)}`);
    
    if (level === 'normal') {
      console.log(`\n⏱️  Execution time: ${executionTime}ms`);
      console.log('='.repeat(70) + '\n');
      return;
    }
    
    // Verbose: incluir análisis completo y alternativas
    console.log(`\n🎯 STATE ANALYSIS:`);
    console.log(`   Human Population:     ${stateAnalysis.totalHumanPopulation}`);
    console.log(`   Human Wounded:        ${stateAnalysis.totalWounded}`);
    console.log(`   Human Threat Level:   ${stateAnalysis.humanThreatLevel.toFixed(1)}`);
    console.log(`   Human Victory Progress: ${stateAnalysis.humanVictoryProgress.toFixed(1)}%`);
    console.log(`   Alien Shield:         ${stateAnalysis.alienShieldLevel}`);
    console.log(`   Control Tokens:       ${stateAnalysis.alienControlTokens}`);
    console.log(`   Mothership Health:    ${stateAnalysis.mothershipHealth}`);
    
    console.log(`\n🏘️  GHETTO ASSESSMENTS:`);
    stateAnalysis.ghettos
      .sort((a, b) => b.threatLevel - a.threatLevel)
      .slice(0, 3)
      .forEach((ghetto, index) => {
        console.log(`   ${index + 1}. ${ghetto.ghettoId}:`);
        console.log(`      Threat: ${ghetto.threatLevel.toFixed(1)} | Pop: ${ghetto.population} | Distance: ${ghetto.distanceFromAlien.toFixed(1)}`);
        console.log(`      Strategic Value: ${ghetto.strategicValue.toFixed(1)} | Control: ${ghetto.controlStatus}`);
      });
    
    console.log(`\n🎲 TACTICAL DECISIONS:`);
    console.log(`   Should Retreat:  ${stateAnalysis.shouldRetreat ? '✓' : '✗'}`);
    console.log(`   Should Aggress:  ${stateAnalysis.shouldAggress ? '✓' : '✗'}`);
    console.log(`   Should Control:  ${stateAnalysis.shouldControl ? '✓' : '✗'}`);
    console.log(`   Should Bomb:     ${stateAnalysis.shouldBomb ? '✓' : '✗'}`);
    
    if (decision.alternativeActions.length > 0) {
      console.log(`\n🔄 ALTERNATIVE ACTIONS (Top 3):`);
      decision.alternativeActions.slice(0, 3).forEach((alt, index) => {
        console.log(`   ${index + 1}. ${this.formatActionType(alt.action.type)} - Score: ${alt.score.toFixed(1)}`);
        console.log(`      ${alt.reasoning}`);
      });
    }
    
    console.log(`\n⏱️  Execution time: ${executionTime}ms`);
    console.log('='.repeat(70) + '\n');
  }
  
  /**
   * Formatea el tipo de acción para display
   */
  private formatActionType(type: ActionType): string {
    const actionNames: Record<ActionType, string> = {
      [ActionType.START_GAME]: 'Start Game',
      [ActionType.END_TURN]: 'End Turn',
      [ActionType.ADVANCE_PHASE]: 'Advance Phase',
      [ActionType.EXPLORE_TILE]: 'Explore Tile',
      [ActionType.PLACE_TILE]: 'Place Tile',
      [ActionType.MOVE_CHARACTER]: 'Move Character',
      [ActionType.MOVE_ALIEN]: 'Move Alien',
      [ActionType.GATHER_RESOURCES]: 'Gather Resources',
      [ActionType.CONSUME_FOOD]: 'Consume Food',
      [ActionType.BUILD_STRUCTURE]: 'Build Structure',
      [ActionType.HEAL_WOUNDED]: 'Heal Wounded',
      [ActionType.TRANSFER_RESOURCES]: 'Transfer Resources',
      [ActionType.CONVERT_RESOURCES]: 'Convert Resources',
      [ActionType.ATTACK_ALIEN]: 'Attack Alien',
      [ActionType.ATTACK_MOTHERSHIP]: 'Attack Mothership',
      [ActionType.DEFEND]: 'Defend',
      [ActionType.ALIEN_ATTACK]: 'Alien Attack',
      [ActionType.ALIEN_CONTROL_GHETTO]: 'Control Ghetto',
      [ActionType.ALIEN_BOMB]: 'Bomb Tile',
      [ActionType.ALIEN_SCAN]: 'Scan Area',
      [ActionType.CHANGE_ROLE]: 'Change Role',
      [ActionType.ACTIVATE_BEACON]: 'Activate Beacon',
      [ActionType.ESCAPE_SHIP]: 'Escape Ship',
      [ActionType.END_GAME]: 'End Game',
    };
    
    return actionNames[type] || type;
  }
  
  /**
   * Obtiene todos los logs almacenados
   */
  getLogs(): AIDecisionLog[] {
    return [...this.logs];
  }
  
  /**
   * Obtiene logs de un turno específico
   */
  getLogsByTurn(turn: number): AIDecisionLog[] {
    return this.logs.filter(log => log.turnNumber === turn);
  }
  
  /**
   * Limpia todos los logs almacenados
   */
  clearLogs(): void {
    this.logs = [];
  }
  
  /**
   * Exporta logs a JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }
  
  /**
   * Genera un resumen de estadísticas de decisiones
   */
  getStatistics(): AILogStatistics {
    if (this.logs.length === 0) {
      return {
        totalDecisions: 0,
        averageConfidence: 0,
        averageExecutionTime: 0,
        actionTypeDistribution: {},
        averageScoreByAction: {},
      };
    }
    
    const totalDecisions = this.logs.length;
    
    const avgConfidence = 
      this.logs.reduce((sum, log) => sum + log.decision.confidence, 0) / totalDecisions;
    
    const avgExecTime = 
      this.logs.reduce((sum, log) => sum + log.executionTime, 0) / totalDecisions;
    
    // Distribución de tipos de acciones
    const actionTypeDistribution: Record<string, number> = {};
    const scoresByActionType: Record<string, number[]> = {};
    
    this.logs.forEach(log => {
      const actionType = log.decision.action.type;
      actionTypeDistribution[actionType] = (actionTypeDistribution[actionType] || 0) + 1;
      
      if (!scoresByActionType[actionType]) {
        scoresByActionType[actionType] = [];
      }
      scoresByActionType[actionType].push(log.decision.heuristics.totalScore);
    });
    
    // Promedio de score por tipo de acción
    const averageScoreByAction: Record<string, number> = {};
    Object.entries(scoresByActionType).forEach(([type, scores]) => {
      averageScoreByAction[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    
    return {
      totalDecisions,
      averageConfidence: avgConfidence,
      averageExecutionTime: avgExecTime,
      actionTypeDistribution,
      averageScoreByAction,
    };
  }
  
  /**
   * Actualiza configuración del logger
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export interface AILogStatistics {
  totalDecisions: number;
  averageConfidence: number;
  averageExecutionTime: number;
  actionTypeDistribution: Record<string, number>;
  averageScoreByAction: Record<string, number>;
}

// ============================================================================
// INSTANCIA GLOBAL (SINGLETON)
// ============================================================================

let globalLogger: AILogger | null = null;

/**
 * Obtiene la instancia global del logger
 */
export function getAILogger(): AILogger {
  if (!globalLogger) {
    globalLogger = new AILogger();
  }
  return globalLogger;
}

/**
 * Configura el logger global
 */
export function configureAILogger(config: Partial<LoggerConfig>): void {
  getAILogger().updateConfig(config);
}

/**
 * Helper para crear un log estructurado
 */
export function createDecisionLog(
  turnNumber: number,
  phase: string,
  difficulty: string,
  stateAnalysis: GameStateAnalysis,
  decision: AIDecision,
  executionTime: number
): AIDecisionLog {
  return {
    turnNumber,
    phase,
    difficulty: difficulty as any,
    stateAnalysis,
    decision,
    executionTime,
  };
}


