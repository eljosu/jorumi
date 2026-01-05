/**
 * JORUMI - Tile Placement Panel
 * 
 * Panel UI para que los jugadores coloquen losetas en el tablero
 * 
 * FUNCIONALIDAD:
 * - Muestra tipos de losetas disponibles
 * - Permite seleccionar tipo de loseta
 * - Se integra con el sistema de posiciones válidas
 * - Envía PLACE_TILE action al servidor
 */

import { useNetworkStore, selectGameState, selectPlayerId, selectSelectedTileType } from '@/store/network-store';
import { TileType, GamePhase } from '@/types/game-types';

// Información visual de cada tipo de loseta (NEW YORK POST-INVASION)
const TILE_INFO: Record<TileType, { name: string; icon: string; color: string; description: string }> = {
  // Básicas
  [TileType.GHETTO]: {
    name: 'Ghetto',
    icon: '🏘️',
    color: '#D2691E',
    description: 'Human settlement. Can build structures.',
  },
  [TileType.FOREST]: {
    name: 'Forest',
    icon: '🌲',
    color: '#32CD32',
    description: 'Provides food and wood resources.',
  },
  [TileType.MINE]: {
    name: 'Mine',
    icon: '⛏️',
    color: '#A9A9A9',
    description: 'Provides metal resources.',
  },
  [TileType.RUINS]: {
    name: 'Ruins',
    icon: '🏚️',
    color: '#8B4513',
    description: 'Destroyed buildings. May have supplies.',
  },
  [TileType.WASTELAND]: {
    name: 'Wasteland',
    icon: '💀',
    color: '#DAA520',
    description: 'Barren land. Provides nothing.',
  },
  [TileType.ALIEN_SHIP]: {
    name: 'Alien Ship',
    icon: '👽',
    color: '#8B00FF',
    description: 'Alien mothership location.',
  },
  
  // New York
  [TileType.SEA]: {
    name: 'Sea',
    icon: '🌊',
    color: '#1E90FF',
    description: 'Ocean. Some tiles have boats/platforms.',
  },
  [TileType.BRIDGE]: {
    name: 'Bridge',
    icon: '🌉',
    color: '#696969',
    description: 'Connects areas. Can be destroyed.',
  },
  [TileType.BUNKER_TILE]: {
    name: 'Bunker',
    icon: '🛡️',
    color: '#708090',
    description: 'Defensive structure.',
  },
  [TileType.GARDEN]: {
    name: 'Garden',
    icon: '🌱',
    color: '#7CFC00',
    description: 'Produces food.',
  },
  [TileType.HOSPITAL_TILE]: {
    name: 'Hospital',
    icon: '🏥',
    color: '#FFFFFF',
    description: 'Heals wounded humans.',
  },
  
  // Especiales (aliens)
  [TileType.TOXIC_WASTE]: {
    name: 'Toxic Waste',
    icon: '☢️',
    color: '#00FF00',
    description: 'Blocks humans. Alien use only.',
  },
  [TileType.MINE_TRAP]: {
    name: 'Mine',
    icon: '💣',
    color: '#8B0000',
    description: 'Explosive trap. Alien use only.',
  },
  
  // Únicas
  [TileType.LIBERTY_ISLAND]: {
    name: 'Liberty Island',
    icon: '🗽',
    color: '#90EE90',
    description: 'Base of the Statue of Liberty.',
  },
  [TileType.SPACESHIP_PART]: {
    name: 'Spaceship Part',
    icon: '🚀',
    color: '#C0C0C0',
    description: 'Escape ship component. Victory condition.',
  },
  [TileType.RESCUE_BEACON_TILE]: {
    name: 'Rescue Beacon',
    icon: '📡',
    color: '#FFD700',
    description: 'Calls for rescue. Victory condition.',
  },
};

export function TilePlacementPanel() {
  const gameState = useNetworkStore(selectGameState);
  const playerId = useNetworkStore(selectPlayerId);
  const selectedTileType = useNetworkStore(selectSelectedTileType);
  const setSelectedTileType = useNetworkStore((state) => state.setSelectedTileType);

  if (!gameState || !playerId) {
    return null;
  }

  // Verificar si es el turno del jugador
  const isMyTurn = gameState.currentPlayerId === playerId;
  
  // Verificar si estamos en fase de exploración
  const canPlaceTiles = gameState.phase === GamePhase.EXPLORATION && isMyTurn;

  // Contar cuántas losetas de cada tipo hay en el tablero
  const tileCounts = new Map<TileType, number>();
  gameState.tiles.forEach((tile) => {
    tileCounts.set(tile.type, (tileCounts.get(tile.type) || 0) + 1);
  });

  // Losetas disponibles para colocar (sin ALIEN_SHIP, se coloca automáticamente)
  const availableTileTypes = [
    TileType.GHETTO,
    TileType.FOREST,
    TileType.MINE,
    TileType.RUINS,
    TileType.WASTELAND,
  ];

  return (
    <div className="absolute right-4 top-20 bg-jorumi-dark bg-opacity-95 text-white p-4 rounded-lg shadow-2xl pointer-events-auto max-w-xs">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <span>🗺️</span>
        <span>Place Tiles</span>
      </h3>

      {!canPlaceTiles && (
        <div className="text-sm text-gray-400 mb-3 p-2 bg-gray-800 rounded">
          {!isMyTurn && '⏳ Wait for your turn'}
          {isMyTurn && gameState.phase !== GamePhase.EXPLORATION && '⚠️ Exploration phase only'}
        </div>
      )}

      {canPlaceTiles && (
        <div className="text-xs text-green-400 mb-3 p-2 bg-green-900 bg-opacity-30 rounded">
          ✅ Your turn! Click a tile type, then click on the board to place it.
        </div>
      )}

      {/* Lista de tipos de losetas */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {availableTileTypes.map((tileType) => {
          const info = TILE_INFO[tileType];
          const count = tileCounts.get(tileType) || 0;
          const isSelected = selectedTileType === tileType;

          return (
            <button
              key={tileType}
              onClick={() => {
                if (canPlaceTiles) {
                  setSelectedTileType(isSelected ? null : tileType);
                  console.log('[TilePlacement] Selected tile type:', tileType);
                }
              }}
              disabled={!canPlaceTiles}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                isSelected
                  ? 'bg-jorumi-primary ring-2 ring-white'
                  : canPlaceTiles
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-900 opacity-50 cursor-not-allowed'
              }`}
              style={{
                borderLeft: `4px solid ${info.color}`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{info.name}</div>
                    <div className="text-xs text-gray-400">{info.description}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {count} placed
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 text-xs text-yellow-300 animate-pulse">
                  👆 Click on an empty adjacent position on the board
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Instrucciones */}
      <div className="mt-4 text-xs text-gray-400 p-2 bg-gray-900 rounded">
        <p className="font-semibold mb-1">💡 How to place:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select a tile type</li>
          <li>Click on a valid position (green hexagon)</li>
          <li>The tile will be placed automatically</li>
        </ol>
      </div>

      {/* Estadísticas */}
      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Total tiles:</span>
          <span className="font-bold">{gameState.tiles.size}</span>
        </div>
      </div>
    </div>
  );
}

