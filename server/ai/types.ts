/**
 * JORUMI AI - Type Definitions
 * 
 * Tipos para el sistema de IA alienígena
 */

import { GameState, GhettoId, TileId } from '../../engine/domain/types';
import { GameAction } from '../../engine/actions/types';

// ============================================================================
// CONTEXTO DE LA IA
// ============================================================================

/**
 * Contexto completo para la toma de decisiones de la IA
 */
export interface AIContext {
  gameState: GameState;
  difficulty: DifficultyLevel;
  turnNumber: number;
  availableActions: AIAction[];
}

/**
 * Acción evaluada por la IA con su puntuación
 */
export interface AIAction {
  action: GameAction;
  score: number;
  reasoning: string;
  heuristicBreakdown: HeuristicBreakdown;
}

/**
 * Desglose de puntuaciones por heurística
 */
export interface HeuristicBreakdown {
  threatLevel: number;
  opportunityScore: number;
  strategicValue: number;
  riskAssessment: number;
  victoryProgress: number;
  totalScore: number;
}

// ============================================================================
// NIVELES DE DIFICULTAD
// ============================================================================

export enum DifficultyLevel {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

/**
 * Perfil de comportamiento según dificultad
 */
export interface DifficultyProfile {
  level: DifficultyLevel;
  name: string;
  description: string;
  
  // Ponderaciones de heurísticas (0-1)
  weights: {
    threatResponse: number;      // Reacción a amenazas
    opportunitySeizing: number;   // Aprovechamiento de oportunidades
    strategicPlanning: number;    // Planificación a largo plazo
    riskTaking: number;           // Tolerancia al riesgo
    victoryFocus: number;         // Enfoque en victoria alienígena
  };
  
  // Comportamientos específicos
  behaviors: {
    randomnessWeight: number;     // 0-1: Cuánta aleatoriedad en decisiones
    lookaheadTurns: number;       // Turnos que considera a futuro
    shieldThreshold: number;      // Nivel mínimo de escudo antes de retirarse
    aggressiveness: number;       // 0-1: Qué tan agresivo es
    controlPriority: number;      // 0-1: Prioridad de controlar guettos
  };
}

// ============================================================================
// EVALUACIÓN DEL ESTADO
// ============================================================================

/**
 * Evaluación de un guetto desde perspectiva alienígena
 */
export interface GhettoThreatAssessment {
  ghettoId: GhettoId;
  threatLevel: number;          // 0-100
  population: number;
  wounded: number;
  resources: {
    food: number;
    medicine: number;
    metal: number;
    minerals: number;
  };
  buildings: string[];
  hasBeacon: boolean;
  hasBunker: boolean;
  hasHospital: boolean;
  controlStatus: string;
  distanceFromAlien: number;
  strategicValue: number;       // 0-100
}

/**
 * Análisis global del estado del juego
 */
export interface GameStateAnalysis {
  // Situación general
  turnNumber: number;
  phase: string;
  
  // Estado humano
  totalHumanPopulation: number;
  totalWounded: number;
  humanResourceStrength: number;  // 0-100
  humanThreatLevel: number;       // 0-100
  humanVictoryProgress: number;   // 0-100
  
  // Estado alienígena
  alienShieldLevel: number;
  alienControlTokens: number;
  mothershipHealth: number;
  mothershipUnderThreat: boolean;
  
  // Evaluación de guettos
  ghettos: GhettoThreatAssessment[];
  
  // Objetivos tácticos
  primaryTarget?: GhettoId;
  secondaryTargets: GhettoId[];
  criticalThreats: GhettoId[];
  
  // Evaluación estratégica
  shouldRetreat: boolean;
  shouldAggress: boolean;
  shouldControl: boolean;
  shouldBomb: boolean;
}

// ============================================================================
// DECISIÓN DE LA IA
// ============================================================================

/**
 * Decisión final de la IA
 */
export interface AIDecision {
  action: GameAction;
  confidence: number;           // 0-1
  reasoning: string;
  heuristics: HeuristicBreakdown;
  alternativeActions: AIAction[];
  timestamp: number;
}

/**
 * Log de decisión para debugging
 */
export interface AIDecisionLog {
  turnNumber: number;
  phase: string;
  difficulty: DifficultyLevel;
  stateAnalysis: GameStateAnalysis;
  decision: AIDecision;
  executionTime: number;        // ms
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

/**
 * Objetivo táctico de la IA
 */
export enum TacticalGoal {
  ELIMINATE_HUMANS = 'ELIMINATE_HUMANS',
  CONTROL_RESOURCES = 'CONTROL_RESOURCES',
  PREVENT_BEACON = 'PREVENT_BEACON',
  DEFEND_MOTHERSHIP = 'DEFEND_MOTHERSHIP',
  ISOLATE_GHETTOS = 'ISOLATE_GHETTOS',
  STEAL_RESOURCES = 'STEAL_RESOURCES',
  MAINTAIN_SHIELD = 'MAINTAIN_SHIELD',
}

/**
 * Resultado de validación de acción
 */
export interface ActionValidation {
  valid: boolean;
  reason?: string;
}

/**
 * Opciones de configuración de la IA
 */
export interface AIConfig {
  difficulty: DifficultyLevel;
  enableLogging: boolean;
  logVerbosity: 'minimal' | 'normal' | 'verbose';
  deterministicMode: boolean;   // Si true, usa seed fija
  decisionDelayMs: number;      // Delay simulado para UX
}


