/**
 * JORUMI Game Engine - Main Engine Class
 *
 * Orquestador principal del motor de juego
 * Punto de entrada para todas las operaciones del juego
 */
import { GameState, GamePhase } from '../domain/types';
import { GameAction, ActionResult } from '../actions/types';
import { GameConfig } from './state-factory';
import { RandomGenerator } from '../dice/rng';
import { DiceManager } from '../dice/dice';
/**
 * Opciones del motor
 */
export interface EngineOptions {
    enableLogging?: boolean;
    enableHistory?: boolean;
    maxHistorySize?: number;
}
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
export declare class GameEngine {
    private state;
    private rng;
    private diceManager;
    private history;
    private options;
    constructor(options?: EngineOptions);
    /**
     * Inicia una nueva partida
     * Manual: Configuración inicial del juego
     */
    startGame(config: GameConfig): GameState;
    /**
     * Carga una partida desde un estado serializado
     */
    loadGame(serializedState: string): GameState;
    /**
     * Guarda la partida actual
     */
    saveGame(): string;
    /**
     * Obtiene el estado actual del juego (copia)
     */
    getState(): GameState;
    /**
     * Verifica si hay una partida activa
     */
    hasActiveGame(): boolean;
    /**
     * Aplica una acción al estado del juego
     * Retorna el resultado con el nuevo estado
     */
    applyAction(action: GameAction): ActionResult;
    /**
     * Valida una acción sin aplicarla
     */
    validateAction(action: GameAction): {
        valid: boolean;
        reason?: string;
    };
    /**
     * Aplica múltiples acciones en secuencia
     */
    applyActions(actions: GameAction[]): ActionResult;
    /**
     * Avanza a la siguiente fase
     */
    advancePhase(): ActionResult;
    /**
     * Obtiene información sobre la fase actual
     */
    getCurrentPhaseInfo(): {
        phase: GamePhase;
        description: string;
        isHumanPhase: boolean;
        isAlienPhase: boolean;
        isAutomatic: boolean;
    };
    /**
     * Lanza un dado
     */
    rollDice(diceType: any): any;
    /**
     * Obtiene el generador de números aleatorios
     */
    getRNG(): RandomGenerator;
    /**
     * Obtiene el gestor de dados
     */
    getDiceManager(): DiceManager;
    /**
     * Obtiene el historial de acciones
     */
    getHistory(): readonly GameAction[];
    /**
     * Limpia el historial
     */
    clearHistory(): void;
    /**
     * Reproduce una partida desde el historial
     */
    replay(config: GameConfig, actions: GameAction[]): GameState;
    /**
     * Agrega una acción al historial
     */
    private addToHistory;
    /**
     * Obtiene estadísticas del juego
     */
    getStats(): {
        turn: number;
        phase: GamePhase;
        totalHumans: number;
        totalResources: number;
        alienShield: number;
        ghettoCount: number;
        characterCount: number;
    };
    /**
     * Logging interno
     */
    private log;
}
//# sourceMappingURL=game-engine.d.ts.map