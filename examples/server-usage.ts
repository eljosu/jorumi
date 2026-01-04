/**
 * JORUMI - Ejemplo de Uso del Servidor
 * 
 * Este archivo muestra cómo funciona el servidor internamente
 * NO es código de cliente, solo referencia
 */

import { GameEngine, ActionType, GameAction } from '../engine';

// ============================================================================
// EJEMPLO 1: Flujo básico del servidor
// ============================================================================

export function serverFlowExample() {
  // 1. Crear motor de reglas en el servidor
  const engine = new GameEngine({
    enableLogging: true,
    enableHistory: true,
  });

  // 2. Iniciar partida cuando 2 jugadores se conectan
  const gameState = engine.startGame({
    playerNames: ['Alice', 'Bob'],
    seed: 12345, // Seed para determinismo
  });

  console.log('Game started:', gameState.gameId);
  console.log('Current player:', gameState.currentPlayerId);
  console.log('Phase:', gameState.phase);

  // 3. Cliente envía acción
  const clientAction: GameAction = {
    type: ActionType.MOVE_CHARACTER,
    playerId: gameState.currentPlayerId,
    characterId: 'char_001',
    targetTileId: 'tile_002',
    timestamp: Date.now(),
  };

  // 4. Servidor valida acción
  const validation = engine.validateAction(clientAction);
  
  if (!validation.valid) {
    console.log('Action rejected:', validation.reason);
    // Enviar ACTION_REJECTED al cliente
    return;
  }

  // 5. Servidor aplica acción
  const result = engine.applyAction(clientAction);

  if (result.success && result.newState) {
    console.log('Action applied successfully');
    console.log('New state:', result.newState);
    console.log('Events:', result.events);
    
    // 6. Broadcast nuevo estado a TODOS los clientes
    // broadcastToRoom(roomId, {
    //   type: 'GAME_STATE_UPDATE',
    //   gameState: result.newState,
    //   events: result.events,
    // });
  }
}

// ============================================================================
// EJEMPLO 2: Validación de turnos
// ============================================================================

export function turnValidationExample() {
  const engine = new GameEngine();
  const gameState = engine.startGame({
    playerNames: ['Player1', 'Player2'],
  });

  // Acción del jugador correcto
  const validAction: GameAction = {
    type: ActionType.END_TURN,
    playerId: gameState.currentPlayerId, // ✅ Es el turno de este jugador
    timestamp: Date.now(),
  };

  // Acción de jugador incorrecto
  const invalidAction: GameAction = {
    type: ActionType.END_TURN,
    playerId: 'wrong_player_id', // ❌ NO es el turno de este jugador
    timestamp: Date.now(),
  };

  console.log('Valid action:', engine.validateAction(validAction).valid); // true
  console.log('Invalid action:', engine.validateAction(invalidAction).valid); // false
}

// ============================================================================
// EJEMPLO 3: Generación de dados en el servidor
// ============================================================================

export function diceGenerationExample() {
  const engine = new GameEngine();
  engine.startGame({
    playerNames: ['Player1', 'Player2'],
    seed: 42, // Mismo seed = mismos resultados (determinista)
  });

  // El servidor genera dados con el RNG interno
  const diceManager = engine.getDiceManager();
  const rng = engine.getRNG();

  // Lanzar dado
  const result = diceManager.roll('HUMAN_D6' as any, rng);
  console.log('Dice result:', result);

  // El cliente NUNCA hace esto
  // El cliente solo recibe el resultado
}

// ============================================================================
// EJEMPLO 4: Gestión de GameRoom
// ============================================================================

export class ServerGameRoomExample {
  private engine: GameEngine;
  private players: Map<string, any> = new Map();

  constructor() {
    this.engine = new GameEngine();
  }

  addPlayer(playerId: string, playerName: string) {
    this.players.set(playerId, { id: playerId, name: playerName });
    
    if (this.players.size === 2) {
      this.startGame();
    }
  }

  private startGame() {
    const playerNames = Array.from(this.players.values()).map(p => p.name);
    const gameState = this.engine.startGame({ playerNames });
    
    // Broadcast GAME_STARTED a todos los jugadores
    console.log('Broadcasting game start to all players');
  }

  handlePlayerAction(playerId: string, action: GameAction) {
    // 1. Verificar que es el turno del jugador
    const gameState = this.engine.getState();
    if (gameState.currentPlayerId !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // 2. Validar acción
    const validation = this.engine.validateAction(action);
    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    // 3. Aplicar acción
    const result = this.engine.applyAction(action);
    
    // 4. Broadcast resultado
    if (result.success) {
      console.log('Broadcasting state update to all players');
    }
    
    return result;
  }
}

// ============================================================================
// EJEMPLO 5: Reconexión
// ============================================================================

export function reconnectionExample() {
  const engine = new GameEngine();
  engine.startGame({
    playerNames: ['Player1', 'Player2'],
  });

  // Simular algunas acciones
  engine.applyAction({
    type: ActionType.END_TURN,
    playerId: 'player1',
    timestamp: Date.now(),
  } as any);

  // Cliente se desconecta y reconecta
  // Solicita snapshot completo
  const currentState = engine.getState();
  
  // Servidor envía snapshot
  console.log('Sending snapshot to reconnected client:', currentState);
}

// ============================================================================
// EJEMPLO 6: Replay con seed
// ============================================================================

export function replayExample() {
  // Partida original con seed específico
  const engine1 = new GameEngine();
  const state1 = engine1.startGame({
    playerNames: ['Player1', 'Player2'],
    seed: 12345,
  });

  // Aplicar algunas acciones
  const actions: GameAction[] = [
    {
      type: ActionType.END_TURN,
      playerId: state1.currentPlayerId,
      timestamp: Date.now(),
    },
  ];

  actions.forEach(action => engine1.applyAction(action));
  const finalState1 = engine1.getState();

  // Replay con mismo seed
  const engine2 = new GameEngine();
  const state2 = engine2.startGame({
    playerNames: ['Player1', 'Player2'],
    seed: 12345, // Mismo seed
  });

  actions.forEach(action => engine2.applyAction(action));
  const finalState2 = engine2.getState();

  // Estados idénticos
  console.log('RNG State 1:', finalState1.rngState);
  console.log('RNG State 2:', finalState2.rngState);
  console.log('States identical:', finalState1.rngState === finalState2.rngState);
}

// ============================================================================
// EJEMPLO 7: Lo que el cliente NO debe hacer
// ============================================================================

// ❌ INCORRECTO - Cliente ejecutando reglas
export function incorrectClientBehavior() {
  // ❌ NO hacer esto en el cliente
  const engine = new GameEngine();
  const action: GameAction = {
    type: ActionType.MOVE_CHARACTER,
    playerId: 'player1',
    characterId: 'char1',
    targetTileId: 'tile2',
    timestamp: Date.now(),
  };
  
  // ❌ Cliente NO debe ejecutar esto
  // engine.applyAction(action);
  
  // ✅ CORRECTO - Cliente solo envía
  // socketClient.sendAction(action);
}

// ✅ CORRECTO - Cliente solo envía comandos
export function correctClientBehavior() {
  // Cliente solo:
  // 1. Construye acción
  const action: GameAction = {
    type: ActionType.MOVE_CHARACTER,
    playerId: 'player1',
    characterId: 'char1',
    targetTileId: 'tile2',
    timestamp: Date.now(),
  };
  
  // 2. Envía al servidor
  // socketClient.sendAction(action);
  
  // 3. Espera respuesta del servidor
  // 4. Renderiza el nuevo estado que el servidor envía
}


