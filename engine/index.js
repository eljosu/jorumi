"use strict";
/**
 * JORUMI Game Engine - Main Entry Point
 *
 * Motor de reglas del juego JORUMI
 * Diseñado para ser independiente de UI y framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LCGRandom = exports.BUILDING_EFFECTS = exports.applySurvivalMechanics = exports.resetCharactersForNewTurn = exports.checkGameEnd = exports.checkTotalDefeat = exports.checkBeaconActivated = exports.checkEscapeShip = exports.checkMothershipDestroyed = exports.applyDamageToAlien = exports.calculateCombatDamage = exports.liberateGhetto = exports.applyAlienControl = exports.applyWoundedCare = exports.applyFoodConsumption = exports.PHASE_DESCRIPTIONS = exports.getAllPhasesInOrder = exports.isValidPhaseTransition = exports.getNextPhase = exports.PhaseMachine = exports.validateAction = exports.GameEventType = exports.ActionType = exports.GAME_LIMITS = exports.DICE_CONFIGURATION = exports.WORKSHOP_CONVERSIONS = exports.VICTORY_REQUIREMENTS = exports.MOVEMENT_RULES = exports.COMBAT_MECHANICS = exports.SURVIVAL_MECHANICS = exports.CHARACTER_GATHERING_CAPACITY = exports.BUILDING_COSTS = exports.INITIAL_CONFIG = exports.AlienActionFace = exports.AlienAttackFace = exports.DiceType = exports.GhettoControlStatus = exports.VictoryCondition = exports.GamePhase = exports.BuildingType = exports.TileType = exports.ResourceType = exports.CharacterType = exports.PlayerRole = exports.reduceAction = exports.deserializeGameState = exports.serializeGameState = exports.cloneGameState = exports.createInitialGameState = exports.GameEngine = void 0;
exports.randomElement = exports.shuffle = exports.clamp = exports.inRange = exports.deepClone = exports.generateId = exports.getTotalResources = exports.hasEnoughResources = exports.subtractInventories = exports.addInventories = exports.cloneInventory = exports.createEmptyInventory = exports.hexRound = exports.hexPath = exports.stringToHex = exports.hexToString = exports.hexEquals = exports.getHexCoordinatesInRange = exports.getAdjacentHexCoordinates = exports.hexDistance = exports.createHexCoordinate = exports.isValidHexCoordinate = exports.DiceManager = exports.DiceFactory = exports.CombatDice = exports.TwoD3 = exports.StandardD6 = exports.AlienActionDice = exports.AlienAttackDice = exports.Dice = exports.RandomFactory = exports.FixedRandom = void 0;
// ============================================================================
// CORE
// ============================================================================
var game_engine_1 = require("./core/game-engine");
Object.defineProperty(exports, "GameEngine", { enumerable: true, get: function () { return game_engine_1.GameEngine; } });
var state_factory_1 = require("./core/state-factory");
Object.defineProperty(exports, "createInitialGameState", { enumerable: true, get: function () { return state_factory_1.createInitialGameState; } });
Object.defineProperty(exports, "cloneGameState", { enumerable: true, get: function () { return state_factory_1.cloneGameState; } });
Object.defineProperty(exports, "serializeGameState", { enumerable: true, get: function () { return state_factory_1.serializeGameState; } });
Object.defineProperty(exports, "deserializeGameState", { enumerable: true, get: function () { return state_factory_1.deserializeGameState; } });
var action_reducer_1 = require("./core/action-reducer");
Object.defineProperty(exports, "reduceAction", { enumerable: true, get: function () { return action_reducer_1.reduceAction; } });
var types_1 = require("./domain/types");
Object.defineProperty(exports, "PlayerRole", { enumerable: true, get: function () { return types_1.PlayerRole; } });
Object.defineProperty(exports, "CharacterType", { enumerable: true, get: function () { return types_1.CharacterType; } });
Object.defineProperty(exports, "ResourceType", { enumerable: true, get: function () { return types_1.ResourceType; } });
Object.defineProperty(exports, "TileType", { enumerable: true, get: function () { return types_1.TileType; } });
Object.defineProperty(exports, "BuildingType", { enumerable: true, get: function () { return types_1.BuildingType; } });
Object.defineProperty(exports, "GamePhase", { enumerable: true, get: function () { return types_1.GamePhase; } });
Object.defineProperty(exports, "VictoryCondition", { enumerable: true, get: function () { return types_1.VictoryCondition; } });
Object.defineProperty(exports, "GhettoControlStatus", { enumerable: true, get: function () { return types_1.GhettoControlStatus; } });
Object.defineProperty(exports, "DiceType", { enumerable: true, get: function () { return types_1.DiceType; } });
Object.defineProperty(exports, "AlienAttackFace", { enumerable: true, get: function () { return types_1.AlienAttackFace; } });
Object.defineProperty(exports, "AlienActionFace", { enumerable: true, get: function () { return types_1.AlienActionFace; } });
var constants_1 = require("./domain/constants");
Object.defineProperty(exports, "INITIAL_CONFIG", { enumerable: true, get: function () { return constants_1.INITIAL_CONFIG; } });
Object.defineProperty(exports, "BUILDING_COSTS", { enumerable: true, get: function () { return constants_1.BUILDING_COSTS; } });
Object.defineProperty(exports, "CHARACTER_GATHERING_CAPACITY", { enumerable: true, get: function () { return constants_1.CHARACTER_GATHERING_CAPACITY; } });
Object.defineProperty(exports, "SURVIVAL_MECHANICS", { enumerable: true, get: function () { return constants_1.SURVIVAL_MECHANICS; } });
Object.defineProperty(exports, "COMBAT_MECHANICS", { enumerable: true, get: function () { return constants_1.COMBAT_MECHANICS; } });
Object.defineProperty(exports, "MOVEMENT_RULES", { enumerable: true, get: function () { return constants_1.MOVEMENT_RULES; } });
Object.defineProperty(exports, "VICTORY_REQUIREMENTS", { enumerable: true, get: function () { return constants_1.VICTORY_REQUIREMENTS; } });
Object.defineProperty(exports, "WORKSHOP_CONVERSIONS", { enumerable: true, get: function () { return constants_1.WORKSHOP_CONVERSIONS; } });
Object.defineProperty(exports, "DICE_CONFIGURATION", { enumerable: true, get: function () { return constants_1.DICE_CONFIGURATION; } });
Object.defineProperty(exports, "GAME_LIMITS", { enumerable: true, get: function () { return constants_1.GAME_LIMITS; } });
var types_2 = require("./actions/types");
Object.defineProperty(exports, "ActionType", { enumerable: true, get: function () { return types_2.ActionType; } });
Object.defineProperty(exports, "GameEventType", { enumerable: true, get: function () { return types_2.GameEventType; } });
var validators_1 = require("./actions/validators");
Object.defineProperty(exports, "validateAction", { enumerable: true, get: function () { return validators_1.validateAction; } });
// ============================================================================
// RULES
// ============================================================================
var phase_machine_1 = require("./rules/phase-machine");
Object.defineProperty(exports, "PhaseMachine", { enumerable: true, get: function () { return phase_machine_1.PhaseMachine; } });
Object.defineProperty(exports, "getNextPhase", { enumerable: true, get: function () { return phase_machine_1.getNextPhase; } });
Object.defineProperty(exports, "isValidPhaseTransition", { enumerable: true, get: function () { return phase_machine_1.isValidPhaseTransition; } });
Object.defineProperty(exports, "getAllPhasesInOrder", { enumerable: true, get: function () { return phase_machine_1.getAllPhasesInOrder; } });
Object.defineProperty(exports, "PHASE_DESCRIPTIONS", { enumerable: true, get: function () { return phase_machine_1.PHASE_DESCRIPTIONS; } });
var game_rules_1 = require("./rules/game-rules");
Object.defineProperty(exports, "applyFoodConsumption", { enumerable: true, get: function () { return game_rules_1.applyFoodConsumption; } });
Object.defineProperty(exports, "applyWoundedCare", { enumerable: true, get: function () { return game_rules_1.applyWoundedCare; } });
Object.defineProperty(exports, "applyAlienControl", { enumerable: true, get: function () { return game_rules_1.applyAlienControl; } });
Object.defineProperty(exports, "liberateGhetto", { enumerable: true, get: function () { return game_rules_1.liberateGhetto; } });
Object.defineProperty(exports, "calculateCombatDamage", { enumerable: true, get: function () { return game_rules_1.calculateCombatDamage; } });
Object.defineProperty(exports, "applyDamageToAlien", { enumerable: true, get: function () { return game_rules_1.applyDamageToAlien; } });
Object.defineProperty(exports, "checkMothershipDestroyed", { enumerable: true, get: function () { return game_rules_1.checkMothershipDestroyed; } });
Object.defineProperty(exports, "checkEscapeShip", { enumerable: true, get: function () { return game_rules_1.checkEscapeShip; } });
Object.defineProperty(exports, "checkBeaconActivated", { enumerable: true, get: function () { return game_rules_1.checkBeaconActivated; } });
Object.defineProperty(exports, "checkTotalDefeat", { enumerable: true, get: function () { return game_rules_1.checkTotalDefeat; } });
Object.defineProperty(exports, "checkGameEnd", { enumerable: true, get: function () { return game_rules_1.checkGameEnd; } });
Object.defineProperty(exports, "resetCharactersForNewTurn", { enumerable: true, get: function () { return game_rules_1.resetCharactersForNewTurn; } });
Object.defineProperty(exports, "applySurvivalMechanics", { enumerable: true, get: function () { return game_rules_1.applySurvivalMechanics; } });
Object.defineProperty(exports, "BUILDING_EFFECTS", { enumerable: true, get: function () { return game_rules_1.BUILDING_EFFECTS; } });
var rng_1 = require("./dice/rng");
Object.defineProperty(exports, "LCGRandom", { enumerable: true, get: function () { return rng_1.LCGRandom; } });
Object.defineProperty(exports, "FixedRandom", { enumerable: true, get: function () { return rng_1.FixedRandom; } });
Object.defineProperty(exports, "RandomFactory", { enumerable: true, get: function () { return rng_1.RandomFactory; } });
var dice_1 = require("./dice/dice");
Object.defineProperty(exports, "Dice", { enumerable: true, get: function () { return dice_1.Dice; } });
Object.defineProperty(exports, "AlienAttackDice", { enumerable: true, get: function () { return dice_1.AlienAttackDice; } });
Object.defineProperty(exports, "AlienActionDice", { enumerable: true, get: function () { return dice_1.AlienActionDice; } });
Object.defineProperty(exports, "StandardD6", { enumerable: true, get: function () { return dice_1.StandardD6; } });
Object.defineProperty(exports, "TwoD3", { enumerable: true, get: function () { return dice_1.TwoD3; } });
Object.defineProperty(exports, "CombatDice", { enumerable: true, get: function () { return dice_1.CombatDice; } });
Object.defineProperty(exports, "DiceFactory", { enumerable: true, get: function () { return dice_1.DiceFactory; } });
Object.defineProperty(exports, "DiceManager", { enumerable: true, get: function () { return dice_1.DiceManager; } });
// ============================================================================
// UTILS
// ============================================================================
var hex_1 = require("./utils/hex");
Object.defineProperty(exports, "isValidHexCoordinate", { enumerable: true, get: function () { return hex_1.isValidHexCoordinate; } });
Object.defineProperty(exports, "createHexCoordinate", { enumerable: true, get: function () { return hex_1.createHexCoordinate; } });
Object.defineProperty(exports, "hexDistance", { enumerable: true, get: function () { return hex_1.hexDistance; } });
Object.defineProperty(exports, "getAdjacentHexCoordinates", { enumerable: true, get: function () { return hex_1.getAdjacentHexCoordinates; } });
Object.defineProperty(exports, "getHexCoordinatesInRange", { enumerable: true, get: function () { return hex_1.getHexCoordinatesInRange; } });
Object.defineProperty(exports, "hexEquals", { enumerable: true, get: function () { return hex_1.hexEquals; } });
Object.defineProperty(exports, "hexToString", { enumerable: true, get: function () { return hex_1.hexToString; } });
Object.defineProperty(exports, "stringToHex", { enumerable: true, get: function () { return hex_1.stringToHex; } });
Object.defineProperty(exports, "hexPath", { enumerable: true, get: function () { return hex_1.hexPath; } });
Object.defineProperty(exports, "hexRound", { enumerable: true, get: function () { return hex_1.hexRound; } });
var helpers_1 = require("./utils/helpers");
Object.defineProperty(exports, "createEmptyInventory", { enumerable: true, get: function () { return helpers_1.createEmptyInventory; } });
Object.defineProperty(exports, "cloneInventory", { enumerable: true, get: function () { return helpers_1.cloneInventory; } });
Object.defineProperty(exports, "addInventories", { enumerable: true, get: function () { return helpers_1.addInventories; } });
Object.defineProperty(exports, "subtractInventories", { enumerable: true, get: function () { return helpers_1.subtractInventories; } });
Object.defineProperty(exports, "hasEnoughResources", { enumerable: true, get: function () { return helpers_1.hasEnoughResources; } });
Object.defineProperty(exports, "getTotalResources", { enumerable: true, get: function () { return helpers_1.getTotalResources; } });
Object.defineProperty(exports, "generateId", { enumerable: true, get: function () { return helpers_1.generateId; } });
Object.defineProperty(exports, "deepClone", { enumerable: true, get: function () { return helpers_1.deepClone; } });
Object.defineProperty(exports, "inRange", { enumerable: true, get: function () { return helpers_1.inRange; } });
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return helpers_1.clamp; } });
Object.defineProperty(exports, "shuffle", { enumerable: true, get: function () { return helpers_1.shuffle; } });
Object.defineProperty(exports, "randomElement", { enumerable: true, get: function () { return helpers_1.randomElement; } });
//# sourceMappingURL=index.js.map