"use strict";
/**
 * JORUMI Game Engine - Action Reducer
 *
 * Reducer que aplica acciones al estado de forma inmutable
 * Pattern: Redux-like reducer para máxima predictibilidad
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceAction = reduceAction;
const types_1 = require("../actions/types");
const validators_1 = require("../actions/validators");
const state_factory_1 = require("./state-factory");
const phase_machine_1 = require("../rules/phase-machine");
const game_rules_1 = require("../rules/game-rules");
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../domain/constants");
/**
 * Reducer principal: aplica una acción al estado
 * Retorna un nuevo estado (inmutable)
 */
function reduceAction(state, action) {
    // Validar la acción
    const validation = (0, validators_1.validateAction)(state, action);
    if (!validation.valid) {
        return {
            success: false,
            error: validation.reason,
        };
    }
    // Clonar estado para modificación inmutable
    let newState = (0, state_factory_1.cloneGameState)(state);
    const events = [];
    try {
        // Aplicar acción según tipo
        switch (action.type) {
            case types_1.ActionType.MOVE_CHARACTER:
                newState = reduceMoveCharacter(newState, action, events);
                break;
            case types_1.ActionType.GATHER_RESOURCES:
                newState = reduceGatherResources(newState, action, events);
                break;
            case types_1.ActionType.BUILD_STRUCTURE:
                newState = reduceBuildStructure(newState, action, events);
                break;
            case types_1.ActionType.HEAL_WOUNDED:
                newState = reduceHealWounded(newState, action, events);
                break;
            case types_1.ActionType.TRANSFER_RESOURCES:
                newState = reduceTransferResources(newState, action, events);
                break;
            case types_1.ActionType.ATTACK_ALIEN:
                newState = reduceAttackAlien(newState, action, events);
                break;
            case types_1.ActionType.ALIEN_CONTROL_GHETTO:
                newState = reduceAlienControlGhetto(newState, action, events);
                break;
            case types_1.ActionType.ALIEN_BOMB:
                newState = reduceAlienBomb(newState, action, events);
                break;
            case types_1.ActionType.ADVANCE_PHASE:
                newState = reduceAdvancePhase(newState, action, events);
                break;
            case types_1.ActionType.END_TURN:
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
    }
    catch (error) {
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
function reduceMoveCharacter(state, action, events) {
    const character = state.characters.get(action.characterId);
    const newCharacter = {
        ...character,
        tileId: action.targetTileId,
        isUsed: true,
    };
    state.characters.set(action.characterId, newCharacter);
    events.push({
        type: 'CHARACTER_MOVED',
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
function reduceGatherResources(state, action, events) {
    const character = state.characters.get(action.characterId);
    const ghetto = state.ghettos.get(character.ghettoId);
    // Agregar recursos al guetto
    const newResources = (0, helpers_1.addInventories)(ghetto.resources, {
        [action.resourceType]: action.amount,
    });
    const newGhetto = {
        ...ghetto,
        resources: newResources,
    };
    // Marcar personaje como usado
    const newCharacter = {
        ...character,
        isUsed: true,
    };
    state.ghettos.set(ghetto.id, newGhetto);
    state.characters.set(character.id, newCharacter);
    events.push({
        type: 'RESOURCES_GATHERED',
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
function reduceBuildStructure(state, action, events) {
    const ghetto = state.ghettos.get(action.ghettoId);
    const cost = constants_1.BUILDING_COSTS[action.buildingType];
    // Restar recursos
    const newResources = (0, helpers_1.subtractInventories)(ghetto.resources, cost);
    // Agregar edificio
    const newGhetto = {
        ...ghetto,
        resources: newResources,
        buildings: [...ghetto.buildings, action.buildingType],
    };
    state.ghettos.set(ghetto.id, newGhetto);
    events.push({
        type: 'BUILDING_CONSTRUCTED',
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
function reduceHealWounded(state, action, events) {
    const ghetto = state.ghettos.get(action.ghettoId);
    // Curar heridos
    const newGhetto = {
        ...ghetto,
        wounded: ghetto.wounded - action.amount,
        population: ghetto.population + action.amount,
    };
    state.ghettos.set(ghetto.id, newGhetto);
    events.push({
        type: 'CHARACTER_MOVED', // Usar evento genérico
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
function reduceTransferResources(state, action, events) {
    const fromGhetto = state.ghettos.get(action.fromGhettoId);
    const toGhetto = state.ghettos.get(action.toGhettoId);
    // Restar del origen
    const newFromResources = (0, helpers_1.subtractInventories)(fromGhetto.resources, action.resources);
    // Sumar al destino
    const newToResources = (0, helpers_1.addInventories)(toGhetto.resources, action.resources);
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
function reduceAttackAlien(state, action, events) {
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
        type: 'ALIEN_ATTACKED',
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
function reduceAlienControlGhetto(state, action, events) {
    const ghetto = state.ghettos.get(action.ghettoId);
    const characters = Array.from(state.characters.values());
    const { ghetto: newGhetto, characters: newCharacters } = (0, game_rules_1.applyAlienControl)(ghetto, characters);
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
        type: 'GHETTO_CONTROLLED',
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
function reduceAlienBomb(state, action, events) {
    const tile = state.tiles.get(action.tileId);
    const newTile = {
        ...tile,
        destroyed: true,
    };
    state.tiles.set(action.tileId, newTile);
    events.push({
        type: 'CHARACTER_MOVED',
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
function reduceAdvancePhase(state, action, events) {
    const nextPhase = phase_machine_1.PhaseMachine.advance(state);
    // Si avanzamos de END_GAME_CHECK a PREPARATION, incrementar turno
    if (state.phase === 'END_GAME_CHECK' && nextPhase === 'PREPARATION') {
        state.turn += 1;
        // Aplicar mecánicas de inicio de turno
        const survivalResult = (0, game_rules_1.applySurvivalMechanics)(state);
        state.ghettos = survivalResult.ghettos;
        // Resetear personajes
        state.characters = (0, game_rules_1.resetCharactersForNewTurn)(state.characters);
    }
    state.phase = nextPhase;
    events.push({
        type: 'PHASE_CHANGED',
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
function reduceEndTurn(state, action, events) {
    // Verificar condiciones de final de partida
    const gameEnd = (0, game_rules_1.checkGameEnd)(state);
    if (gameEnd.isGameOver) {
        state.gameOver = true;
        state.victoryCondition = gameEnd.victoryCondition;
        state.winner = gameEnd.winner;
        events.push({
            type: gameEnd.winner === 'HUMAN' ? 'GAME_WON' : 'GAME_LOST',
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
//# sourceMappingURL=action-reducer.js.map