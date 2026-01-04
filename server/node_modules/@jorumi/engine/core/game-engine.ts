/**
 * JORUMI Game Engine - Main Engine Class
 * 
 * Orquestador principal del motor de juego
 * Punto de entrada para todas las operaciones del juego
 */

import { GameState, GamePhase } from '../domain/types';
import { GameAction, ActionResult } from '../actions/types';
import { 
  GameConfig, 
  createInitialGameState, 
  cloneGameState,
  serializeGameState,
  deserializeGameState 
} from './state-factory';
import { reduceAction } from './action-reducer';
import { validateAction } from '../actions/validators';
import { PhaseMachine } from '../rules/phase-machine';
import { RandomGenerator, RandomFactory } from '../dice/rng';
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
export class GameEngine {
  private state: GameState | null = null;
  private rng: RandomGenerator;
  private diceManager: DiceManager;
  private history: GameAction[] = [];
  private options: Required<EngineOptions>;
  
  constructor(options: EngineOptions = {}) {
    this.options = {
      enableLogging: options.enableLogging ?? false,
      enableHistory: options.enableHistory ?? true,
      maxHistorySize: options.maxHistorySize ?? 1000,
    };
    
    this.rng = RandomFactory.createSeeded();
    this.diceManager = new DiceManager();
  }
  
  // ==========================================================================
  // GESTIÓN DE PARTIDA
  // ==========================================================================
  
  /**
   * Inicia una nueva partida
   * Manual: Configuración inicial del juego
   */
  startGame(config: GameConfig): GameState {
    this.log('Starting new game', config);
    
    // Crear estado inicial
    this.state = createInitialGameState(config);
    
    // Inicializar RNG con seed del estado
    this.rng = RandomFactory.createSeeded(this.state.rngSeed);
    
    // Limpiar historial
    this.history = [];
    
    this.log('Game started', { gameId: this.state.gameId, turn: this.state.turn });
    
    return cloneGameState(this.state);
  }
  
  /**
   * Carga una partida desde un estado serializado
   */
  loadGame(serializedState: string): GameState {
    this.log('Loading game from serialized state');
    
    this.state = deserializeGameState(serializedState);
    
    // Restaurar RNG
    this.rng = RandomFactory.fromState(this.state.rngState);
    
    return cloneGameState(this.state);
  }
  
  /**
   * Guarda la partida actual
   */
  saveGame(): string {
    if (!this.state) {
      throw new Error('No active game to save');
    }
    
    return serializeGameState(this.state);
  }
  
  /**
   * Obtiene el estado actual del juego (copia)
   */
  getState(): GameState {
    if (!this.state) {
      throw new Error('No active game');
    }
    
    return cloneGameState(this.state);
  }
  
  /**
   * Verifica si hay una partida activa
   */
  hasActiveGame(): boolean {
    return this.state !== null && !this.state.gameOver;
  }
  
  // ==========================================================================
  // APLICACIÓN DE ACCIONES
  // ==========================================================================
  
  /**
   * Aplica una acción al estado del juego
   * Retorna el resultado con el nuevo estado
   */
  applyAction(action: GameAction): ActionResult {
    if (!this.state) {
      return {
        success: false,
        error: 'No active game',
      };
    }
    
    this.log('Applying action', action.type);
    
    // Aplicar acción mediante reducer
    const result = reduceAction(this.state, action);
    
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
    } else {
      this.log('Action failed', result.error);
    }
    
    return result;
  }
  
  /**
   * Valida una acción sin aplicarla
   */
  validateAction(action: GameAction): { valid: boolean; reason?: string } {
    if (!this.state) {
      return { valid: false, reason: 'No active game' };
    }
    
    return validateAction(this.state, action);
  }
  
  /**
   * Aplica múltiples acciones en secuencia
   */
  applyActions(actions: GameAction[]): ActionResult {
    for (const action of actions) {
      const result = this.applyAction(action);
      if (!result.success) {
        return result;
      }
    }
    
    return {
      success: true,
      newState: this.state!,
    };
  }
  
  // ==========================================================================
  // GESTIÓN DE FASES
  // ==========================================================================
  
  /**
   * Avanza a la siguiente fase
   */
  advancePhase(): ActionResult {
    if (!this.state) {
      return {
        success: false,
        error: 'No active game',
      };
    }
    
    const canAdvance = PhaseMachine.canAdvance(this.state);
    if (!canAdvance.can) {
      return {
        success: false,
        error: canAdvance.reason,
      };
    }
    
    const nextPhase = PhaseMachine.advance(this.state);
    
    this.log('Advancing phase', {
      from: this.state.phase,
      to: nextPhase,
    });
    
    // Crear acción de avance de fase
    const action: any = {
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
  getCurrentPhaseInfo(): {
    phase: GamePhase;
    description: string;
    isHumanPhase: boolean;
    isAlienPhase: boolean;
    isAutomatic: boolean;
  } {
    if (!this.state) {
      throw new Error('No active game');
    }
    
    const phase = this.state.phase;
    
    return {
      phase,
      description: PhaseMachine.getPhaseIndex(phase).toString(),
      isHumanPhase: PhaseMachine.isHumanPhase(phase),
      isAlienPhase: PhaseMachine.isAlienPhase(phase),
      isAutomatic: PhaseMachine.isAutomaticPhase(phase),
    };
  }
  
  // ==========================================================================
  // DADOS Y RNG
  // ==========================================================================
  
  /**
   * Lanza un dado
   */
  rollDice(diceType: any): any {
    return this.diceManager.roll(diceType, this.rng);
  }
  
  /**
   * Obtiene el generador de números aleatorios
   */
  getRNG(): RandomGenerator {
    return this.rng;
  }
  
  /**
   * Obtiene el gestor de dados
   */
  getDiceManager(): DiceManager {
    return this.diceManager;
  }
  
  // ==========================================================================
  // HISTORIAL Y REPLAY
  // ==========================================================================
  
  /**
   * Obtiene el historial de acciones
   */
  getHistory(): readonly GameAction[] {
    return [...this.history];
  }
  
  /**
   * Limpia el historial
   */
  clearHistory(): void {
    this.history = [];
  }
  
  /**
   * Reproduce una partida desde el historial
   */
  replay(config: GameConfig, actions: GameAction[]): GameState {
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
  private addToHistory(action: GameAction): void {
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
  getStats(): {
    turn: number;
    phase: GamePhase;
    totalHumans: number;
    totalResources: number;
    alienShield: number;
    ghettoCount: number;
    characterCount: number;
  } {
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
  private log(message: string, data?: any): void {
    if (this.options.enableLogging) {
      console.log(`[JORUMI Engine] ${message}`, data ?? '');
    }
  }
}



