/**
 * JORUMI Game Engine - Phase State Machine
 * 
 * Máquina de estados para las fases del juego
 * Manual: El juego se estructura en 8 fases por turno
 */

import { GamePhase, GameState } from '../domain/types';

/**
 * Definición de transiciones válidas entre fases
 * Manual: Las fases deben seguir un orden específico
 */
const PHASE_TRANSITIONS: Record<GamePhase, GamePhase> = {
  [GamePhase.PREPARATION]: GamePhase.EXPLORATION,
  [GamePhase.EXPLORATION]: GamePhase.MOVEMENT,
  [GamePhase.MOVEMENT]: GamePhase.RESOURCE_GATHERING,
  [GamePhase.RESOURCE_GATHERING]: GamePhase.TRADING,
  [GamePhase.TRADING]: GamePhase.ALIEN_TURN,
  [GamePhase.ALIEN_TURN]: GamePhase.ROLE_CHECK,
  [GamePhase.ROLE_CHECK]: GamePhase.END_GAME_CHECK,
  [GamePhase.END_GAME_CHECK]: GamePhase.PREPARATION, // Nuevo turno
};

/**
 * Descripción de cada fase
 */
export const PHASE_DESCRIPTIONS: Record<GamePhase, string> = {
  [GamePhase.PREPARATION]: 'Preparación - Resetear personajes y verificar recursos',
  [GamePhase.EXPLORATION]: 'Exploración - Colocar nuevas losetas en el mapa',
  [GamePhase.MOVEMENT]: 'Movimiento - Mover personajes por el mapa',
  [GamePhase.RESOURCE_GATHERING]: 'Obtención de recursos - Recolectar comida, metal, minerales',
  [GamePhase.TRADING]: 'Intercambio - Transferir y convertir recursos, construir',
  [GamePhase.ALIEN_TURN]: 'Turno alienígena - El alienígena ataca y se mueve',
  [GamePhase.ROLE_CHECK]: 'Comprobación de rol - Verificar cambios de control',
  [GamePhase.END_GAME_CHECK]: 'Comprobación de final - Verificar condiciones de victoria/derrota',
};

/**
 * Obtiene la siguiente fase en el ciclo
 */
export function getNextPhase(currentPhase: GamePhase): GamePhase {
  return PHASE_TRANSITIONS[currentPhase];
}

/**
 * Verifica si una transición de fase es válida
 */
export function isValidPhaseTransition(from: GamePhase, to: GamePhase): boolean {
  return PHASE_TRANSITIONS[from] === to;
}

/**
 * Obtiene todas las fases en orden
 */
export function getAllPhasesInOrder(): GamePhase[] {
  return [
    GamePhase.PREPARATION,
    GamePhase.EXPLORATION,
    GamePhase.MOVEMENT,
    GamePhase.RESOURCE_GATHERING,
    GamePhase.TRADING,
    GamePhase.ALIEN_TURN,
    GamePhase.ROLE_CHECK,
    GamePhase.END_GAME_CHECK,
  ];
}

/**
 * Clase que gestiona la máquina de estados de fases
 */
export class PhaseMachine {
  /**
   * Avanza a la siguiente fase
   */
  static advance(state: GameState): GamePhase {
    const currentPhase = state.phase;
    const nextPhase = getNextPhase(currentPhase);
    
    // Si completamos un ciclo completo, incrementar turno
    if (currentPhase === GamePhase.END_GAME_CHECK && nextPhase === GamePhase.PREPARATION) {
      // El incremento del turno se maneja en el reducer
    }
    
    return nextPhase;
  }
  
  /**
   * Verifica si se puede avanzar de fase
   */
  static canAdvance(state: GameState): { can: boolean; reason?: string } {
    // Verificar condiciones específicas de cada fase antes de avanzar
    switch (state.phase) {
      case GamePhase.PREPARATION:
        // La preparación siempre puede avanzar (es automática)
        return { can: true };
      
      case GamePhase.EXPLORATION:
        // Debe haber al menos un número mínimo de losetas exploradas
        // (en la práctica, puede ser opcional según turno)
        return { can: true };
      
      case GamePhase.MOVEMENT:
        // Todos los personajes que van a moverse lo han hecho
        return { can: true };
      
      case GamePhase.RESOURCE_GATHERING:
        // Se han recolectado los recursos
        return { can: true };
      
      case GamePhase.TRADING:
        // Se han completado los intercambios
        return { can: true };
      
      case GamePhase.ALIEN_TURN:
        // El turno alienígena debe completarse
        return { can: true };
      
      case GamePhase.ROLE_CHECK:
        // Verificación automática
        return { can: true };
      
      case GamePhase.END_GAME_CHECK:
        if (state.gameOver) {
          return { can: false, reason: 'Game is over' };
        }
        return { can: true };
      
      default:
        return { can: false, reason: 'Unknown phase' };
    }
  }
  
  /**
   * Obtiene el índice de la fase actual (0-7)
   */
  static getPhaseIndex(phase: GamePhase): number {
    return getAllPhasesInOrder().indexOf(phase);
  }
  
  /**
   * Verifica si una fase es de acción humana
   */
  static isHumanPhase(phase: GamePhase): boolean {
    return [
      GamePhase.EXPLORATION,
      GamePhase.MOVEMENT,
      GamePhase.RESOURCE_GATHERING,
      GamePhase.TRADING,
    ].includes(phase);
  }
  
  /**
   * Verifica si una fase es automática (no requiere input del jugador)
   */
  static isAutomaticPhase(phase: GamePhase): boolean {
    return [
      GamePhase.PREPARATION,
      GamePhase.ROLE_CHECK,
      GamePhase.END_GAME_CHECK,
    ].includes(phase);
  }
  
  /**
   * Verifica si una fase es del alienígena
   */
  static isAlienPhase(phase: GamePhase): boolean {
    return phase === GamePhase.ALIEN_TURN;
  }
}

/**
 * Hook de entrada de fase - ejecuta lógica automática al entrar en una fase
 */
export interface PhaseEnterHook {
  phase: GamePhase;
  execute: (state: GameState) => GameState;
}

/**
 * Hook de salida de fase - ejecuta lógica automática al salir de una fase
 */
export interface PhaseExitHook {
  phase: GamePhase;
  execute: (state: GameState) => GameState;
}


