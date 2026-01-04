/**
 * JORUMI AI - Alien AI Controller
 * 
 * Controlador principal de la IA alienígena
 * 
 * PRINCIPIOS CLAVE:
 * - La IA NO modifica el estado directamente
 * - La IA solo emite PlayerAction válidas
 * - Todas las acciones pasan por el motor de reglas
 * - La IA no tiene información oculta adicional
 * - La IA no altera resultados de dados
 */

import {
  GameState,
  GamePhase,
  AlienAttackFace,
  AlienActionFace,
} from '../../engine/domain/types';
import {
  GameAction,
  ActionType,
} from '../../engine/actions/types';
import {
  AIConfig,
  AIDecision,
  AIAction,
  DifficultyLevel,
  HeuristicBreakdown,
  GameStateAnalysis,
  AIContext,
} from './types';
import {
  analyzeGameState,
  evaluateAttackAction,
  evaluateControlAction,
  evaluateBombAction,
  evaluateMoveAction,
  evaluateScanAction,
  applyDifficultyWeights,
} from './heuristics';
import {
  generateAllAlienActions,
  filterValidActions,
  prioritizeActions,
} from './action-generator';
import {
  getDifficultyProfile,
  applyDifficultyAdjustment,
  shouldMakeMistake,
} from './difficulty-profiles';
import {
  getAILogger,
  createDecisionLog,
} from './logger';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_AI_CONFIG: AIConfig = {
  difficulty: DifficultyLevel.NORMAL,
  enableLogging: true,
  logVerbosity: 'normal',
  deterministicMode: false,
  decisionDelayMs: 500,
};

// ============================================================================
// ALIEN AI CONTROLLER
// ============================================================================

/**
 * Controlador principal de la IA alienígena
 */
export class AlienAIController {
  private config: AIConfig;
  private logger = getAILogger();
  
  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
    
    // Configurar logger
    this.logger.updateConfig({
      enabled: this.config.enableLogging,
      level: this.config.logVerbosity,
    });
  }
  
  /**
   * Decide y retorna la mejor acción para el turno alienígena actual
   * 
   * @param state - Estado actual del juego
   * @param attackDiceResult - Resultado del dado de ataque (opcional)
   * @param actionDiceResult - Resultado del dado de acción (opcional)
   * @returns Decisión de la IA con la acción seleccionada
   */
  decideTurn(
    state: GameState,
    attackDiceResult?: AlienAttackFace,
    actionDiceResult?: AlienActionFace
  ): AIDecision {
    const startTime = Date.now();
    
    // Verificar que estamos en fase alienígena
    if (state.phase !== GamePhase.ALIEN_TURN) {
      throw new Error(`Cannot decide alien turn in phase ${state.phase}`);
    }
    
    // 1. ANÁLISIS DEL ESTADO
    const stateAnalysis = this.analyzeState(state);
    
    // 2. GENERACIÓN DE ACCIONES POSIBLES
    const possibleActions = this.generateActions(
      state,
      attackDiceResult,
      actionDiceResult
    );
    
    if (possibleActions.length === 0) {
      // No hay acciones disponibles (caso raro)
      throw new Error('No valid alien actions available');
    }
    
    // 3. EVALUACIÓN DE ACCIONES
    const evaluatedActions = this.evaluateActions(
      possibleActions,
      state,
      stateAnalysis
    );
    
    // 4. SELECCIÓN DE ACCIÓN
    const selectedAction = this.selectAction(
      evaluatedActions,
      state
    );
    
    // 5. CREAR DECISIÓN
    const decision: AIDecision = {
      action: selectedAction.action,
      confidence: this.calculateConfidence(selectedAction, evaluatedActions),
      reasoning: selectedAction.reasoning,
      heuristics: selectedAction.heuristicBreakdown,
      alternativeActions: evaluatedActions
        .filter(a => a !== selectedAction)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5), // Top 5 alternativas
      timestamp: Date.now(),
    };
    
    // 6. LOGGING
    const executionTime = Date.now() - startTime;
    
    if (this.config.enableLogging) {
      const log = createDecisionLog(
        state.turn,
        state.phase,
        this.config.difficulty,
        stateAnalysis,
        decision,
        executionTime
      );
      this.logger.logDecision(log);
    }
    
    return decision;
  }
  
  /**
   * Analiza el estado del juego
   */
  private analyzeState(state: GameState): GameStateAnalysis {
    return analyzeGameState(state);
  }
  
  /**
   * Genera todas las acciones posibles
   */
  private generateActions(
    state: GameState,
    attackDiceResult?: AlienAttackFace,
    actionDiceResult?: AlienActionFace
  ): GameAction[] {
    // Generar todas las acciones posibles
    let actions = generateAllAlienActions(
      state,
      attackDiceResult,
      actionDiceResult
    );
    
    // Filtrar solo las válidas
    actions = filterValidActions(actions, state);
    
    // Priorizar para optimizar evaluación
    actions = prioritizeActions(actions);
    
    return actions;
  }
  
  /**
   * Evalúa todas las acciones con heurísticas
   */
  private evaluateActions(
    actions: GameAction[],
    state: GameState,
    analysis: GameStateAnalysis
  ): AIAction[] {
    const profile = getDifficultyProfile(this.config.difficulty);
    
    return actions.map(action => {
      // Evaluar según tipo de acción
      let heuristics: HeuristicBreakdown;
      let reasoning: string;
      
      switch (action.type) {
        case ActionType.ALIEN_ATTACK:
          const attackAction = action as any;
          heuristics = evaluateAttackAction(
            attackAction.targetGhettoId,
            state,
            analysis
          );
          reasoning = this.generateAttackReasoning(
            attackAction.targetGhettoId,
            analysis,
            heuristics
          );
          break;
        
        case ActionType.ALIEN_CONTROL_GHETTO:
          const controlAction = action as any;
          heuristics = evaluateControlAction(
            controlAction.ghettoId,
            state,
            analysis
          );
          reasoning = this.generateControlReasoning(
            controlAction.ghettoId,
            analysis,
            heuristics
          );
          break;
        
        case ActionType.ALIEN_BOMB:
          const bombAction = action as any;
          heuristics = evaluateBombAction(
            bombAction.tileId,
            state,
            analysis
          );
          reasoning = this.generateBombReasoning(
            bombAction.tileId,
            analysis,
            heuristics
          );
          break;
        
        case ActionType.MOVE_ALIEN:
          const moveAction = action as any;
          heuristics = evaluateMoveAction(
            moveAction.targetTileId,
            state,
            analysis
          );
          reasoning = this.generateMoveReasoning(
            moveAction.targetTileId,
            analysis,
            heuristics
          );
          break;
        
        case ActionType.ALIEN_SCAN:
          const scanAction = action as any;
          heuristics = evaluateScanAction(
            scanAction.targetTileId,
            state,
            analysis
          );
          reasoning = 'Scanning area for information';
          break;
        
        default:
          heuristics = {
            threatLevel: 0,
            opportunityScore: 0,
            strategicValue: 0,
            riskAssessment: 0,
            victoryProgress: 0,
            totalScore: 0,
          };
          reasoning = 'Unknown action type';
      }
      
      // Aplicar ponderaciones del perfil de dificultad
      const weightedScore = applyDifficultyWeights(
        heuristics,
        profile.weights
      );
      
      // Aplicar ajuste de dificultad (aleatoriedad)
      const finalScore = applyDifficultyAdjustment(
        weightedScore,
        profile,
        () => this.getRandom(state)
      );
      
      return {
        action,
        score: finalScore,
        reasoning,
        heuristicBreakdown: {
          ...heuristics,
          totalScore: finalScore,
        },
      };
    });
  }
  
  /**
   * Selecciona la mejor acción según el perfil de dificultad
   */
  private selectAction(
    evaluatedActions: AIAction[],
    state: GameState
  ): AIAction {
    const profile = getDifficultyProfile(this.config.difficulty);
    
    // Ordenar por puntuación
    const sorted = [...evaluatedActions].sort((a, b) => b.score - a.score);
    
    // Verificar si debe cometer un error (solo en dificultades bajas)
    if (shouldMakeMistake(profile, () => this.getRandom(state))) {
      // Seleccionar una acción subóptima
      const mistakeIndex = Math.floor(
        this.getRandom(state) * Math.min(5, sorted.length)
      );
      return sorted[mistakeIndex] || sorted[0];
    }
    
    // Seleccionar la mejor acción
    return sorted[0];
  }
  
  /**
   * Calcula la confianza en la decisión
   */
  private calculateConfidence(
    selected: AIAction,
    all: AIAction[]
  ): number {
    if (all.length === 1) {
      return 1.0; // Solo hay una opción
    }
    
    const sorted = [...all].sort((a, b) => b.score - a.score);
    const bestScore = sorted[0].score;
    const secondBestScore = sorted[1]?.score || 0;
    
    // Confianza basada en diferencia de score
    const scoreDiff = bestScore - secondBestScore;
    const confidence = Math.min(1.0, 0.5 + (scoreDiff / 100));
    
    return confidence;
  }
  
  /**
   * Obtiene un número aleatorio determinista o pseudoaleatorio
   */
  private getRandom(state: GameState): number {
    if (this.config.deterministicMode) {
      // Usar el RNG state del juego para determinismo
      return (state.rngState % 1000) / 1000;
    }
    return Math.random();
  }
  
  // ========================================================================
  // GENERADORES DE REASONING
  // ========================================================================
  
  private generateAttackReasoning(
    ghettoId: string,
    analysis: GameStateAnalysis,
    heuristics: HeuristicBreakdown
  ): string {
    const ghetto = analysis.ghettos.find(g => g.ghettoId === ghettoId);
    if (!ghetto) {
      return `Attacking ghetto ${ghettoId}`;
    }
    
    const reasons: string[] = [];
    
    if (ghetto.hasBeacon) {
      reasons.push('beacon detected (critical threat)');
    }
    if (ghetto.population > 7) {
      reasons.push('high population');
    }
    if (ghetto.distanceFromAlien < 2) {
      reasons.push('close proximity');
    }
    if (ghetto.threatLevel > 70) {
      reasons.push('high threat level');
    }
    
    const reasonStr = reasons.length > 0 
      ? `: ${reasons.join(', ')}` 
      : '';
    
    return `Attack ghetto ${ghettoId}${reasonStr} (threat: ${ghetto.threatLevel.toFixed(0)})`;
  }
  
  private generateControlReasoning(
    ghettoId: string,
    analysis: GameStateAnalysis,
    heuristics: HeuristicBreakdown
  ): string {
    const ghetto = analysis.ghettos.find(g => g.ghettoId === ghettoId);
    if (!ghetto) {
      return `Control ghetto ${ghettoId}`;
    }
    
    const reasons: string[] = [];
    
    if (ghetto.hasBeacon) {
      reasons.push('prevent beacon victory');
    }
    if (ghetto.resources.minerals > 3) {
      reasons.push('steal minerals');
    }
    if (ghetto.strategicValue > 60) {
      reasons.push('high strategic value');
    }
    
    const reasonStr = reasons.length > 0 
      ? `: ${reasons.join(', ')}` 
      : '';
    
    return `Control ghetto ${ghettoId}${reasonStr} (value: ${ghetto.strategicValue.toFixed(0)})`;
  }
  
  private generateBombReasoning(
    tileId: string,
    analysis: GameStateAnalysis,
    heuristics: HeuristicBreakdown
  ): string {
    // Verificar si hay un guetto en esta loseta
    const ghettoOnTile = analysis.ghettos.find(g => {
      // Necesitaríamos verificar el tileId del guetto
      // Por simplicidad, usar heurísticas
      return false;
    });
    
    if (heuristics.strategicValue > 80) {
      return `Bomb tile ${tileId}: destroy critical structure`;
    }
    
    if (heuristics.strategicValue > 40) {
      return `Bomb tile ${tileId}: isolate ghetto`;
    }
    
    return `Bomb tile ${tileId}: tactical destruction`;
  }
  
  private generateMoveReasoning(
    tileId: string,
    analysis: GameStateAnalysis,
    heuristics: HeuristicBreakdown
  ): string {
    if (analysis.shouldRetreat) {
      return `Move to ${tileId}: retreat to recover shield (current: ${analysis.alienShieldLevel})`;
    }
    
    if (heuristics.opportunityScore > 60) {
      return `Move to ${tileId}: position for attack`;
    }
    
    return `Move to ${tileId}: tactical repositioning`;
  }
  
  // ========================================================================
  // CONFIGURACIÓN
  // ========================================================================
  
  /**
   * Actualiza la configuración de la IA
   */
  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
    
    this.logger.updateConfig({
      enabled: this.config.enableLogging,
      level: this.config.logVerbosity,
    });
  }
  
  /**
   * Obtiene la configuración actual
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }
  
  /**
   * Cambia el nivel de dificultad
   */
  setDifficulty(level: DifficultyLevel): void {
    this.config.difficulty = level;
  }
  
  /**
   * Obtiene estadísticas de decisiones previas
   */
  getStatistics() {
    return this.logger.getStatistics();
  }
}

// ============================================================================
// FACTORY Y HELPERS
// ============================================================================

/**
 * Crea una instancia del controlador de IA con configuración por defecto
 */
export function createAlienAI(
  difficulty: DifficultyLevel = DifficultyLevel.NORMAL
): AlienAIController {
  return new AlienAIController({
    difficulty,
    enableLogging: true,
    logVerbosity: 'normal',
  });
}

/**
 * Crea una IA en modo silencioso (sin logs)
 */
export function createSilentAlienAI(
  difficulty: DifficultyLevel = DifficultyLevel.NORMAL
): AlienAIController {
  return new AlienAIController({
    difficulty,
    enableLogging: false,
  });
}

/**
 * Crea una IA determinista (para testing)
 */
export function createDeterministicAlienAI(
  difficulty: DifficultyLevel = DifficultyLevel.NORMAL
): AlienAIController {
  return new AlienAIController({
    difficulty,
    enableLogging: true,
    logVerbosity: 'verbose',
    deterministicMode: true,
  });
}


