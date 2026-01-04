/**
 * JORUMI Game Engine - Action Validators
 * 
 * Validadores de acciones según las reglas del manual
 * Cada validador verifica si una acción es legal en el estado actual
 */

import { GameState, ValidationResult, GamePhase, GhettoControlStatus, BuildingType } from '../domain/types';
import { GameAction, ActionType } from './types';
import { hexDistance } from '../utils/hex';
import { hasEnoughResources } from '../utils/helpers';
import { 
  BUILDING_COSTS, 
  CHARACTER_GATHERING_CAPACITY, 
  MOVEMENT_RULES,
  GAME_LIMITS 
} from '../domain/constants';

/**
 * Validador base - verifica que el juego no haya terminado
 */
function validateGameNotOver(state: GameState): ValidationResult {
  if (state.gameOver) {
    return { valid: false, reason: 'Game is already over' };
  }
  return { valid: true };
}

/**
 * Validador base - verifica que sea el turno del jugador
 */
function validatePlayerTurn(state: GameState, playerId: string): ValidationResult {
  if (state.currentPlayerId !== playerId) {
    return { valid: false, reason: 'Not player\'s turn' };
  }
  return { valid: true };
}

/**
 * Validador base - verifica que la fase sea correcta
 */
function validatePhase(state: GameState, requiredPhase: GamePhase | GamePhase[]): ValidationResult {
  const phases = Array.isArray(requiredPhase) ? requiredPhase : [requiredPhase];
  if (!phases.includes(state.phase)) {
    return { valid: false, reason: `Invalid phase. Required: ${phases.join(' or ')}, Current: ${state.phase}` };
  }
  return { valid: true };
}

// ============================================================================
// VALIDADORES ESPECÍFICOS
// ============================================================================

/**
 * Manual: Fase 3 - Validar movimiento de personaje
 */
export function validateMoveCharacter(state: GameState, action: GameAction): ValidationResult {
  if (action.type !== ActionType.MOVE_CHARACTER) {
    return { valid: false, reason: 'Invalid action type' };
  }
  
  // Verificar fase
  const phaseCheck = validatePhase(state, GamePhase.MOVEMENT);
  if (!phaseCheck.valid) return phaseCheck;
  
  // Verificar que el personaje existe
  const character = state.characters.get(action.characterId);
  if (!character) {
    return { valid: false, reason: 'Character not found' };
  }
  
  // Verificar que el personaje no ha actuado
  if (character.isUsed) {
    return { valid: false, reason: 'Character has already acted this turn' };
  }
  
  // Verificar que el personaje puede actuar (no está en guetto controlado)
  if (!character.canAct) {
    return { valid: false, reason: 'Character cannot act (in controlled ghetto)' };
  }
  
  // Verificar que la loseta destino existe
  const targetTile = state.tiles.get(action.targetTileId);
  if (!targetTile) {
    return { valid: false, reason: 'Target tile not found' };
  }
  
  // Verificar que la loseta no está destruida
  if (targetTile.destroyed) {
    return { valid: false, reason: 'Target tile is destroyed' };
  }
  
  // Verificar distancia de movimiento
  const currentTileId = character.tileId;
  if (currentTileId) {
    const currentTile = state.tiles.get(currentTileId);
    if (currentTile) {
      const distance = hexDistance(currentTile.coordinates, targetTile.coordinates);
      if (distance > MOVEMENT_RULES.CHARACTER_MOVE_RANGE) {
        return { valid: false, reason: `Movement range exceeded. Max: ${MOVEMENT_RULES.CHARACTER_MOVE_RANGE}, Attempted: ${distance}` };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Manual: Fase 4 - Validar recolección de recursos
 */
export function validateGatherResources(state: GameState, action: GameAction): ValidationResult {
  if (action.type !== ActionType.GATHER_RESOURCES) {
    return { valid: false, reason: 'Invalid action type' };
  }
  
  // Verificar fase
  const phaseCheck = validatePhase(state, GamePhase.RESOURCE_GATHERING);
  if (!phaseCheck.valid) return phaseCheck;
  
  // Verificar que el personaje existe
  const character = state.characters.get(action.characterId);
  if (!character) {
    return { valid: false, reason: 'Character not found' };
  }
  
  // Verificar que el personaje no ha actuado
  if (character.isUsed) {
    return { valid: false, reason: 'Character has already acted this turn' };
  }
  
  // Verificar que el personaje está en una loseta válida
  if (!character.tileId) {
    return { valid: false, reason: 'Character is not on a tile' };
  }
  
  const tile = state.tiles.get(character.tileId);
  if (!tile) {
    return { valid: false, reason: 'Character\'s tile not found' };
  }
  
  // Verificar que el personaje puede recolectar ese recurso
  const capacity = CHARACTER_GATHERING_CAPACITY[character.type];
  
  // Verificar capacidad específica según tipo de personaje
  if (action.resourceType === 'FOOD' && character.type !== 'PEASANT') {
    return { valid: false, reason: 'Only peasants can gather food efficiently' };
  }
  
  if ((action.resourceType === 'MINERALS' || action.resourceType === 'METAL') 
      && character.type !== 'MINER') {
    return { valid: false, reason: 'Only miners can gather minerals and metal' };
  }
  
  // Verificar que no excede la capacidad
  const maxAmount = capacity[action.resourceType as keyof typeof capacity] ?? 0;
  if (action.amount > maxAmount) {
    return { valid: false, reason: `Amount exceeds capacity. Max: ${maxAmount}, Attempted: ${action.amount}` };
  }
  
  return { valid: true };
}

/**
 * Manual: Fase 5 - Validar construcción de edificio
 */
export function validateBuildStructure(state: GameState, action: GameAction): ValidationResult {
  if (action.type !== ActionType.BUILD_STRUCTURE) {
    return { valid: false, reason: 'Invalid action type' };
  }
  
  // Verificar fase (construcción puede ocurrir en fase de comercio)
  const phaseCheck = validatePhase(state, GamePhase.TRADING);
  if (!phaseCheck.valid) return phaseCheck;
  
  // Verificar que el personaje es un constructor
  const character = state.characters.get(action.characterId);
  if (!character) {
    return { valid: false, reason: 'Character not found' };
  }
  
  if (character.type !== 'CONSTRUCTOR') {
    return { valid: false, reason: 'Only constructors can build' };
  }
  
  // Verificar que el guetto existe
  const ghetto = state.ghettos.get(action.ghettoId);
  if (!ghetto) {
    return { valid: false, reason: 'Ghetto not found' };
  }
  
  // Verificar que el guetto no está bajo control alienígena
  if (ghetto.controlStatus === GhettoControlStatus.ALIEN) {
    return { valid: false, reason: 'Cannot build in alien-controlled ghetto' };
  }
  
  // Verificar que no se excede el límite de edificios
  if (ghetto.buildings.length >= GAME_LIMITS.MAX_BUILDINGS_PER_GHETTO) {
    return { valid: false, reason: `Maximum buildings reached (${GAME_LIMITS.MAX_BUILDINGS_PER_GHETTO})` };
  }
  
  // Verificar que el guetto tiene los recursos necesarios
  const cost = BUILDING_COSTS[action.buildingType];
  if (!hasEnoughResources(ghetto.resources, cost)) {
    return { valid: false, reason: 'Insufficient resources for construction' };
  }
  
  return { valid: true };
}

/**
 * Manual: Curación de heridos
 */
export function validateHealWounded(state: GameState, action: GameAction): ValidationResult {
  if (action.type !== ActionType.HEAL_WOUNDED) {
    return { valid: false, reason: 'Invalid action type' };
  }
  
  // Verificar fase
  const phaseCheck = validatePhase(state, [GamePhase.RESOURCE_GATHERING, GamePhase.TRADING]);
  if (!phaseCheck.valid) return phaseCheck;
  
  // Verificar que el personaje es un doctor
  const character = state.characters.get(action.characterId);
  if (!character) {
    return { valid: false, reason: 'Character not found' };
  }
  
  if (character.type !== 'DOCTOR') {
    return { valid: false, reason: 'Only doctors can heal' };
  }
  
  // Verificar que el guetto existe
  const ghetto = state.ghettos.get(action.ghettoId);
  if (!ghetto) {
    return { valid: false, reason: 'Ghetto not found' };
  }
  
  // Verificar que hay heridos para curar
  if (ghetto.wounded === 0) {
    return { valid: false, reason: 'No wounded humans to heal' };
  }
  
  // Verificar que se intenta curar una cantidad válida
  if (action.amount > ghetto.wounded) {
    return { valid: false, reason: 'Cannot heal more wounded than exist' };
  }
  
  return { valid: true };
}

/**
 * Manual: Fase 5 - Validar transferencia de recursos
 */
export function validateTransferResources(state: GameState, action: GameAction): ValidationResult {
  if (action.type !== ActionType.TRANSFER_RESOURCES) {
    return { valid: false, reason: 'Invalid action type' };
  }
  
  // Verificar fase
  const phaseCheck = validatePhase(state, GamePhase.TRADING);
  if (!phaseCheck.valid) return phaseCheck;
  
  // Verificar que ambos guettos existen
  const fromGhetto = state.ghettos.get(action.fromGhettoId);
  const toGhetto = state.ghettos.get(action.toGhettoId);
  
  if (!fromGhetto) {
    return { valid: false, reason: 'Source ghetto not found' };
  }
  
  if (!toGhetto) {
    return { valid: false, reason: 'Target ghetto not found' };
  }
  
  // Verificar que el guetto origen tiene los recursos
  if (!hasEnoughResources(fromGhetto.resources, action.resources)) {
    return { valid: false, reason: 'Insufficient resources in source ghetto' };
  }
  
  return { valid: true };
}

/**
 * Manual: Fase 6 - Validar ataque al alienígena
 */
export function validateAttackAlien(state: GameState, action: GameAction): ValidationResult {
  if (action.type !== ActionType.ATTACK_ALIEN) {
    return { valid: false, reason: 'Invalid action type' };
  }
  
  // El ataque puede ocurrir en varias fases
  const phaseCheck = validatePhase(state, [GamePhase.MOVEMENT, GamePhase.ALIEN_TURN]);
  if (!phaseCheck.valid) return phaseCheck;
  
  // Verificar que el personaje es un soldado
  const character = state.characters.get(action.characterId);
  if (!character) {
    return { valid: false, reason: 'Character not found' };
  }
  
  if (character.type !== 'SOLDIER') {
    return { valid: false, reason: 'Only soldiers can attack' };
  }
  
  // Verificar que el alienígena está en rango
  if (!state.alien.currentTileId) {
    return { valid: false, reason: 'Alien position unknown' };
  }
  
  const alienTile = state.tiles.get(state.alien.currentTileId);
  const characterTile = character.tileId ? state.tiles.get(character.tileId) : null;
  
  if (!alienTile || !characterTile) {
    return { valid: false, reason: 'Position not found' };
  }
  
  const distance = hexDistance(characterTile.coordinates, alienTile.coordinates);
  if (distance > MOVEMENT_RULES.ADJACENT_DISTANCE) {
    return { valid: false, reason: 'Alien not in range' };
  }
  
  return { valid: true };
}

/**
 * Manual: Control alienígena de guetto
 */
export function validateAlienControlGhetto(state: GameState, action: GameAction): ValidationResult {
  if (action.type !== ActionType.ALIEN_CONTROL_GHETTO) {
    return { valid: false, reason: 'Invalid action type' };
  }
  
  // Verificar fase
  const phaseCheck = validatePhase(state, GamePhase.ALIEN_TURN);
  if (!phaseCheck.valid) return phaseCheck;
  
  // Verificar que el guetto existe
  const ghetto = state.ghettos.get(action.ghettoId);
  if (!ghetto) {
    return { valid: false, reason: 'Ghetto not found' };
  }
  
  // Verificar que el guetto no está ya controlado
  if (ghetto.controlStatus === GhettoControlStatus.ALIEN) {
    return { valid: false, reason: 'Ghetto already under alien control' };
  }
  
  // Verificar que el alienígena tiene tokens de control
  if (state.alien.controlTokens <= 0) {
    return { valid: false, reason: 'No control tokens available' };
  }
  
  return { valid: true };
}

/**
 * Manual: Activar baliza (condición de victoria)
 */
export function validateActivateBeacon(state: GameState, action: GameAction): ValidationResult {
  if (action.type !== ActionType.ACTIVATE_BEACON) {
    return { valid: false, reason: 'Invalid action type' };
  }
  
  // Verificar que el guetto existe
  const ghetto = state.ghettos.get(action.ghettoId);
  if (!ghetto) {
    return { valid: false, reason: 'Ghetto not found' };
  }
  
  // Verificar que hay una baliza construida
  if (!ghetto.buildings.includes(BuildingType.BEACON)) {
    return { valid: false, reason: 'No beacon in this ghetto' };
  }
  
  // Verificar que el guetto no está bajo control alienígena
  if (ghetto.controlStatus === GhettoControlStatus.ALIEN) {
    return { valid: false, reason: 'Cannot activate beacon in alien-controlled ghetto' };
  }
  
  return { valid: true };
}

// ============================================================================
// VALIDADOR PRINCIPAL
// ============================================================================

/**
 * Valida cualquier acción
 */
export function validateAction(state: GameState, action: GameAction): ValidationResult {
  // Validaciones globales
  const gameOverCheck = validateGameNotOver(state);
  if (!gameOverCheck.valid) return gameOverCheck;
  
  const playerTurnCheck = validatePlayerTurn(state, action.playerId);
  if (!playerTurnCheck.valid) return playerTurnCheck;
  
  // Validaciones específicas por tipo de acción
  switch (action.type) {
    case ActionType.MOVE_CHARACTER:
      return validateMoveCharacter(state, action);
    
    case ActionType.GATHER_RESOURCES:
      return validateGatherResources(state, action);
    
    case ActionType.BUILD_STRUCTURE:
      return validateBuildStructure(state, action);
    
    case ActionType.HEAL_WOUNDED:
      return validateHealWounded(state, action);
    
    case ActionType.TRANSFER_RESOURCES:
      return validateTransferResources(state, action);
    
    case ActionType.ATTACK_ALIEN:
      return validateAttackAlien(state, action);
    
    case ActionType.ALIEN_CONTROL_GHETTO:
      return validateAlienControlGhetto(state, action);
    
    case ActionType.ACTIVATE_BEACON:
      return validateActivateBeacon(state, action);
    
    // Otras acciones siempre válidas en su contexto
    case ActionType.END_TURN:
    case ActionType.ADVANCE_PHASE:
      return { valid: true };
    
    default:
      return { valid: false, reason: 'Unknown action type' };
  }
}



