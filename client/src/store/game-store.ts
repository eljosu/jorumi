/**
 * JORUMI - Zustand Game Store
 * 
 * PRINCIPIO CLAVE: El motor de reglas es la ÚNICA fuente de verdad.
 * Este store actúa como ADAPTADOR entre el motor y la UI.
 * 
 * FLUJO:
 * 1. UI dispara acción → store
 * 2. Store valida con motor
 * 3. Motor devuelve nuevo estado
 * 4. Store actualiza y notifica a React
 * 5. UI re-renderiza reactivamente
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  GameEngine,
  GameState,
  GameAction,
  ActionResult,
  GameEvent,
  CharacterId,
  TileId,
  GhettoId,
  DiceRollResult,
  ValidationResult,
} from '@engine/index';

// ============================================================================
// TIPOS DE UI STATE (NO pertenecen al motor)
// ============================================================================

/**
 * Estado específico de la UI que NO afecta las reglas del juego
 * - Selecciones del usuario
 * - Vista de cámara
 * - Animaciones en curso
 * - Hints/tooltips
 */
interface UIState {
  // Selecciones
  selectedCharacterId: CharacterId | null;
  selectedTileId: TileId | null;
  selectedGhettoId: GhettoId | null;
  hoveredTileId: TileId | null;
  
  // Modo de interacción
  interactionMode: 'select' | 'move' | 'gather' | 'build' | 'attack' | null;
  
  // Validación en tiempo real
  validMoves: TileId[];
  
  // Feedback
  notification: string | null;
  error: string | null;
  
  // Animaciones
  activeAnimations: Map<string, any>;
  
  // Dice rolling
  isDiceRolling: boolean;
  lastDiceResult: DiceRollResult | null;
}

// ============================================================================
// STORE STATE
// ============================================================================

interface GameStore {
  // === GAME STATE (from engine) ===
  engine: GameEngine | null;
  gameState: GameState | null;
  
  // === UI STATE ===
  uiState: UIState;
  
  // === HISTORY (for undo/replay) ===
  history: GameState[];
  historyIndex: number;
  
  // === ACTIONS ===
  
  // --- Setup ---
  initializeEngine: (options?: any) => void;
  startGame: (playerNames: string[], seed?: number) => void;
  loadGame: (serialized: string) => void;
  saveGame: () => string | null;
  
  // --- Game Actions (wrapping engine) ---
  dispatchAction: (action: GameAction) => ActionResult;
  validateAction: (action: GameAction) => ValidationResult;
  advancePhase: () => void;
  
  // --- UI Actions ---
  selectCharacter: (characterId: CharacterId | null) => void;
  selectTile: (tileId: TileId | null) => void;
  selectGhetto: (ghettoId: GhettoId | null) => void;
  setInteractionMode: (mode: UIState['interactionMode']) => void;
  showNotification: (message: string) => void;
  showError: (message: string) => void;
  clearNotifications: () => void;
  
  // --- History ---
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // --- Internal ---
  _updateGameState: (newState: GameState) => void;
  _handleEvents: (events: GameEvent[]) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialUIState: UIState = {
  selectedCharacterId: null,
  selectedTileId: null,
  selectedGhettoId: null,
  hoveredTileId: null,
  interactionMode: null,
  validMoves: [],
  notification: null,
  error: null,
  activeAnimations: new Map(),
  isDiceRolling: false,
  lastDiceResult: null,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    // Initial state
    engine: null,
    gameState: null,
    uiState: initialUIState,
    history: [],
    historyIndex: -1,
    
    // ========================================================================
    // SETUP
    // ========================================================================
    
    initializeEngine: (options = {}) => {
      const engine = new GameEngine({
        enableLogging: true,
        ...options,
      });
      
      set({ engine });
      
      console.log('[Store] Engine initialized');
    },
    
    startGame: (playerNames, seed) => {
      const { engine } = get();
      
      if (!engine) {
        console.error('[Store] Engine not initialized');
        return;
      }
      
      // El motor crea el estado inicial
      const initialState = engine.startGame({
        playerNames,
        seed: seed || Date.now(),
      });
      
      set({
        gameState: initialState,
        history: [initialState],
        historyIndex: 0,
        uiState: initialUIState,
      });
      
      console.log('[Store] Game started', initialState);
    },
    
    loadGame: (serialized) => {
      const { engine } = get();
      
      if (!engine) {
        console.error('[Store] Engine not initialized');
        return;
      }
      
      const loadedState = engine.loadGame(serialized);
      
      set({
        gameState: loadedState,
        history: [loadedState],
        historyIndex: 0,
      });
      
      console.log('[Store] Game loaded');
    },
    
    saveGame: () => {
      const { engine } = get();
      
      if (!engine) {
        console.error('[Store] Engine not initialized');
        return null;
      }
      
      return engine.saveGame();
    },
    
    // ========================================================================
    // GAME ACTIONS (motor-driven)
    // ========================================================================
    
    /**
     * MÉTODO CRÍTICO: Dispatch de acciones al motor
     * 
     * FLUJO:
     * 1. Validar acción (opcional, para feedback inmediato)
     * 2. Aplicar acción al motor
     * 3. Motor retorna nuevo estado + eventos
     * 4. Actualizar store
     * 5. Procesar eventos (animaciones, notificaciones)
     * 
     * ⚠️ NUNCA modificar gameState directamente desde UI
     */
    dispatchAction: (action) => {
      const { engine, gameState } = get();
      
      if (!engine || !gameState) {
        return {
          success: false,
          error: 'Game not initialized',
        };
      }
      
      console.log('[Store] Dispatching action:', action.type);
      
      // Aplicar al motor (única fuente de verdad)
      const result = engine.applyAction(action);
      
      if (result.success && result.newState) {
        // Actualizar estado
        get()._updateGameState(result.newState as GameState);
        
        // Procesar eventos
        if (result.events) {
          get()._handleEvents(result.events);
        }
        
        console.log('[Store] Action succeeded');
      } else {
        // Mostrar error
        get().showError(result.error || 'Unknown error');
        console.error('[Store] Action failed:', result.error);
      }
      
      return result;
    },
    
    validateAction: (action) => {
      const { engine, gameState } = get();
      
      if (!engine || !gameState) {
        return {
          valid: false,
          reason: 'Game not initialized',
        };
      }
      
      return engine.validateAction(action);
    },
    
    advancePhase: () => {
      const { engine } = get();
      
      if (!engine) {
        console.error('[Store] Engine not initialized');
        return;
      }
      
      const result = engine.advancePhase();
      
      if (result.success && result.newState) {
        get()._updateGameState(result.newState as GameState);
        get().showNotification(`Phase advanced to ${result.newState.phase}`);
      }
    },
    
    // ========================================================================
    // UI ACTIONS (NO afectan reglas del juego)
    // ========================================================================
    
    selectCharacter: (characterId) => {
      set((state) => {
        state.uiState.selectedCharacterId = characterId;
        state.uiState.selectedTileId = null;
        state.uiState.interactionMode = characterId ? 'move' : null;
        
        // Calcular movimientos válidos
        if (characterId && state.gameState) {
          // Aquí puedes usar helpers del motor para calcular movimientos válidos
          // Por ahora, placeholder
          state.uiState.validMoves = [];
        } else {
          state.uiState.validMoves = [];
        }
      });
    },
    
    selectTile: (tileId) => {
      set((state) => {
        state.uiState.selectedTileId = tileId;
      });
    },
    
    selectGhetto: (ghettoId) => {
      set((state) => {
        state.uiState.selectedGhettoId = ghettoId;
      });
    },
    
    setInteractionMode: (mode) => {
      set((state) => {
        state.uiState.interactionMode = mode;
      });
    },
    
    showNotification: (message) => {
      set((state) => {
        state.uiState.notification = message;
        state.uiState.error = null;
      });
      
      // Auto-clear después de 3 segundos
      setTimeout(() => {
        set((state) => {
          state.uiState.notification = null;
        });
      }, 3000);
    },
    
    showError: (message) => {
      set((state) => {
        state.uiState.error = message;
        state.uiState.notification = null;
      });
      
      // Auto-clear después de 5 segundos
      setTimeout(() => {
        set((state) => {
          state.uiState.error = null;
        });
      }, 5000);
    },
    
    clearNotifications: () => {
      set((state) => {
        state.uiState.notification = null;
        state.uiState.error = null;
      });
    },
    
    // ========================================================================
    // HISTORY
    // ========================================================================
    
    undo: () => {
      const { historyIndex, history } = get();
      
      if (historyIndex > 0) {
        const previousState = history[historyIndex - 1];
        
        set({
          gameState: previousState,
          historyIndex: historyIndex - 1,
        });
      }
    },
    
    redo: () => {
      const { historyIndex, history } = get();
      
      if (historyIndex < history.length - 1) {
        const nextState = history[historyIndex + 1];
        
        set({
          gameState: nextState,
          historyIndex: historyIndex + 1,
        });
      }
    },
    
    canUndo: () => {
      return get().historyIndex > 0;
    },
    
    canRedo: () => {
      const { historyIndex, history } = get();
      return historyIndex < history.length - 1;
    },
    
    // ========================================================================
    // INTERNAL METHODS
    // ========================================================================
    
    _updateGameState: (newState) => {
      set((state) => {
        state.gameState = newState;
        
        // Agregar a historial
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(newState);
        state.historyIndex = state.history.length - 1;
        
        // Limitar historial (últimos 50 estados)
        if (state.history.length > 50) {
          state.history.shift();
          state.historyIndex--;
        }
      });
    },
    
    /**
     * CRÍTICO: Procesamiento de eventos del motor
     * 
     * Los eventos son la forma en que el motor comunica cambios significativos
     * La UI usa estos eventos para disparar animaciones y notificaciones
     * 
     * ⚠️ Los eventos son informativos, NO modifican el estado
     */
    _handleEvents: (events) => {
      events.forEach((event) => {
        console.log('[Store] Event:', event.type, event.data);
        
        // Aquí puedes disparar animaciones, sonidos, notificaciones
        // según el tipo de evento
        
        // Ejemplo:
        switch (event.type) {
          case 'CHARACTER_MOVED':
            get().showNotification('Character moved');
            break;
          case 'RESOURCES_GATHERED':
            get().showNotification(`Gathered ${event.data.amount} ${event.data.resourceType}`);
            break;
          case 'GAME_WON':
            get().showNotification('Victory!');
            break;
          case 'GAME_LOST':
            get().showError('Defeat!');
            break;
        }
      });
    },
  }))
);

// ============================================================================
// SELECTORS (para optimización de renders)
// ============================================================================

/**
 * Selectors para acceder a partes específicas del estado
 * Ayudan a evitar re-renders innecesarios
 */

export const selectGameState = (state: GameStore) => state.gameState;
export const selectUIState = (state: GameStore) => state.uiState;
export const selectSelectedCharacter = (state: GameStore) => {
  const { gameState, uiState } = state;
  if (!gameState || !uiState.selectedCharacterId) return null;
  return gameState.characters.get(uiState.selectedCharacterId);
};

export const selectCurrentPhase = (state: GameStore) => state.gameState?.phase;
export const selectCurrentTurn = (state: GameStore) => state.gameState?.turn;
export const selectIsGameOver = (state: GameStore) => state.gameState?.gameOver || false;

// ============================================================================
// HOOKS CONVENIENTES
// ============================================================================

/**
 * Hook para acciones de juego comunes
 */
export const useGameActions = () => {
  const dispatchAction = useGameStore((state) => state.dispatchAction);
  const advancePhase = useGameStore((state) => state.advancePhase);
  const validateAction = useGameStore((state) => state.validateAction);
  
  return {
    dispatchAction,
    advancePhase,
    validateAction,
  };
};

/**
 * Hook para acciones de UI
 */
export const useUIActions = () => {
  const selectCharacter = useGameStore((state) => state.selectCharacter);
  const selectTile = useGameStore((state) => state.selectTile);
  const setInteractionMode = useGameStore((state) => state.setInteractionMode);
  
  return {
    selectCharacter,
    selectTile,
    setInteractionMode,
  };
};



