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

import { useGameStore, selectGameState } from '@/store/game-store';
import { HexTile } from './HexTile';
import { CharacterMesh } from './CharacterMesh';
import { Mothership } from './Mothership';

export function GameBoard() {
  // Leer estado del motor
  const gameState = useGameStore(selectGameState);
  
  // Si no hay juego iniciado, no renderizar nada
  if (!gameState) {
    return null;
  }
  
  // Convertir Maps a Arrays para renderizar
  const tiles = Array.from(gameState.tiles.values());
  const characters = Array.from(gameState.characters.values());
  const { alien } = gameState;
  
  return (
    <group>
      {/* Renderizar todas las losetas */}
      {tiles.map((tile) => (
        <HexTile
          key={tile.id}
          tile={tile}
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


