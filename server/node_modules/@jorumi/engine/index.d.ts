/**
 * JORUMI Game Engine - Main Entry Point
 *
 * Motor de reglas del juego JORUMI
 * Diseñado para ser independiente de UI y framework
 */
export { GameEngine } from './core/game-engine';
export type { EngineOptions } from './core/game-engine';
export { createInitialGameState, cloneGameState, serializeGameState, deserializeGameState, } from './core/state-factory';
export type { GameConfig } from './core/state-factory';
export { reduceAction } from './core/action-reducer';
export type { GameState, Player, Character, Ghetto, Tile, AlienState, ResourceInventory, HexCoordinates, ValidationResult, DiceRollResult, } from './domain/types';
export { PlayerRole, CharacterType, ResourceType, TileType, BuildingType, GamePhase, VictoryCondition, GhettoControlStatus, DiceType, AlienAttackFace, AlienActionFace, } from './domain/types';
export { INITIAL_CONFIG, BUILDING_COSTS, CHARACTER_GATHERING_CAPACITY, SURVIVAL_MECHANICS, COMBAT_MECHANICS, MOVEMENT_RULES, VICTORY_REQUIREMENTS, WORKSHOP_CONVERSIONS, DICE_CONFIGURATION, GAME_LIMITS, } from './domain/constants';
export type { GameAction, StartGameAction, MoveCharacterAction, GatherResourcesAction, BuildStructureAction, HealWoundedAction, TransferResourcesAction, AttackAlienAction, AlienControlGhettoAction, AlienBombAction, ActivateBeaconAction, ActionResult, GameEvent, } from './actions/types';
export { ActionType, GameEventType, } from './actions/types';
export { validateAction } from './actions/validators';
export { PhaseMachine, getNextPhase, isValidPhaseTransition, getAllPhasesInOrder, PHASE_DESCRIPTIONS, } from './rules/phase-machine';
export { applyFoodConsumption, applyWoundedCare, applyAlienControl, liberateGhetto, calculateCombatDamage, applyDamageToAlien, checkMothershipDestroyed, checkEscapeShip, checkBeaconActivated, checkTotalDefeat, checkGameEnd, resetCharactersForNewTurn, applySurvivalMechanics, BUILDING_EFFECTS, } from './rules/game-rules';
export type { RandomGenerator } from './dice/rng';
export { LCGRandom, FixedRandom, RandomFactory } from './dice/rng';
export { Dice, AlienAttackDice, AlienActionDice, StandardD6, TwoD3, CombatDice, DiceFactory, DiceManager, } from './dice/dice';
export { isValidHexCoordinate, createHexCoordinate, hexDistance, getAdjacentHexCoordinates, getHexCoordinatesInRange, hexEquals, hexToString, stringToHex, hexPath, hexRound, } from './utils/hex';
export { createEmptyInventory, cloneInventory, addInventories, subtractInventories, hasEnoughResources, getTotalResources, generateId, deepClone, inRange, clamp, shuffle, randomElement, } from './utils/helpers';
//# sourceMappingURL=index.d.ts.map