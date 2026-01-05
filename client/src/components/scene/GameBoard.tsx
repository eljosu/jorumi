/**
 * JORUMI - Game Board
 * 
 * Renderiza el tablero completo del juego basándose en GameState
 * 
 * ARQUITECTURA:
 * GameState.tiles → Array de HexTile componentes
 * GameState.characters → Array de Character componentes
 * GameState.alien → Mothership componente
 * 
 * IMPORTANTE:
 * - Este componente SOLO lee el estado
 * - NO modifica el estado directamente
 * - Los clicks se envían como acciones al store
 */

import { useNetworkStore, selectGameState, selectSelectedTileType } from '@/store/network-store';
import { HexTile } from './HexTile';
import { CharacterMesh } from './CharacterMesh';
import { Mothership } from './Mothership';
import { EmptyHexSlot } from './EmptyHexSlot';
import { getValidPlacementPositions } from '@/utils/hex-utils';
import { TileType } from '@/types/game-types';

export function GameBoard() {
  // Leer estado del servidor
  const gameState = useNetworkStore(selectGameState);
  const selectedTileType = useNetworkStore(selectSelectedTileType);
  const placeTile = useNetworkStore((state) => state.placeTile);
  
  // Si no hay juego iniciado, no renderizar nada
  if (!gameState) {
    return null;
  }
  
  // Convertir Maps a Arrays para renderizar
  const tiles = Array.from(gameState.tiles.values());
  const characters = Array.from(gameState.characters.values());
  const { alien } = gameState;
  
  // Calcular posiciones válidas para colocar losetas
  const validPositions = getValidPlacementPositions(gameState.tiles);
  
  // Handler para colocar loseta
  const handlePlaceTile = (coordinates: any) => {
    if (selectedTileType) {
      console.log('[GameBoard] Placing tile:', selectedTileType, 'at', coordinates);
      placeTile(selectedTileType, coordinates);
    }
  };
  
  return (
    <group>
      {/* Renderizar todas las losetas */}
      {tiles.map((tile) => (
        <HexTile
          key={tile.id}
          tile={tile}
        />
      ))}
      
      {/* Renderizar posiciones válidas para colocar losetas (solo si hay un tipo seleccionado) */}
      {selectedTileType && validPositions.map((coords, index) => (
        <EmptyHexSlot
          key={`empty-${coords.q}-${coords.r}-${coords.s}`}
          coordinates={coords}
          isValid={true}
          onPlaceTile={handlePlaceTile}
        />
      ))}
      
      {/* Renderizar todos los personajes */}
      {characters.map((character) => (
        <CharacterMesh
          key={character.id}
          character={character}
          tiles={gameState.tiles}
        />
      ))}
      
      {/* Renderizar nave nodriza alienígena */}
      {alien.currentTileId && (
        <Mothership
          tileId={alien.currentTileId}
          tiles={gameState.tiles}
          health={alien.mothershipHealth}
          shield={alien.mothershipShield}
        />
      )}
    </group>
  );
}



