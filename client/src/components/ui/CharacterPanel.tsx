/**
 * JORUMI - Character Panel
 * 
 * Panel que muestra información del personaje seleccionado
 * y permite realizar acciones
 */

import { useGameStore, selectSelectedCharacter } from '@/store/game-store';
import { ActionType, CharacterType, ResourceType } from '@engine/index';

// Nombres amigables para tipos de personajes
const CHARACTER_NAMES: Record<CharacterType, string> = {
  [CharacterType.DOCTOR]: 'Doctor',
  [CharacterType.SOLDIER]: 'Soldier',
  [CharacterType.PEASANT]: 'Peasant',
  [CharacterType.CONSTRUCTOR]: 'Constructor',
  [CharacterType.MINER]: 'Miner',
};

export function CharacterPanel() {
  const character = useGameStore(selectSelectedCharacter);
  const gameState = useGameStore((state) => state.gameState);
  const selectCharacter = useGameStore((state) => state.selectCharacter);
  const dispatchAction = useGameStore((state) => state.dispatchAction);
  
  if (!character || !gameState) {
    return null;
  }
  
  // Acciones disponibles según el tipo de personaje
  const handleGather = () => {
    // Ejemplo: recolectar comida
    dispatchAction({
      type: ActionType.GATHER_RESOURCES,
      playerId: gameState.currentPlayerId,
      characterId: character.id,
      resourceType: ResourceType.FOOD,
      amount: 3,
      timestamp: Date.now(),
    });
  };
  
  return (
    <div className="absolute bottom-4 left-4 bg-jorumi-dark bg-opacity-90 text-white p-4 rounded-lg shadow-lg max-w-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold">{CHARACTER_NAMES[character.type]}</h3>
          <p className="text-xs text-gray-400">{character.name}</p>
        </div>
        <button
          onClick={() => selectCharacter(null)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {/* Status */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Status:</span>
          {character.isWounded && (
            <span className="bg-red-600 px-2 py-0.5 rounded text-xs">Wounded</span>
          )}
          {character.isUsed && (
            <span className="bg-gray-600 px-2 py-0.5 rounded text-xs">Used</span>
          )}
          {!character.canAct && (
            <span className="bg-orange-600 px-2 py-0.5 rounded text-xs">Cannot Act</span>
          )}
          {!character.isWounded && !character.isUsed && character.canAct && (
            <span className="bg-green-600 px-2 py-0.5 rounded text-xs">Ready</span>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 mb-2">Actions:</p>
        
        {character.type === CharacterType.PEASANT && (
          <button
            onClick={handleGather}
            disabled={character.isUsed || !character.canAct}
            className="w-full bg-jorumi-accent hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm transition-colors"
          >
            Gather Food
          </button>
        )}
        
        {/* TODO: Agregar más acciones según tipo de personaje */}
        
        <p className="text-xs text-gray-400 italic">
          Click on a tile to move this character
        </p>
      </div>
    </div>
  );
}



