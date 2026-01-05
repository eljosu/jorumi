/**
 * JORUMI - Game HUD
 * 
 * Heads-Up Display principal del juego
 * 
 * ARQUITECTURA (Cliente-Servidor):
 * - Lee GameState del servidor
 * - Botones envían acciones al servidor
 * - NO modifica el estado directamente
 */

import { useNetworkStore } from '@/store/network-store';
import { GamePhase } from '@/types/game-types';

export function GameHUD() {
  const gameState = useNetworkStore((state) => state.gameState);
  const sendAction = useNetworkStore((state) => state.sendAction);
  const lastError = useNetworkStore((state) => state.lastError);
  
  const phase = gameState?.phase;
  const turn = gameState?.turn;
  const isGameOver = gameState?.gameOver || false;
  
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
              {/* Phase description */}
            </div>
          </div>
          
          {/* Botón avanzar fase */}
          {!isGameOver && (
            <button
              onClick={() => {
                console.log('[GameHUD] Advance Phase clicked');
                const playerId = useNetworkStore.getState().playerId;
                if (playerId) {
                  sendAction({
                    type: 'ADVANCE_PHASE' as any,
                    playerId,
                    timestamp: Date.now(),
                  });
                }
              }}
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
          {lastError && (
            <div className="bg-red-600 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
              {lastError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



