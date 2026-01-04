/**
 * JORUMI Client - Game Actions Component
 * 
 * Componente de ejemplo para enviar acciones al servidor
 * IMPORTANTE: No ejecuta reglas, solo envía comandos
 */

import React from 'react';
import { useNetworkStore, useIsMyTurn, useMyRole, selectGameState } from '../../store/network-store';
import { ActionType } from '@/types/game-types';

export const GameActions: React.FC = () => {
  const gameState = useNetworkStore(selectGameState);
  const isMyTurn = useIsMyTurn();
  const myRole = useMyRole();
  const sendAction = useNetworkStore((state) => state.sendAction);
  const playerId = useNetworkStore((state) => state.playerId);

  if (!gameState || !playerId) {
    return (
      <div className="game-actions">
        <p>No active game</p>
      </div>
    );
  }

  // Ejemplo: Mover personaje
  const handleMoveCharacter = (characterId: string, targetTileId: string) => {
    // CRÍTICO: Solo construimos la acción, el servidor la valida y ejecuta
    sendAction({
      type: ActionType.MOVE_CHARACTER,
      playerId,
      characterId,
      targetTileId,
      timestamp: Date.now(),
    });
  };

  // Ejemplo: Terminar turno
  const handleEndTurn = () => {
    sendAction({
      type: ActionType.END_TURN,
      playerId,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="game-actions">
      <div className="turn-info">
        <p>Current Phase: {gameState.phase}</p>
        <p>Turn: {gameState.turn}</p>
        <p>Your Role: {myRole ?? 'Spectator'}</p>
        <p>
          {isMyTurn ? (
            <span className="your-turn">🟢 Your Turn</span>
          ) : (
            <span className="waiting-turn">⏳ Opponent's Turn</span>
          )}
        </p>
      </div>

      {isMyTurn && (
        <div className="action-buttons">
          <h3>Available Actions</h3>
          
          {/* Botones de ejemplo */}
          <button
            onClick={handleEndTurn}
            className="btn-action"
          >
            End Turn
          </button>
          
          <p className="note">
            Note: Implement specific actions based on current phase and role
          </p>
        </div>
      )}

      {!isMyTurn && (
        <div className="waiting-message">
          <p>Wait for your opponent...</p>
        </div>
      )}
    </div>
  );
};



