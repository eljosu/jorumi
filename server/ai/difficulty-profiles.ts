/**
 * JORUMI AI - Difficulty Profiles
 * 
 * Perfiles de comportamiento para diferentes niveles de dificultad
 */

import { DifficultyLevel, DifficultyProfile } from './types';

// ============================================================================
// PERFILES DE DIFICULTAD
// ============================================================================

/**
 * EASY - Fácil
 * - Decisiones casi aleatorias
 * - Baja anticipación
 * - Baja agresividad
 * - Alta aleatoriedad
 */
export const EASY_PROFILE: DifficultyProfile = {
  level: DifficultyLevel.EASY,
  name: 'Fácil',
  description: 'IA con comportamiento errático y baja anticipación',
  
  weights: {
    threatResponse: 0.3,        // Responde poco a amenazas
    opportunitySeizing: 0.5,    // Aprovecha pocas oportunidades
    strategicPlanning: 0.2,     // Planificación mínima
    riskTaking: 0.6,            // Toma riesgos innecesarios
    victoryFocus: 0.3,          // Poco enfoque en victoria
  },
  
  behaviors: {
    randomnessWeight: 0.5,      // 50% de decisiones tienen componente aleatorio
    lookaheadTurns: 0,          // No mira al futuro
    shieldThreshold: 1,         // Se retira solo con escudo muy bajo
    aggressiveness: 0.4,        // Baja agresividad
    controlPriority: 0.3,       // Baja prioridad de control
  },
};

/**
 * NORMAL - Normal
 * - Heurísticas básicas
 * - Reacción al estado actual
 * - Balance entre agresión y defensa
 */
export const NORMAL_PROFILE: DifficultyProfile = {
  level: DifficultyLevel.NORMAL,
  name: 'Normal',
  description: 'IA con heurísticas básicas y comportamiento equilibrado',
  
  weights: {
    threatResponse: 0.5,        // Responde moderadamente
    opportunitySeizing: 0.6,    // Aprovecha oportunidades evidentes
    strategicPlanning: 0.4,     // Planificación básica
    riskTaking: 0.5,            // Balance riesgo/recompensa
    victoryFocus: 0.5,          // Enfoque moderado en victoria
  },
  
  behaviors: {
    randomnessWeight: 0.2,      // 20% aleatoriedad
    lookaheadTurns: 1,          // Considera 1 turno adelante
    shieldThreshold: 2,         // Se retira con escudo bajo
    aggressiveness: 0.6,        // Agresividad moderada
    controlPriority: 0.5,       // Prioridad moderada de control
  },
};

/**
 * HARD - Difícil
 * - Evaluación a varios turnos
 * - Bloqueo activo de condiciones de victoria
 * - Alta agresividad
 */
export const HARD_PROFILE: DifficultyProfile = {
  level: DifficultyLevel.HARD,
  name: 'Difícil',
  description: 'IA con planificación avanzada y bloqueo de victoria humana',
  
  weights: {
    threatResponse: 0.7,        // Alta respuesta a amenazas
    opportunitySeizing: 0.8,    // Aprovecha casi todas las oportunidades
    strategicPlanning: 0.7,     // Planificación a medio plazo
    riskTaking: 0.4,            // Evita riesgos innecesarios
    victoryFocus: 0.8,          // Alto enfoque en victoria alienígena
  },
  
  behaviors: {
    randomnessWeight: 0.1,      // 10% aleatoriedad
    lookaheadTurns: 2,          // Considera 2 turnos adelante
    shieldThreshold: 3,         // Se retira proactivamente
    aggressiveness: 0.8,        // Alta agresividad
    controlPriority: 0.7,       // Alta prioridad de control
  },
};

/**
 * EXPERT - Experto
 * - Juego agresivo
 * - Priorización matemática de impacto
 * - Bloqueo óptimo de victorias humanas
 * - Minimiza errores
 */
export const EXPERT_PROFILE: DifficultyProfile = {
  level: DifficultyLevel.EXPERT,
  name: 'Experto',
  description: 'IA con optimización matemática y juego agresivo',
  
  weights: {
    threatResponse: 0.9,        // Respuesta óptima a amenazas
    opportunitySeizing: 0.9,    // Aprovecha todas las oportunidades
    strategicPlanning: 0.9,     // Planificación a largo plazo
    riskTaking: 0.3,            // Minimiza riesgos
    victoryFocus: 1.0,          // Máximo enfoque en victoria
  },
  
  behaviors: {
    randomnessWeight: 0.0,      // Sin aleatoriedad (determinista)
    lookaheadTurns: 3,          // Considera 3 turnos adelante
    shieldThreshold: 4,         // Se retira preventivamente
    aggressiveness: 1.0,        // Máxima agresividad calculada
    controlPriority: 0.9,       // Máxima prioridad de control
  },
};

// ============================================================================
// MAPA DE PERFILES
// ============================================================================

/**
 * Mapa de todos los perfiles disponibles por nivel
 */
export const DIFFICULTY_PROFILES: Record<DifficultyLevel, DifficultyProfile> = {
  [DifficultyLevel.EASY]: EASY_PROFILE,
  [DifficultyLevel.NORMAL]: NORMAL_PROFILE,
  [DifficultyLevel.HARD]: HARD_PROFILE,
  [DifficultyLevel.EXPERT]: EXPERT_PROFILE,
};

/**
 * Obtiene un perfil de dificultad por nivel
 */
export function getDifficultyProfile(level: DifficultyLevel): DifficultyProfile {
  return DIFFICULTY_PROFILES[level];
}

/**
 * Obtiene todos los perfiles disponibles
 */
export function getAllProfiles(): DifficultyProfile[] {
  return Object.values(DIFFICULTY_PROFILES);
}

/**
 * Valida si un nivel de dificultad es válido
 */
export function isValidDifficulty(level: string): level is DifficultyLevel {
  return Object.values(DifficultyLevel).includes(level as DifficultyLevel);
}

// ============================================================================
// AJUSTES DE COMPORTAMIENTO
// ============================================================================

/**
 * Ajusta la puntuación de una acción según el perfil de dificultad
 * Aplica aleatoriedad según el perfil
 */
export function applyDifficultyAdjustment(
  score: number,
  profile: DifficultyProfile,
  rng: () => number // Función RNG (0-1)
): number {
  const randomness = profile.behaviors.randomnessWeight;
  
  if (randomness === 0) {
    return score; // Sin aleatoriedad (experto)
  }
  
  // Aplicar variación aleatoria
  const randomFactor = 1 + (rng() - 0.5) * 2 * randomness;
  const adjustedScore = score * randomFactor;
  
  return Math.max(0, adjustedScore);
}

/**
 * Determina si la IA debe tomar una decisión subóptima (errores)
 * Retorna true si debe "equivocarse"
 */
export function shouldMakeMistake(
  profile: DifficultyProfile,
  rng: () => number
): boolean {
  const mistakeChance = profile.behaviors.randomnessWeight * 0.3; // 0-15% de error
  return rng() < mistakeChance;
}

/**
 * Calcula el delay simulado de decisión (para UX)
 * Más difícil = "piensa" más tiempo
 */
export function getDecisionDelayMs(profile: DifficultyProfile): number {
  const baseDelay = 500; // 500ms base
  
  switch (profile.level) {
    case DifficultyLevel.EASY:
      return baseDelay * 0.5; // 250ms
    case DifficultyLevel.NORMAL:
      return baseDelay; // 500ms
    case DifficultyLevel.HARD:
      return baseDelay * 1.5; // 750ms
    case DifficultyLevel.EXPERT:
      return baseDelay * 2; // 1000ms
    default:
      return baseDelay;
  }
}


