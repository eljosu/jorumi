/**
 * JORUMI AI - Main Export
 * 
 * Módulo de IA alienígena para JORUMI
 */

// Controlador principal
export {
  AlienAIController,
  createAlienAI,
  createSilentAlienAI,
  createDeterministicAlienAI,
} from './AlienAIController';

// Tipos
export type {
  AIContext,
  AIAction,
  AIDecision,
  AIConfig,
  DifficultyProfile,
  GameStateAnalysis,
  GhettoThreatAssessment,
  HeuristicBreakdown,
  AIDecisionLog,
  TacticalGoal,
} from './types';

export {
  DifficultyLevel,
} from './types';

// Perfiles de dificultad
export {
  getDifficultyProfile,
  getAllProfiles,
  isValidDifficulty,
  EASY_PROFILE,
  NORMAL_PROFILE,
  HARD_PROFILE,
  EXPERT_PROFILE,
} from './difficulty-profiles';

// Logger
export {
  getAILogger,
  configureAILogger,
  AILogger,
} from './logger';

export type {
  LogLevel,
  LoggerConfig,
  AILogStatistics,
} from './logger';

// Heurísticas (exportadas para testing y debugging)
export {
  analyzeGameState,
  evaluateGhettoThreat,
  evaluateAttackAction,
  evaluateControlAction,
  evaluateBombAction,
  evaluateMoveAction,
  evaluateScanAction,
} from './heuristics';

// Generador de acciones (exportado para testing)
export {
  generateAllAlienActions,
  generateMoveActions,
  generateAttackActions,
  generateControlActions,
  generateBombActions,
  generateScanActions,
} from './action-generator';


