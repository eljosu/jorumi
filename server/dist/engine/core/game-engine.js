"use strict";
/**
 * JORUMI Game Engine - Main Engine Class
 *
 * Orquestador principal del motor de juego
 * Punto de entrada para todas las operaciones del juego
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const state_factory_1 = require("./state-factory");
const action_reducer_1 = require("./action-reducer");
const validators_1 = require("../actions/validators");
const phase_machine_1 = require("../rules/phase-machine");
const rng_1 = require("../dice/rng");
const dice_1 = require("../dice/dice");
/**
 * Motor principal del juego JORUMI
 *
 * Características:
 * - Estado inmutable
 * - Determinista (con RNG seedeado)
 * - Serializable (para guardado y multiplayer)
 * - Replayable (historial de acciones)
 * - Desacoplado de UI
 *
 * @example
 * ```ts
 * const engine = new GameEngine();
 * engine.startGame({ playerNames: ['Alice', 'Bob'] });
 *
 * const action = {
 *   type: ActionType.MOVE_CHARACTER,
 *   playerId: 'player_123',
 *   characterId: 'char_456',
 *   targetTileId: 'tile_789',
 *   timestamp: Date.now(),
 * };
 *
 * const result = engine.applyAction(action);
 * if (result.success) {
 *   console.log('Action applied!', result.events);
 * }
 * ```
 */
class GameEngine {
    state = null;
    rng;
    diceManager;
    history = [];
    options;
    constructor(options = {}) {
        this.options = {
            enableLogging: options.enableLogging ?? false,
            enableHistory: options.enableHistory ?? true,
            maxHistorySize: options.maxHistorySize ?? 1000,
        };
        this.rng = rng_1.RandomFactory.createSeeded();
        this.diceManager = new dice_1.DiceManager();
    }
    // ==========================================================================
    // GESTIÓN DE PARTIDA
    // ==========================================================================
    /**
     * Inicia una nueva partida
     * Manual: Configuración inicial del juego
     */
    startGame(config) {
        this.log('Starting new game', config);
        // Crear estado inicial
        this.state = (0, state_factory_1.createInitialGameState)(config);
        // Inicializar RNG con seed del estado
        this.rng = rng_1.RandomFactory.createSeeded(this.state.rngSeed);
        // Limpiar historial
        this.history = [];
        this.log('Game started', { gameId: this.state.gameId, turn: this.state.turn });
        return (0, state_factory_1.cloneGameState)(this.state);
    }
    /**
     * Carga una partida desde un estado serializado
     */
    loadGame(serializedState) {
        this.log('Loading game from serialized state');
        this.state = (0, state_factory_1.deserializeGameState)(serializedState);
        // Restaurar RNG
        this.rng = rng_1.RandomFactory.fromState(this.state.rngState);
        return (0, state_factory_1.cloneGameState)(this.state);
    }
    /**
     * Guarda la partida actual
     */
    saveGame() {
        if (!this.state) {
            throw new Error('No active game to save');
        }
        return (0, state_factory_1.serializeGameState)(this.state);
    }
    /**
     * Obtiene el estado actual del juego (copia)
     */
    getState() {
        if (!this.state) {
            throw new Error('No active game');
        }
        return (0, state_factory_1.cloneGameState)(this.state);
    }
    /**
     * Verifica si hay una partida activa
     */
    hasActiveGame() {
        return this.state !== null && !this.state.gameOver;
    }
    // ==========================================================================
    // APLICACIÓN DE ACCIONES
    // ==========================================================================
    /**
     * Aplica una acción al estado del juego
     * Retorna el resultado con el nuevo estado
     */
    applyAction(action) {
        if (!this.state) {
            return {
                success: false,
                error: 'No active game',
            };
        }
        this.log('Applying action', action.type);
        // Aplicar acción mediante reducer
        const result = (0, action_reducer_1.reduceAction)(this.state, action);
        if (result.success && result.newState) {
            // Actualizar RNG state
            result.newState.rngState = this.rng.getState();
            // Actualizar estado
            this.state = result.newState;
            // Agregar a historial
            if (this.options.enableHistory) {
                this.addToHistory(action);
            }
            this.log('Action applied successfully', {
                phase: result.newState.phase,
                turn: result.newState.turn,
                events: result.events?.length ?? 0,
            });
        }
        else {
            this.log('Action failed', result.error);
        }
        return result;
    }
    /**
     * Valida una acción sin aplicarla
     */
    validateAction(action) {
        if (!this.state) {
            return { valid: false, reason: 'No active game' };
        }
        return (0, validators_1.validateAction)(this.state, action);
    }
    /**
     * Aplica múltiples acciones en secuencia
     */
    applyActions(actions) {
        for (const action of actions) {
            const result = this.applyAction(action);
            if (!result.success) {
                return result;
            }
        }
        return {
            success: true,
            newState: this.state,
        };
    }
    // ==========================================================================
    // GESTIÓN DE FASES
    // ==========================================================================
    /**
     * Avanza a la siguiente fase
     */
    advancePhase() {
        if (!this.state) {
            return {
                success: false,
                error: 'No active game',
            };
        }
        const canAdvance = phase_machine_1.PhaseMachine.canAdvance(this.state);
        if (!canAdvance.can) {
            return {
                success: false,
                error: canAdvance.reason,
            };
        }
        const nextPhase = phase_machine_1.PhaseMachine.advance(this.state);
        this.log('Advancing phase', {
            from: this.state.phase,
            to: nextPhase,
        });
        // Crear acción de avance de fase
        const action = {
            type: 'ADVANCE_PHASE',
            playerId: this.state.currentPlayerId,
            nextPhase,
            timestamp: Date.now(),
        };
        return this.applyAction(action);
    }
    /**
     * Obtiene información sobre la fase actual
     */
    getCurrentPhaseInfo() {
        if (!this.state) {
            throw new Error('No active game');
        }
        const phase = this.state.phase;
        return {
            phase,
            description: phase_machine_1.PhaseMachine.getPhaseIndex(phase).toString(),
            isHumanPhase: phase_machine_1.PhaseMachine.isHumanPhase(phase),
            isAlienPhase: phase_machine_1.PhaseMachine.isAlienPhase(phase),
            isAutomatic: phase_machine_1.PhaseMachine.isAutomaticPhase(phase),
        };
    }
    // ==========================================================================
    // DADOS Y RNG
    // ==========================================================================
    /**
     * Lanza un dado
     */
    rollDice(diceType) {
        return this.diceManager.roll(diceType, this.rng);
    }
    /**
     * Obtiene el generador de números aleatorios
     */
    getRNG() {
        return this.rng;
    }
    /**
     * Obtiene el gestor de dados
     */
    getDiceManager() {
        return this.diceManager;
    }
    // ==========================================================================
    // HISTORIAL Y REPLAY
    // ==========================================================================
    /**
     * Obtiene el historial de acciones
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Limpia el historial
     */
    clearHistory() {
        this.history = [];
    }
    /**
     * Reproduce una partida desde el historial
     */
    replay(config, actions) {
        this.startGame(config);
        for (const action of actions) {
            const result = this.applyAction(action);
            if (!result.success) {
                throw new Error(`Replay failed at action ${action.type}: ${result.error}`);
            }
        }
        return this.getState();
    }
    /**
     * Agrega una acción al historial
     */
    addToHistory(action) {
        this.history.push(action);
        // Limitar tamaño del historial
        if (this.history.length > this.options.maxHistorySize) {
            this.history.shift();
        }
    }
    // ==========================================================================
    // UTILIDADES
    // ==========================================================================
    /**
     * Obtiene estadísticas del juego
     */
    getStats() {
        if (!this.state) {
            throw new Error('No active game');
        }
        let totalHumans = 0;
        let totalResources = 0;
        this.state.ghettos.forEach(ghetto => {
            totalHumans += ghetto.population + ghetto.wounded;
            totalResources +=
                ghetto.resources.FOOD +
                    ghetto.resources.MEDICINE +
                    ghetto.resources.METAL +
                    ghetto.resources.MINERALS;
        });
        return {
            turn: this.state.turn,
            phase: this.state.phase,
            totalHumans,
            totalResources,
            alienShield: this.state.alien.shieldLevel,
            ghettoCount: this.state.ghettos.size,
            characterCount: this.state.characters.size,
        };
    }
    /**
     * Logging interno
     */
    log(message, data) {
        if (this.options.enableLogging) {
            console.log(`[JORUMI Engine] ${message}`, data ?? '');
        }
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=game-engine.js.map