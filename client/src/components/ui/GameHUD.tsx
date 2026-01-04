/**
 * JORUMI - Game HUD
 * 
 * Heads-Up Display principal del juego
 * 
 * ARQUITECTURA:
 * - Lee GameState para mostrar información
 * - Botones disparan acciones al store
 * - NO modifica el estado directamente
 */

import { useGameStore, selectCurrentPhase, selectCurrentTurn, selectIsGameOver } from '@/store/game-store';
import { GamePhase, PHASE_DESCRIPTIONS } from '@engine/index';

export function GameHUD() {
  const gameState = useGameStore((state) => state.gameState);
  const phase = useGameStore(selectCurrentPhase);
  const turn = useGameStore(selectCurrentTurn);
  const isGameOver = useGameStore(selectIsGameOver);
  const advancePhase = useGameStore((state) => state.advancePhase);
  const notification = useGameStore((state) => state.uiState.notification);
  const error = useGameStore((state) => state.uiState.error);
  
  if (!gameState) {
    return null;
  }
  
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-start gap-4">
        {/* Panel izquierdo - Info del turno */}
        <div className="bg-jorumi-dark bg-opacity-90 text-white p-4 rounded-lg shadow-lg pointer-events-auto">
          <h2 className="text-xl font-bold mb-2">JORUMI</h2>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-400">Turn:</span>{' '}
              <span className="font-bold">{turn}</span>
            </div>
            <div>
              <span className="text-gray-400">Phase:</span>{' '}
              <span className="font-bold">{phase}</span>
            </div>
            <div className="text-xs text-gray-400 mt-2 max-w-xs">
              {PHASE_DESCRIPTIONS[phase as GamePhase]}
            </div>
          </div>
          
          {/* Botón avanzar fase */}
          {!isGameOver && (
            <button
              onClick={advancePhase}
              className="mt-4 w-full bg-jorumi-primary hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Advance Phase
            </button>
          )}
          
          {isGameOver && (
            <div className="mt-4 bg-red-600 text-white px-4 py-2 rounded text-center font-bold">
              GAME OVER
            </div>
          )}
        </div>
        
        {/* Panel derecho - Notificaciones */}
        <div className="pointer-events-none">
          {notification && (
            <div className="bg-green-600 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg mb-2 animate-fade-in">
              {notification}
            </div>
          )}
          
          {error && (
            <div className="bg-red-600 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


