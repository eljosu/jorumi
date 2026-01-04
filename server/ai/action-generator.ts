/**
 * JORUMI AI - Action Generator
 * 
 * Genera todas las acciones válidas posibles para el turno alienígena
 * Solo genera acciones que siguen estrictamente las reglas del juego
 */

import {
  GameState,
  GamePhase,
  GhettoControlStatus,
  AlienAttackFace,
  AlienActionFace,
} from '../../engine/domain/types';
import {
  GameAction,
  ActionType,
  MoveAlienAction,
  AlienAttackAction,
  AlienControlGhettoAction,
  AlienBombAction,
  AlienScanAction,
} from '../../engine/actions/types';
import { calculateHexDistance } from '../../engine/utils/hex';
import { MOVEMENT_RULES } from '../../engine/domain/constants';

// ============================================================================
// CONSTANTES
// ============================================================================

const ALIEN_PLAYER_ID = 'AI_ALIEN';

// ============================================================================
// GENERADOR DE ACCIONES
// ============================================================================

/**
 * Genera todas las acciones de movimiento posibles
 */
export function generateMoveActions(state: GameState): MoveAlienAction[] {
  const actions: MoveAlienAction[] = [];
  
  if (!state.alien.currentTileId) {
    return actions; // No hay posición actual
  }
  
  const currentTile = state.tiles.get(state.alien.currentTileId);
  if (!currentTile) {
    return actions;
  }
  
  // Encontrar todas las losetas dentro del rango de movimiento
  state.tiles.forEach((tile, tileId) => {
    // No moverse a la misma loseta
    if (tileId === state.alien.currentTileId) {
      return;
    }
    
    // Verificar que no esté destruida
    if (tile.destroyed) {
      return;
    }
    
    // Calcular distancia
    const distance = calculateHexDistance(
      currentTile.coordinates,
      tile.coordinates
    );
    
    // Verificar rango de movimiento
    if (distance <= MOVEMENT_RULES.ALIEN_MOVE_RANGE) {
      actions.push({
        type: ActionType.MOVE_ALIEN,
        playerId: ALIEN_PLAYER_ID,
        targetTileId: tileId,
        timestamp: Date.now(),
      });
    }
  });
  
  return actions;
}

/**
 * Genera todas las acciones de ataque posibles
 */
export function generateAttackActions(
  state: GameState,
  diceResult?: AlienAttackFace
): AlienAttackAction[] {
  const actions: AlienAttackAction[] = [];
  
  // Solo generar ataques si el dado lo permite (en implementación real)
  // Por ahora, generamos todas las posibilidades
  
  state.ghettos.forEach((ghetto, ghettoId) => {
    // No atacar guettos ya controlados
    if (ghetto.controlStatus === GhettoControlStatus.ALIEN) {
      return;
    }
    
    // Solo atacar guettos con población
    if (ghetto.population + ghetto.wounded === 0) {
      return;
    }
    
    // Calcular daño potencial según dado
    let damage = 1; // Daño base
    
    if (diceResult === AlienAttackFace.ATTACK) {
      damage = 2;
    } else if (diceResult === AlienAttackFace.DOUBLE_ATTACK) {
      damage = 4;
    }
    
    actions.push({
      type: ActionType.ALIEN_ATTACK,
      playerId: ALIEN_PLAYER_ID,
      targetGhettoId: ghettoId,
      damage,
      timestamp: Date.now(),
    });
  });
  
  return actions;
}

/**
 * Genera todas las acciones de control posibles
 */
export function generateControlActions(
  state: GameState,
  diceResult?: AlienAttackFace
): AlienControlGhettoAction[] {
  const actions: AlienControlGhettoAction[] = [];
  
  // Solo si el dado permite control o hay tokens disponibles
  if (state.alien.controlTokens <= 0) {
    return actions;
  }
  
  state.ghettos.forEach((ghetto, ghettoId) => {
    // Solo controlar guettos humanos
    if (ghetto.controlStatus !== GhettoControlStatus.HUMAN) {
      return;
    }
    
    // Verificar proximidad (debe estar cerca)
    if (state.alien.currentTileId) {
      const alienTile = state.tiles.get(state.alien.currentTileId);
      const ghettoTile = state.tiles.get(ghetto.tileId);
      
      if (alienTile && ghettoTile) {
        const distance = calculateHexDistance(
          alienTile.coordinates,
          ghettoTile.coordinates
        );
        
        // Solo controlar guettos adyacentes o cercanos
        if (distance <= 2) {
          actions.push({
            type: ActionType.ALIEN_CONTROL_GHETTO,
            playerId: ALIEN_PLAYER_ID,
            ghettoId,
            timestamp: Date.now(),
          });
        }
      }
    }
  });
  
  return actions;
}

/**
 * Genera todas las acciones de bomba posibles
 */
export function generateBombActions(
  state: GameState,
  diceResult?: AlienActionFace
): AlienBombAction[] {
  const actions: AlienBombAction[] = [];
  
  // Solo si el dado permite bomba (o en evaluación)
  
  state.tiles.forEach((tile, tileId) => {
    // No bombardear losetas ya destruidas
    if (tile.destroyed) {
      return;
    }
    
    // No bombardear la nave nodriza
    if (tile.type === 'ALIEN_SHIP') {
      return;
    }
    
    // Verificar proximidad (debe estar en rango)
    if (state.alien.currentTileId) {
      const alienTile = state.tiles.get(state.alien.currentTileId);
      
      if (alienTile) {
        const distance = calculateHexDistance(
          alienTile.coordinates,
          tile.coordinates
        );
        
        // Rango de bomba (puede ser mayor que movimiento)
        if (distance <= 4) {
          actions.push({
            type: ActionType.ALIEN_BOMB,
            playerId: ALIEN_PLAYER_ID,
            tileId,
            timestamp: Date.now(),
          });
        }
      }
    }
  });
  
  return actions;
}

/**
 * Genera todas las acciones de escaneo posibles
 */
export function generateScanActions(
  state: GameState,
  diceResult?: AlienActionFace
): AlienScanAction[] {
  const actions: AlienScanAction[] = [];
  
  // Escanear losetas inexploradas o de interés
  state.tiles.forEach((tile, tileId) => {
    if (!tile.destroyed) {
      actions.push({
        type: ActionType.ALIEN_SCAN,
        playerId: ALIEN_PLAYER_ID,
        targetTileId: tileId,
        timestamp: Date.now(),
      });
    }
  });
  
  return actions;
}

/**
 * Genera todas las acciones posibles para el turno alienígena
 */
export function generateAllAlienActions(
  state: GameState,
  attackDiceResult?: AlienAttackFace,
  actionDiceResult?: AlienActionFace
): GameAction[] {
  const actions: GameAction[] = [];
  
  // Verificar que estamos en fase alienígena
  if (state.phase !== GamePhase.ALIEN_TURN) {
    return actions;
  }
  
  // Generar acciones de movimiento (siempre disponibles)
  const moveActions = generateMoveActions(state);
  actions.push(...moveActions);
  
  // Generar acciones según dados (o todas si evaluamos posibilidades)
  
  // Acciones de ataque
  if (!attackDiceResult || 
      attackDiceResult === AlienAttackFace.ATTACK || 
      attackDiceResult === AlienAttackFace.DOUBLE_ATTACK) {
    const attackActions = generateAttackActions(state, attackDiceResult);
    actions.push(...attackActions);
  }
  
  // Acciones de control
  if (!attackDiceResult || attackDiceResult === AlienAttackFace.CONTROL) {
    const controlActions = generateControlActions(state, attackDiceResult);
    actions.push(...controlActions);
  }
  
  // Si sale escudo, podríamos generar acción de reforzar escudo
  // (según implementación de reglas)
  
  // Acciones según dado de acción
  if (!actionDiceResult || actionDiceResult === AlienActionFace.BOMB) {
    const bombActions = generateBombActions(state, actionDiceResult);
    actions.push(...bombActions);
  }
  
  if (!actionDiceResult || actionDiceResult === AlienActionFace.SCAN) {
    const scanActions = generateScanActions(state, actionDiceResult);
    actions.push(...scanActions);
  }
  
  // Movimiento adicional
  if (actionDiceResult === AlienActionFace.MOVE) {
    // Movimiento ya incluido arriba
  }
  
  return actions;
}

/**
 * Filtra acciones válidas según el estado actual
 */
export function filterValidActions(
  actions: GameAction[],
  state: GameState
): GameAction[] {
  return actions.filter(action => {
    switch (action.type) {
      case ActionType.MOVE_ALIEN:
        return validateMoveAction(action as MoveAlienAction, state);
      
      case ActionType.ALIEN_ATTACK:
        return validateAttackAction(action as AlienAttackAction, state);
      
      case ActionType.ALIEN_CONTROL_GHETTO:
        return validateControlAction(action as AlienControlGhettoAction, state);
      
      case ActionType.ALIEN_BOMB:
        return validateBombAction(action as AlienBombAction, state);
      
      case ActionType.ALIEN_SCAN:
        return validateScanAction(action as AlienScanAction, state);
      
      default:
        return false;
    }
  });
}

// ============================================================================
// VALIDADORES DE ACCIONES
// ============================================================================

function validateMoveAction(action: MoveAlienAction, state: GameState): boolean {
  const targetTile = state.tiles.get(action.targetTileId);
  if (!targetTile || targetTile.destroyed) {
    return false;
  }
  
  if (!state.alien.currentTileId) {
    return false;
  }
  
  const currentTile = state.tiles.get(state.alien.currentTileId);
  if (!currentTile) {
    return false;
  }
  
  const distance = calculateHexDistance(
    currentTile.coordinates,
    targetTile.coordinates
  );
  
  return distance <= MOVEMENT_RULES.ALIEN_MOVE_RANGE && distance > 0;
}

function validateAttackAction(action: AlienAttackAction, state: GameState): boolean {
  const ghetto = state.ghettos.get(action.targetGhettoId);
  if (!ghetto) {
    return false;
  }
  
  // No atacar guettos controlados
  if (ghetto.controlStatus === GhettoControlStatus.ALIEN) {
    return false;
  }
  
  // Debe haber población
  return (ghetto.population + ghetto.wounded) > 0;
}

function validateControlAction(action: AlienControlGhettoAction, state: GameState): boolean {
  // Debe haber tokens de control
  if (state.alien.controlTokens <= 0) {
    return false;
  }
  
  const ghetto = state.ghettos.get(action.ghettoId);
  if (!ghetto) {
    return false;
  }
  
  // Solo controlar guettos humanos
  if (ghetto.controlStatus !== GhettoControlStatus.HUMAN) {
    return false;
  }
  
  // Verificar proximidad
  if (!state.alien.currentTileId) {
    return false;
  }
  
  const alienTile = state.tiles.get(state.alien.currentTileId);
  const ghettoTile = state.tiles.get(ghetto.tileId);
  
  if (!alienTile || !ghettoTile) {
    return false;
  }
  
  const distance = calculateHexDistance(
    alienTile.coordinates,
    ghettoTile.coordinates
  );
  
  return distance <= 2;
}

function validateBombAction(action: AlienBombAction, state: GameState): boolean {
  const tile = state.tiles.get(action.tileId);
  if (!tile || tile.destroyed) {
    return false;
  }
  
  // No bombardear nave nodriza
  if (tile.type === 'ALIEN_SHIP') {
    return false;
  }
  
  // Verificar rango
  if (!state.alien.currentTileId) {
    return false;
  }
  
  const alienTile = state.tiles.get(state.alien.currentTileId);
  if (!alienTile) {
    return false;
  }
  
  const distance = calculateHexDistance(
    alienTile.coordinates,
    tile.coordinates
  );
  
  return distance <= 4;
}

function validateScanAction(action: AlienScanAction, state: GameState): boolean {
  const tile = state.tiles.get(action.targetTileId);
  return tile !== undefined && !tile.destroyed;
}

/**
 * Prioriza acciones según tipo (para optimizar evaluación)
 * Las acciones más impactantes se evalúan primero
 */
export function prioritizeActions(actions: GameAction[]): GameAction[] {
  const priority: Record<ActionType, number> = {
    [ActionType.ALIEN_ATTACK]: 100,
    [ActionType.ALIEN_CONTROL_GHETTO]: 90,
    [ActionType.ALIEN_BOMB]: 80,
    [ActionType.MOVE_ALIEN]: 50,
    [ActionType.ALIEN_SCAN]: 10,
    // Otras acciones tienen prioridad 0
    [ActionType.START_GAME]: 0,
    [ActionType.END_TURN]: 0,
    [ActionType.ADVANCE_PHASE]: 0,
    [ActionType.EXPLORE_TILE]: 0,
    [ActionType.PLACE_TILE]: 0,
    [ActionType.MOVE_CHARACTER]: 0,
    [ActionType.GATHER_RESOURCES]: 0,
    [ActionType.CONSUME_FOOD]: 0,
    [ActionType.BUILD_STRUCTURE]: 0,
    [ActionType.HEAL_WOUNDED]: 0,
    [ActionType.TRANSFER_RESOURCES]: 0,
    [ActionType.CONVERT_RESOURCES]: 0,
    [ActionType.ATTACK_ALIEN]: 0,
    [ActionType.ATTACK_MOTHERSHIP]: 0,
    [ActionType.DEFEND]: 0,
    [ActionType.CHANGE_ROLE]: 0,
    [ActionType.ACTIVATE_BEACON]: 0,
    [ActionType.ESCAPE_SHIP]: 0,
    [ActionType.END_GAME]: 0,
  };
  
  return [...actions].sort((a, b) => {
    return (priority[b.type] || 0) - (priority[a.type] || 0);
  });
}


