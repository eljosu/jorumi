/**
 * JORUMI Game Engine - UI Integration Example
 * 
 * Ejemplo de cómo integrar el motor con una UI (React, Vue, etc.)
 * Este archivo muestra el patrón recomendado, NO es código ejecutable
 */

import { GameEngine, GameState, ActionType, GameAction } from '../index';

/**
 * ============================================================================
 * EJEMPLO 1: Integración Básica con React
 * ============================================================================
 */

/*
// En tu componente React principal

import React, { useState, useEffect } from 'react';
import { GameEngine } from './engine';

export function JorumiGame() {
  const [engine] = useState(() => new GameEngine({ enableLogging: true }));
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  
  // Iniciar partida
  const startGame = () => {
    const state = engine.startGame({
      playerNames: ['Player 1', 'Player 2'],
      seed: Date.now(),
    });
    setGameState(state);
  };
  
  // Manejar acción de jugador
  const handleMoveCharacter = (characterId: string, targetTileId: string) => {
    if (!gameState) return;
    
    const action: GameAction = {
      type: ActionType.MOVE_CHARACTER,
      playerId: gameState.currentPlayerId,
      characterId,
      targetTileId,
      timestamp: Date.now(),
    };
    
    // Validar antes de aplicar (opcional, para feedback inmediato)
    const validation = engine.validateAction(action);
    if (!validation.valid) {
      alert(`Invalid action: ${validation.reason}`);
      return;
    }
    
    // Aplicar acción
    const result = engine.applyAction(action);
    
    if (result.success) {
      // Actualizar estado
      setGameState(engine.getState());
      
      // Mostrar eventos
      result.events?.forEach(event => {
        console.log('Event:', event);
        // Aquí puedes mostrar notificaciones, animaciones, etc.
      });
    } else {
      alert(`Action failed: ${result.error}`);
    }
  };
  
  // Avanzar fase
  const advancePhase = () => {
    const result = engine.advancePhase();
    if (result.success) {
      setGameState(engine.getState());
    }
  };
  
  // Guardar partida
  const saveGame = () => {
    const saved = engine.saveGame();
    localStorage.setItem('jorumi-save', saved);
    alert('Game saved!');
  };
  
  // Cargar partida
  const loadGame = () => {
    const saved = localStorage.getItem('jorumi-save');
    if (saved) {
      const state = engine.loadGame(saved);
      setGameState(state);
      alert('Game loaded!');
    }
  };
  
  return (
    <div className="jorumi-game">
      {!gameState ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <>
          <GameUI 
            state={gameState}
            onMoveCharacter={handleMoveCharacter}
            onAdvancePhase={advancePhase}
          />
          <button onClick={saveGame}>Save</button>
          <button onClick={loadGame}>Load</button>
        </>
      )}
    </div>
  );
}
*/

/**
 * ============================================================================
 * EJEMPLO 2: Hook Personalizado de React
 * ============================================================================
 */

/*
// useJorumiEngine.ts

import { useState, useCallback, useRef } from 'react';
import { GameEngine, GameState, GameAction } from './engine';

export function useJorumiEngine() {
  const engineRef = useRef<GameEngine>(
    new GameEngine({ enableLogging: true })
  );
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startGame = useCallback((playerNames: string[]) => {
    setIsLoading(true);
    try {
      const state = engineRef.current.startGame({ playerNames });
      setGameState(state);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const applyAction = useCallback((action: GameAction) => {
    if (!gameState) return;
    
    const result = engineRef.current.applyAction(action);
    
    if (result.success) {
      setGameState(engineRef.current.getState());
      setError(null);
      return result.events;
    } else {
      setError(result.error || 'Unknown error');
      return null;
    }
  }, [gameState]);
  
  const advancePhase = useCallback(() => {
    const result = engineRef.current.advancePhase();
    if (result.success) {
      setGameState(engineRef.current.getState());
    }
    return result;
  }, []);
  
  const saveGame = useCallback(() => {
    return engineRef.current.saveGame();
  }, []);
  
  const loadGame = useCallback((saved: string) => {
    const state = engineRef.current.loadGame(saved);
    setGameState(state);
  }, []);
  
  return {
    gameState,
    isLoading,
    error,
    startGame,
    applyAction,
    advancePhase,
    saveGame,
    loadGame,
    engine: engineRef.current,
  };
}

// Uso en componente:
function MyComponent() {
  const { gameState, applyAction, advancePhase } = useJorumiEngine();
  
  // ...
}
*/

/**
 * ============================================================================
 * EJEMPLO 3: Integración con Three.js
 * ============================================================================
 */

/*
// JorumiScene.tsx

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { GameState, Tile, Character } from './engine';

function HexTile({ tile }: { tile: Tile }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convertir coordenadas axiales a cartesianas
  const x = tile.coordinates.q * 1.5;
  const z = tile.coordinates.r * Math.sqrt(3) + (tile.coordinates.q * Math.sqrt(3) / 2);
  
  return (
    <mesh ref={meshRef} position={[x, 0, z]}>
      <cylinderGeometry args={[1, 1, 0.2, 6]} />
      <meshStandardMaterial 
        color={tile.destroyed ? '#333' : '#8B4513'} 
      />
    </mesh>
  );
}

function CharacterMesh({ character, tiles }: { character: Character; tiles: Map<string, Tile> }) {
  const tile = character.tileId ? tiles.get(character.tileId) : null;
  
  if (!tile) return null;
  
  const x = tile.coordinates.q * 1.5;
  const z = tile.coordinates.r * Math.sqrt(3) + (tile.coordinates.q * Math.sqrt(3) / 2);
  
  return (
    <mesh position={[x, 1, z]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color={character.isWounded ? '#ff0000' : '#00ff00'} />
    </mesh>
  );
}

export function JorumiScene({ gameState }: { gameState: GameState }) {
  return (
    <Canvas camera={{ position: [0, 10, 10], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      
      {Array.from(gameState.tiles.values()).map(tile => (
        <HexTile key={tile.id} tile={tile} />
      ))}
      
      {Array.from(gameState.characters.values()).map(character => (
        <CharacterMesh 
          key={character.id} 
          character={character} 
          tiles={gameState.tiles} 
        />
      ))}
    </Canvas>
  );
}
*/

/**
 * ============================================================================
 * EJEMPLO 4: Sistema de Eventos y Notificaciones
 * ============================================================================
 */

/*
// EventSystem.ts

import { GameEvent, GameEventType } from './engine';

type EventHandler = (event: GameEvent) => void;

class EventSystem {
  private handlers: Map<GameEventType, EventHandler[]> = new Map();
  
  on(eventType: GameEventType, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  emit(event: GameEvent) {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }
  
  emitAll(events: GameEvent[]) {
    events.forEach(event => this.emit(event));
  }
}

// Uso:
const eventSystem = new EventSystem();

eventSystem.on(GameEventType.CHARACTER_MOVED, (event) => {
  console.log('Character moved!', event.data);
  showNotification('Character moved');
  playSound('move.mp3');
});

eventSystem.on(GameEventType.RESOURCES_GATHERED, (event) => {
  console.log('Resources gathered!', event.data);
  showNotification(`+${event.data.amount} ${event.data.resourceType}`);
});

eventSystem.on(GameEventType.GAME_WON, (event) => {
  showModal('Victory!', event.data.victoryCondition);
  playSound('victory.mp3');
});

// Al aplicar acción:
const result = engine.applyAction(action);
if (result.success && result.events) {
  eventSystem.emitAll(result.events);
}
*/

/**
 * ============================================================================
 * EJEMPLO 5: Multiplayer con WebSockets
 * ============================================================================
 */

/*
// MultiplayerClient.ts

import { io, Socket } from 'socket.io-client';
import { GameEngine, GameAction } from './engine';

class MultiplayerClient {
  private socket: Socket;
  private engine: GameEngine;
  private playerId: string;
  
  constructor(serverUrl: string) {
    this.socket = io(serverUrl);
    this.engine = new GameEngine();
    this.playerId = '';
    
    this.setupListeners();
  }
  
  private setupListeners() {
    // Recibir ID de jugador
    this.socket.on('player-id', (id: string) => {
      this.playerId = id;
    });
    
    // Recibir estado inicial
    this.socket.on('game-started', (serializedState: string) => {
      this.engine.loadGame(serializedState);
      this.onStateUpdate(this.engine.getState());
    });
    
    // Recibir acciones de otros jugadores
    this.socket.on('game-action', (action: GameAction) => {
      const result = this.engine.applyAction(action);
      if (result.success) {
        this.onStateUpdate(this.engine.getState());
      } else {
        // Desync - solicitar estado completo
        this.socket.emit('request-sync');
      }
    });
    
    // Sincronización forzada
    this.socket.on('game-sync', (serializedState: string) => {
      this.engine.loadGame(serializedState);
      this.onStateUpdate(this.engine.getState());
    });
  }
  
  // Enviar acción al servidor
  sendAction(action: GameAction) {
    // Aplicar localmente primero (optimistic update)
    const result = this.engine.applyAction(action);
    
    if (result.success) {
      this.onStateUpdate(this.engine.getState());
      // Enviar al servidor
      this.socket.emit('game-action', action);
    }
  }
  
  // Callback cuando el estado cambia
  onStateUpdate(state: GameState) {
    // Implementar en subclase o pasar como callback
  }
}

// Uso:
const client = new MultiplayerClient('http://localhost:3000');
client.onStateUpdate = (state) => {
  updateUI(state);
};

// Al hacer clic en UI:
function onPlayerAction(action: GameAction) {
  client.sendAction(action);
}
*/

/**
 * ============================================================================
 * EJEMPLO 6: Sistema de IA Simple
 * ============================================================================
 */

/*
// SimpleAI.ts

import { GameEngine, GameState, CharacterType, ActionType } from './engine';

class SimpleAI {
  constructor(private engine: GameEngine) {}
  
  // Decidir próxima acción
  decideAction(state: GameState): GameAction | null {
    // Fase de movimiento: mover personajes
    if (state.phase === 'MOVEMENT') {
      return this.decideMoveAction(state);
    }
    
    // Fase de recolección: recolectar recursos
    if (state.phase === 'RESOURCE_GATHERING') {
      return this.decideGatherAction(state);
    }
    
    // Fase de comercio: construir si es posible
    if (state.phase === 'TRADING') {
      return this.decideBuildAction(state);
    }
    
    return null;
  }
  
  private decideMoveAction(state: GameState): GameAction | null {
    // Buscar primer personaje que no se ha movido
    for (const character of state.characters.values()) {
      if (!character.isUsed && character.canAct) {
        // Buscar loseta cercana
        const targetTile = this.findNearestResourceTile(state, character);
        
        if (targetTile) {
          return {
            type: ActionType.MOVE_CHARACTER,
            playerId: state.currentPlayerId,
            characterId: character.id,
            targetTileId: targetTile.id,
            timestamp: Date.now(),
          };
        }
      }
    }
    
    return null;
  }
  
  private decideGatherAction(state: GameState): GameAction | null {
    // Buscar campesino para recolectar comida
    for (const character of state.characters.values()) {
      if (character.type === CharacterType.PEASANT && !character.isUsed) {
        return {
          type: ActionType.GATHER_RESOURCES,
          playerId: state.currentPlayerId,
          characterId: character.id,
          resourceType: 'FOOD',
          amount: 3,
          timestamp: Date.now(),
        };
      }
    }
    
    return null;
  }
  
  private decideBuildAction(state: GameState): GameAction | null {
    // Lógica de construcción...
    return null;
  }
  
  private findNearestResourceTile(state: GameState, character: any) {
    // Lógica de búsqueda...
    return null;
  }
}

// Uso:
const ai = new SimpleAI(engine);

// En cada turno de IA:
function aiTurn() {
  const state = engine.getState();
  const action = ai.decideAction(state);
  
  if (action) {
    engine.applyAction(action);
  } else {
    engine.advancePhase();
  }
}
*/

/**
 * ============================================================================
 * EJEMPLO 7: Sistema de Animaciones
 * ============================================================================
 */

/*
// AnimationSystem.ts

import { GameEvent, GameEventType } from './engine';

interface Animation {
  type: string;
  duration: number;
  data: any;
  onComplete?: () => void;
}

class AnimationSystem {
  private queue: Animation[] = [];
  private current: Animation | null = null;
  
  // Agregar animación desde evento
  fromEvent(event: GameEvent): Animation | null {
    switch (event.type) {
      case GameEventType.CHARACTER_MOVED:
        return {
          type: 'move',
          duration: 500,
          data: {
            characterId: event.data.characterId,
            targetTileId: event.data.targetTileId,
          },
        };
      
      case GameEventType.RESOURCES_GATHERED:
        return {
          type: 'gather',
          duration: 300,
          data: {
            characterId: event.data.characterId,
            resourceType: event.data.resourceType,
            amount: event.data.amount,
          },
        };
      
      case GameEventType.ALIEN_ATTACKED:
        return {
          type: 'attack',
          duration: 700,
          data: {
            damage: event.data.damage,
          },
        };
      
      default:
        return null;
    }
  }
  
  // Encolar animaciones
  enqueue(animation: Animation) {
    this.queue.push(animation);
    if (!this.current) {
      this.playNext();
    }
  }
  
  // Reproducir siguiente animación
  private playNext() {
    if (this.queue.length === 0) {
      this.current = null;
      return;
    }
    
    this.current = this.queue.shift()!;
    
    // Ejecutar animación (implementación específica de Three.js/CSS)
    this.executeAnimation(this.current);
    
    // Programar siguiente
    setTimeout(() => {
      if (this.current?.onComplete) {
        this.current.onComplete();
      }
      this.playNext();
    }, this.current.duration);
  }
  
  private executeAnimation(animation: Animation) {
    // Implementar según tu sistema de renderizado
    console.log('Playing animation:', animation.type, animation.data);
  }
}

// Uso:
const animationSystem = new AnimationSystem();

// Al aplicar acción:
const result = engine.applyAction(action);
if (result.success && result.events) {
  result.events.forEach(event => {
    const animation = animationSystem.fromEvent(event);
    if (animation) {
      animationSystem.enqueue(animation);
    }
  });
}
*/

/**
 * ============================================================================
 * RESUMEN DE INTEGRACIÓN
 * ============================================================================
 * 
 * Patrón recomendado:
 * 
 * 1. Crear instancia única de GameEngine
 * 2. Mantener estado en React/Vue state
 * 3. UI llama a engine.applyAction()
 * 4. Engine retorna nuevo estado + eventos
 * 5. Actualizar UI con nuevo estado
 * 6. Procesar eventos para animaciones/notificaciones
 * 
 * Ventajas:
 * - Motor desacoplado de UI
 * - Fácil testing
 * - Multiplayer simple
 * - Replay/Undo trivial
 * - Animaciones independientes de lógica
 */

export {};



