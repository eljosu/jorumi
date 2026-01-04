/**
 * JORUMI Game Engine - Phase State Machine
 *
 * Máquina de estados para las fases del juego
 * Manual: El juego se estructura en 8 fases por turno
 */
import { GamePhase, GameState } from '../domain/types';
/**
 * Descripción de cada fase
 */
export declare const PHASE_DESCRIPTIONS: Record<GamePhase, string>;
/**
 * Obtiene la siguiente fase en el ciclo
 */
export declare function getNextPhase(currentPhase: GamePhase): GamePhase;
/**
 * Verifica si una transición de fase es válida
 */
export declare function isValidPhaseTransition(from: GamePhase, to: GamePhase): boolean;
/**
 * Obtiene todas las fases en orden
 */
export declare function getAllPhasesInOrder(): GamePhase[];
/**
 * Clase que gestiona la máquina de estados de fases
 */
export declare class PhaseMachine {
    /**
     * Avanza a la siguiente fase
     */
    static advance(state: GameState): GamePhase;
    /**
     * Verifica si se puede avanzar de fase
     */
    static canAdvance(state: GameState): {
        can: boolean;
        reason?: string;
    };
    /**
     * Obtiene el índice de la fase actual (0-7)
     */
    static getPhaseIndex(phase: GamePhase): number;
    /**
     * Verifica si una fase es de acción humana
     */
    static isHumanPhase(phase: GamePhase): boolean;
    /**
     * Verifica si una fase es automática (no requiere input del jugador)
     */
    static isAutomaticPhase(phase: GamePhase): boolean;
    /**
     * Verifica si una fase es del alienígena
     */
    static isAlienPhase(phase: GamePhase): boolean;
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
//# sourceMappingURL=phase-machine.d.ts.map