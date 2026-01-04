"use strict";
/**
 * JORUMI Game Engine - Phase State Machine
 *
 * Máquina de estados para las fases del juego
 * Manual: El juego se estructura en 8 fases por turno
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseMachine = exports.PHASE_DESCRIPTIONS = void 0;
exports.getNextPhase = getNextPhase;
exports.isValidPhaseTransition = isValidPhaseTransition;
exports.getAllPhasesInOrder = getAllPhasesInOrder;
const types_1 = require("../domain/types");
/**
 * Definición de transiciones válidas entre fases
 * Manual: Las fases deben seguir un orden específico
 */
const PHASE_TRANSITIONS = {
    [types_1.GamePhase.PREPARATION]: types_1.GamePhase.EXPLORATION,
    [types_1.GamePhase.EXPLORATION]: types_1.GamePhase.MOVEMENT,
    [types_1.GamePhase.MOVEMENT]: types_1.GamePhase.RESOURCE_GATHERING,
    [types_1.GamePhase.RESOURCE_GATHERING]: types_1.GamePhase.TRADING,
    [types_1.GamePhase.TRADING]: types_1.GamePhase.ALIEN_TURN,
    [types_1.GamePhase.ALIEN_TURN]: types_1.GamePhase.ROLE_CHECK,
    [types_1.GamePhase.ROLE_CHECK]: types_1.GamePhase.END_GAME_CHECK,
    [types_1.GamePhase.END_GAME_CHECK]: types_1.GamePhase.PREPARATION, // Nuevo turno
};
/**
 * Descripción de cada fase
 */
exports.PHASE_DESCRIPTIONS = {
    [types_1.GamePhase.PREPARATION]: 'Preparación - Resetear personajes y verificar recursos',
    [types_1.GamePhase.EXPLORATION]: 'Exploración - Colocar nuevas losetas en el mapa',
    [types_1.GamePhase.MOVEMENT]: 'Movimiento - Mover personajes por el mapa',
    [types_1.GamePhase.RESOURCE_GATHERING]: 'Obtención de recursos - Recolectar comida, metal, minerales',
    [types_1.GamePhase.TRADING]: 'Intercambio - Transferir y convertir recursos, construir',
    [types_1.GamePhase.ALIEN_TURN]: 'Turno alienígena - El alienígena ataca y se mueve',
    [types_1.GamePhase.ROLE_CHECK]: 'Comprobación de rol - Verificar cambios de control',
    [types_1.GamePhase.END_GAME_CHECK]: 'Comprobación de final - Verificar condiciones de victoria/derrota',
};
/**
 * Obtiene la siguiente fase en el ciclo
 */
function getNextPhase(currentPhase) {
    return PHASE_TRANSITIONS[currentPhase];
}
/**
 * Verifica si una transición de fase es válida
 */
function isValidPhaseTransition(from, to) {
    return PHASE_TRANSITIONS[from] === to;
}
/**
 * Obtiene todas las fases en orden
 */
function getAllPhasesInOrder() {
    return [
        types_1.GamePhase.PREPARATION,
        types_1.GamePhase.EXPLORATION,
        types_1.GamePhase.MOVEMENT,
        types_1.GamePhase.RESOURCE_GATHERING,
        types_1.GamePhase.TRADING,
        types_1.GamePhase.ALIEN_TURN,
        types_1.GamePhase.ROLE_CHECK,
        types_1.GamePhase.END_GAME_CHECK,
    ];
}
/**
 * Clase que gestiona la máquina de estados de fases
 */
class PhaseMachine {
    /**
     * Avanza a la siguiente fase
     */
    static advance(state) {
        const currentPhase = state.phase;
        const nextPhase = getNextPhase(currentPhase);
        // Si completamos un ciclo completo, incrementar turno
        if (currentPhase === types_1.GamePhase.END_GAME_CHECK && nextPhase === types_1.GamePhase.PREPARATION) {
            // El incremento del turno se maneja en el reducer
        }
        return nextPhase;
    }
    /**
     * Verifica si se puede avanzar de fase
     */
    static canAdvance(state) {
        // Verificar condiciones específicas de cada fase antes de avanzar
        switch (state.phase) {
            case types_1.GamePhase.PREPARATION:
                // La preparación siempre puede avanzar (es automática)
                return { can: true };
            case types_1.GamePhase.EXPLORATION:
                // Debe haber al menos un número mínimo de losetas exploradas
                // (en la práctica, puede ser opcional según turno)
                return { can: true };
            case types_1.GamePhase.MOVEMENT:
                // Todos los personajes que van a moverse lo han hecho
                return { can: true };
            case types_1.GamePhase.RESOURCE_GATHERING:
                // Se han recolectado los recursos
                return { can: true };
            case types_1.GamePhase.TRADING:
                // Se han completado los intercambios
                return { can: true };
            case types_1.GamePhase.ALIEN_TURN:
                // El turno alienígena debe completarse
                return { can: true };
            case types_1.GamePhase.ROLE_CHECK:
                // Verificación automática
                return { can: true };
            case types_1.GamePhase.END_GAME_CHECK:
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
    static getPhaseIndex(phase) {
        return getAllPhasesInOrder().indexOf(phase);
    }
    /**
     * Verifica si una fase es de acción humana
     */
    static isHumanPhase(phase) {
        return [
            types_1.GamePhase.EXPLORATION,
            types_1.GamePhase.MOVEMENT,
            types_1.GamePhase.RESOURCE_GATHERING,
            types_1.GamePhase.TRADING,
        ].includes(phase);
    }
    /**
     * Verifica si una fase es automática (no requiere input del jugador)
     */
    static isAutomaticPhase(phase) {
        return [
            types_1.GamePhase.PREPARATION,
            types_1.GamePhase.ROLE_CHECK,
            types_1.GamePhase.END_GAME_CHECK,
        ].includes(phase);
    }
    /**
     * Verifica si una fase es del alienígena
     */
    static isAlienPhase(phase) {
        return phase === types_1.GamePhase.ALIEN_TURN;
    }
}
exports.PhaseMachine = PhaseMachine;
//# sourceMappingURL=phase-machine.js.map