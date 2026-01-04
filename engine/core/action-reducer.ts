/**
 * JORUMI Game Engine - Action Reducer
 * 
 * Reducer que aplica acciones al estado de forma inmutable
 * Pattern: Redux-like reducer para máxima predictibilidad
 */

import { GameState, Character, Ghetto, Tile, BuildingType } from '../domain/types';
import { GameAction, ActionType, ActionResult, GameEvent, BuildStructureAction } from '../actions/types';
import { validateAction } from '../actions/validators';
import { cloneGameState } from './state-factory';
import { PhaseMachine } from '../rules/phase-machine';
import { 
  applySurvivalMechanics, 
  resetCharactersForNewTurn,
  checkGameEnd,
  applyAlienControl,
  liberateGhetto,
} from '../rules/game-rules';
import { subtractInventories, addInventories } from '../utils/helpers';
import { BUILDING_COSTS } from '../domain/constants';
import { DiceManager } from '../dice/dice';
import { RandomFactory } from '../dice/rng';

/**
 * Reducer principal: aplica una acción al estado
 * Retorna un nuevo estado (inmutable)
 */
export function reduceAction(
  state: GameState,
  action: GameAction
): ActionResult {
  // Validar la acción
  const validation = validateAction(state, action);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.reason,
    };
  }
  
  // Clonar estado para modificación inmutable
  let newState = cloneGameState(state);
  const events: GameEvent[] = [];
  
  try {
    // Aplicar acción según tipo
    switch (action.type) {
      case ActionType.MOVE_CHARACTER:
        newState = reduceMoveCharacter(newState, action, events);
        break;
      
      case ActionType.GATHER_RESOURCES:
        newState = reduceGatherResources(newState, action, events);
        break;
      
      case ActionType.BUILD_STRUCTURE:
        newState = reduceBuildStructure(newState, action, events);
        break;
      
      case ActionType.HEAL_WOUNDED:
        newState = reduceHealWounded(newState, action, events);
        break;
      
      case ActionType.TRANSFER_RESOURCES:
        newState = reduceTransferResources(newState, action, events);
        break;
      
      case ActionType.ATTACK_ALIEN:
        newState = reduceAttackAlien(newState, action, events);
        break;
      
      case ActionType.ALIEN_CONTROL_GHETTO:
        newState = reduceAlienControlGhetto(newState, action, events);
        break;
      
      case ActionType.ALIEN_BOMB:
        newState = reduceAlienBomb(newState, action, events);
        break;
      
      case ActionType.ADVANCE_PHASE:
        newState = reduceAdvancePhase(newState, action, events);
        break;
      
      case ActionType.END_TURN:
        newState = reduceEndTurn(newState, action, events);
        break;
      
      default:
        return {
          success: false,
          error: `Action type ${action.type} not implemented`,
        };
    }
    
    // Registrar acción en el log
    newState.actionsThisTurn.push(JSON.stringify(action));
    
    return {
      success: true,
      newState,
      events,
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// REDUCERS ESPECÍFICOS
// ============================================================================

/**
 * Manual: Fase 3 - Mover personaje
 */
function reduceMoveCharacter(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  const character = state.characters.get(action.characterId)!;
  const newCharacter: Character = {
    ...character,
    tileId: action.targetTileId,
    isUsed: true,
  };
  
  state.characters.set(action.characterId, newCharacter);
  
  events.push({
    type: 'CHARACTER_MOVED' as any,
    timestamp: Date.now(),
    data: {
      characterId: action.characterId,
      targetTileId: action.targetTileId,
    },
  });
  
  return state;
}

/**
 * Manual: Fase 4 - Recolectar recursos
 */
function reduceGatherResources(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  const character = state.characters.get(action.characterId)!;
  const ghetto = state.ghettos.get(character.ghettoId)!;
  
  // Agregar recursos al guetto
  const newResources = addInventories(ghetto.resources, {
    [action.resourceType]: action.amount,
  });
  
  const newGhetto: Ghetto = {
    ...ghetto,
    resources: newResources,
  };
  
  // Marcar personaje como usado
  const newCharacter: Character = {
    ...character,
    isUsed: true,
  };
  
  state.ghettos.set(ghetto.id, newGhetto);
  state.characters.set(character.id, newCharacter);
  
  events.push({
    type: 'RESOURCES_GATHERED' as any,
    timestamp: Date.now(),
    data: {
      characterId: action.characterId,
      resourceType: action.resourceType,
      amount: action.amount,
    },
  });
  
  return state;
}

/**
 * Manual: Construcción de edificios
 */
function reduceBuildStructure(
  state: GameState,
  action: BuildStructureAction,
  events: GameEvent[]
): GameState {
  const ghetto = state.ghettos.get(action.ghettoId)!;
  const cost = BUILDING_COSTS[action.buildingType as BuildingType];
  
  // Restar recursos
  const newResources = subtractInventories(ghetto.resources, cost);
  
  // Agregar edificio
  const newGhetto: Ghetto = {
    ...ghetto,
    resources: newResources,
    buildings: [...ghetto.buildings, action.buildingType],
  };
  
  state.ghettos.set(ghetto.id, newGhetto);
  
  events.push({
    type: 'BUILDING_CONSTRUCTED' as any,
    timestamp: Date.now(),
    data: {
      ghettoId: action.ghettoId,
      buildingType: action.buildingType,
    },
  });
  
  return state;
}

/**
 * Manual: Curación de heridos
 */
function reduceHealWounded(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  const ghetto = state.ghettos.get(action.ghettoId)!;
  
  // Curar heridos
  const newGhetto: Ghetto = {
    ...ghetto,
    wounded: ghetto.wounded - action.amount,
    population: ghetto.population + action.amount,
  };
  
  state.ghettos.set(ghetto.id, newGhetto);
  
  events.push({
    type: 'CHARACTER_MOVED' as any, // Usar evento genérico
    timestamp: Date.now(),
    data: {
      action: 'HEAL_WOUNDED',
      ghettoId: action.ghettoId,
      amount: action.amount,
    },
  });
  
  return state;
}

/**
 * Manual: Fase 5 - Transferir recursos
 */
function reduceTransferResources(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  const fromGhetto = state.ghettos.get(action.fromGhettoId)!;
  const toGhetto = state.ghettos.get(action.toGhettoId)!;
  
  // Restar del origen
  const newFromResources = subtractInventories(fromGhetto.resources, action.resources);
  
  // Sumar al destino
  const newToResources = addInventories(toGhetto.resources, action.resources);
  
  state.ghettos.set(action.fromGhettoId, {
    ...fromGhetto,
    resources: newFromResources,
  });
  
  state.ghettos.set(action.toGhettoId, {
    ...toGhetto,
    resources: newToResources,
  });
  
  return state;
}

/**
 * Manual: Ataque al alienígena
 */
function reduceAttackAlien(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  // Aplicar daño al escudo primero
  let newShield = state.alien.shieldLevel - action.damage;
  
  if (newShield < 0) {
    newShield = 0;
  }
  
  state.alien = {
    ...state.alien,
    shieldLevel: newShield,
  };
  
  events.push({
    type: 'ALIEN_ATTACKED' as any,
    timestamp: Date.now(),
    data: {
      damage: action.damage,
      newShield,
    },
  });
  
  return state;
}

/**
 * Manual: Fase 6 - Control alienígena de guetto
 */
function reduceAlienControlGhetto(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  const ghetto = state.ghettos.get(action.ghettoId)!;
  const characters = Array.from(state.characters.values());
  
  const { ghetto: newGhetto, characters: newCharacters } = applyAlienControl(ghetto, characters);
  
  // Reducir tokens de control
  state.alien = {
    ...state.alien,
    controlTokens: state.alien.controlTokens - 1,
  };
  
  state.ghettos.set(action.ghettoId, newGhetto);
  
  newCharacters.forEach(char => {
    state.characters.set(char.id, char);
  });
  
  events.push({
    type: 'GHETTO_CONTROLLED' as any,
    timestamp: Date.now(),
    data: {
      ghettoId: action.ghettoId,
    },
  });
  
  return state;
}

/**
 * Manual: Bomba alienígena - destruye loseta
 */
function reduceAlienBomb(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  const tile = state.tiles.get(action.tileId)!;
  
  const newTile: Tile = {
    ...tile,
    destroyed: true,
  };
  
  state.tiles.set(action.tileId, newTile);
  
  events.push({
    type: 'CHARACTER_MOVED' as any,
    timestamp: Date.now(),
    data: {
      action: 'ALIEN_BOMB',
      tileId: action.tileId,
    },
  });
  
  return state;
}

/**
 * Avanzar a la siguiente fase
 */
function reduceAdvancePhase(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  const nextPhase = PhaseMachine.advance(state);
  
  // Si avanzamos de END_GAME_CHECK a PREPARATION, incrementar turno
  if (state.phase === 'END_GAME_CHECK' && nextPhase === 'PREPARATION') {
    state.turn += 1;
    
    // Aplicar mecánicas de inicio de turno
    const survivalResult = applySurvivalMechanics(state);
    state.ghettos = survivalResult.ghettos;
    
    // Resetear personajes
    state.characters = resetCharactersForNewTurn(state.characters);
  }
  
  state.phase = nextPhase;
  
  events.push({
    type: 'PHASE_CHANGED' as any,
    timestamp: Date.now(),
    data: {
      newPhase: nextPhase,
      turn: state.turn,
    },
  });
  
  return state;
}

/**
 * Finalizar turno
 */
function reduceEndTurn(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  // Verificar condiciones de final de partida
  const gameEnd = checkGameEnd(state);
  
  if (gameEnd.isGameOver) {
    state.gameOver = true;
    state.victoryCondition = gameEnd.victoryCondition;
    state.winner = gameEnd.winner;
    
    events.push({
      type: gameEnd.winner === 'HUMAN' ? 'GAME_WON' as any : 'GAME_LOST' as any,
      timestamp: Date.now(),
      data: {
        victoryCondition: gameEnd.victoryCondition,
      },
    });
  }
  
  // Limpiar acciones del turno
  state.actionsThisTurn = [];
  
  return state;
}



