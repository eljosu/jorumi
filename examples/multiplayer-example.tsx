/**
 * JORUMI - Ejemplo de Integración Multiplayer Completo
 * 
 * Este ejemplo muestra cómo integrar el sistema multiplayer
 * en un componente React con servidor autoritativo
 */

import React, { useEffect } from 'react';
import { useNetworkStore, selectGameState, selectIsInRoom } from '../client/src/store/network-store';
import { ActionType } from '../engine';

/**
 * Componente principal de juego multiplayer
 */
export const MultiplayerGameExample: React.FC = () => {
  // Hooks del store de red
  const isInRoom = useNetworkStore(selectIsInRoom);
  const gameState = useNetworkStore(selectGameState);
  const connect = useNetworkStore((state) => state.connect);
  const disconnect = useNetworkStore((state) => state.disconnect);

  // Conectar al servidor al montar
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="multiplayer-game">
      {!isInRoom ? (
        <LobbyScreen />
      ) : gameState ? (
        <GameScreen />
      ) : (
        <WaitingScreen />
      )}
    </div>
  );
};

/**
 * Pantalla de lobby
 */
const LobbyScreen: React.FC = () => {
  const [playerName, setPlayerName] = React.useState('');
  const createRoom = useNetworkStore((state) => state.createRoom);
  const isConnected = useNetworkStore((state) => state.isConnected);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      createRoom(playerName);
    }
  };

  return (
    <div className="lobby-screen">
      <h1>JORUMI Multiplayer</h1>
      
      <div className="connection-status">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
      />
      
      <button onClick={handleCreateRoom} disabled={!isConnected}>
        Create Room
      </button>
    </div>
  );
};

/**
 * Pantalla de espera
 */
const WaitingScreen: React.FC = () => {
  const roomInfo = useNetworkStore((state) => state.roomInfo);
  const players = useNetworkStore((state) => state.players);

  return (
    <div className="waiting-screen">
      <h2>Room: {roomInfo?.roomId}</h2>
      <p>Players: {players.length}/2</p>
      <p>Waiting for opponent...</p>
    </div>
  );
};

/**
 * Pantalla de juego
 */
const GameScreen: React.FC = () => {
  const gameState = useNetworkStore(selectGameState);
  const playerId = useNetworkStore((state) => state.playerId);
  const sendAction = useNetworkStore((state) => state.sendAction);

  if (!gameState || !playerId) return null;

  const isMyTurn = gameState.currentPlayerId === playerId;

  // Ejemplo: Enviar acción de terminar turno
  const handleEndTurn = () => {
    sendAction({
      type: ActionType.END_TURN,
      playerId,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="game-screen">
      <div className="game-info">
        <h2>Game ID: {gameState.gameId}</h2>
        <p>Turn: {gameState.turn}</p>
        <p>Phase: {gameState.phase}</p>
        <p>Current Player: {gameState.currentPlayerId}</p>
      </div>

      <div className="game-state">
        <h3>Game State</h3>
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      </div>

      {isMyTurn && (
        <div className="actions">
          <button onClick={handleEndTurn}>End Turn</button>
          {/* Agregar más acciones según fase y rol */}
        </div>
      )}

      {!isMyTurn && (
        <div className="waiting">
          <p>Opponent's turn...</p>
        </div>
      )}
    </div>
  );
};

/**
 * Ejemplo de uso avanzado: Mover personaje
 */
export const MoveCharacterExample: React.FC<{
  characterId: string;
  targetTileId: string;
}> = ({ characterId, targetTileId }) => {
  const sendAction = useNetworkStore((state) => state.sendAction);
  const playerId = useNetworkStore((state) => state.playerId);

  const handleMove = () => {
    if (!playerId) return;

    // IMPORTANTE: Solo construimos la acción
    // El SERVIDOR valida y ejecuta las reglas
    sendAction({
      type: ActionType.MOVE_CHARACTER,
      playerId,
      characterId,
      targetTileId,
      timestamp: Date.now(),
    });
  };

  return (
    <button onClick={handleMove}>
      Move Character
    </button>
  );
};

/**
 * Ejemplo de hook personalizado para detectar turno
 */
export const useTurnInfo = () => {
  const gameState = useNetworkStore(selectGameState);
  const playerId = useNetworkStore((state) => state.playerId);

  if (!gameState || !playerId) {
    return {
      isMyTurn: false,
      currentPhase: null,
      turnNumber: 0,
    };
  }

  return {
    isMyTurn: gameState.currentPlayerId === playerId,
    currentPhase: gameState.phase,
    turnNumber: gameState.turn,
  };
};

/**
 * Ejemplo de componente que reacciona a eventos
 */
export const GameEventsListener: React.FC = () => {
  const events = useNetworkStore((state) => state.events);
  const clearEvents = useNetworkStore((state) => state.clearEvents);

  React.useEffect(() => {
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      console.log('New game event:', lastEvent);
      
      // Aquí puedes mostrar notificaciones, animaciones, etc.
    }
  }, [events]);

  return (
    <div className="events-listener">
      <h4>Recent Events: {events.length}</h4>
      <button onClick={clearEvents}>Clear Events</button>
      {events.slice(-5).map((event, i) => (
        <div key={i} className="event-item">
          {event.type}
        </div>
      ))}
    </div>
  );
};

export default MultiplayerGameExample;



