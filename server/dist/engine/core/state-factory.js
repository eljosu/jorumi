"use strict";
/**
 * JORUMI Game Engine - State Factory
 *
 * Factory para crear estados iniciales del juego
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialGameState = createInitialGameState;
exports.cloneGameState = cloneGameState;
exports.serializeGameState = serializeGameState;
exports.deserializeGameState = deserializeGameState;
const types_1 = require("../domain/types");
const constants_1 = require("../domain/constants");
const helpers_1 = require("../utils/helpers");
const hex_1 = require("../utils/hex");
/**
 * Crea el estado inicial del alienígena
 * Manual: Configuración inicial del antagonista
 */
function createInitialAlienState() {
    return {
        shieldLevel: constants_1.INITIAL_CONFIG.ALIEN_INITIAL_SHIELD,
        controlTokens: constants_1.INITIAL_CONFIG.ALIEN_INITIAL_CONTROL_TOKENS,
        mothershipHealth: constants_1.INITIAL_CONFIG.MOTHERSHIP_INITIAL_HEALTH,
        mothershipShield: constants_1.INITIAL_CONFIG.MOTHERSHIP_INITIAL_SHIELD,
        currentTileId: undefined,
        hasAuxiliaryShip: true,
    };
}
/**
 * Crea un guetto inicial
 * Manual: Los humanos empiezan en guettos con población y recursos
 */
function createInitialGhetto(index, tileId) {
    return {
        id: (0, helpers_1.generateId)('ghetto'),
        name: `Ghetto ${index + 1}`,
        tileId,
        controlStatus: types_1.GhettoControlStatus.HUMAN,
        population: constants_1.INITIAL_CONFIG.STARTING_POPULATION_PER_GHETTO,
        wounded: 0,
        resources: (0, helpers_1.cloneInventory)(constants_1.INITIAL_CONFIG.INITIAL_RESOURCES),
        buildings: [],
        characters: [],
    };
}
/**
 * Crea un personaje inicial
 * Manual: Cada tipo de personaje comienza en un guetto
 */
function createInitialCharacter(type, index, ghettoId) {
    const typeNames = {
        [types_1.CharacterType.DOCTOR]: 'Doctor',
        [types_1.CharacterType.SOLDIER]: 'Soldier',
        [types_1.CharacterType.PEASANT]: 'Peasant',
        [types_1.CharacterType.CONSTRUCTOR]: 'Constructor',
        [types_1.CharacterType.MINER]: 'Miner',
    };
    return {
        id: (0, helpers_1.generateId)('character'),
        type,
        name: `${typeNames[type]} ${index + 1}`,
        ghettoId,
        tileId: undefined,
        isWounded: false,
        isUsed: false,
        canAct: true,
    };
}
/**
 * Crea una loseta inicial
 */
function createInitialTile(type, q, r) {
    return {
        id: (0, helpers_1.generateId)('tile'),
        type,
        coordinates: (0, hex_1.createHexCoordinate)(q, r),
        explored: true,
        destroyed: false,
        building: undefined,
        resources: type === types_1.TileType.GHETTO ? undefined : (0, helpers_1.createEmptyInventory)(),
    };
}
/**
 * Crea jugadores iniciales
 */
function createPlayers(playerNames) {
    return playerNames.map((name, index) => ({
        id: (0, helpers_1.generateId)('player'),
        name,
        role: index === 0 ? types_1.PlayerRole.HUMAN : types_1.PlayerRole.ALIEN,
    }));
}
/**
 * Factory principal: crea el estado inicial completo del juego
 * Manual: Configuración inicial según las reglas oficiales
 */
function createInitialGameState(config) {
    const gameId = (0, helpers_1.generateId)('game');
    const seed = config.seed ?? Date.now();
    // Crear jugadores
    const players = createPlayers(config.playerNames);
    // Crear mapa inicial con losetas de guettos
    const tiles = new Map();
    const ghettoTile1 = createInitialTile(types_1.TileType.GHETTO, 0, 0);
    const ghettoTile2 = createInitialTile(types_1.TileType.GHETTO, 2, 0);
    tiles.set(ghettoTile1.id, ghettoTile1);
    tiles.set(ghettoTile2.id, ghettoTile2);
    // Crear guettos iniciales
    const ghettos = new Map();
    const ghetto1 = createInitialGhetto(0, ghettoTile1.id);
    const ghetto2 = createInitialGhetto(1, ghettoTile2.id);
    ghettos.set(ghetto1.id, ghetto1);
    ghettos.set(ghetto2.id, ghetto2);
    // Crear personajes iniciales (uno de cada tipo en cada guetto)
    const characters = new Map();
    const characterTypes = Object.values(types_1.CharacterType);
    // Distribuir personajes entre guettos
    characterTypes.forEach((type, index) => {
        const ghettoId = index % 2 === 0 ? ghetto1.id : ghetto2.id;
        const character = createInitialCharacter(type, 1, ghettoId);
        characters.set(character.id, character);
        // Agregar personaje al guetto
        const ghetto = ghettos.get(ghettoId);
        ghetto.characters.push(character.id);
    });
    // Crear estado alienígena
    const alien = createInitialAlienState();
    // Crear nave nodriza en posición lejana
    const mothershipTile = createInitialTile(types_1.TileType.ALIEN_SHIP, -3, 3);
    tiles.set(mothershipTile.id, mothershipTile);
    alien.currentTileId = mothershipTile.id;
    // Construir estado inicial completo
    const initialState = {
        gameId,
        turn: 1,
        phase: types_1.GamePhase.PREPARATION,
        currentPlayerId: players[0].id,
        players,
        tiles,
        ghettos,
        characters,
        alien,
        actionsThisTurn: [],
        gameOver: false,
        victoryCondition: undefined,
        winner: undefined,
        rngSeed: seed,
        rngState: seed,
    };
    // Aplicar configuración personalizada si existe
    if (config.customInitialState) {
        return {
            ...initialState,
            ...config.customInitialState,
        };
    }
    return initialState;
}
/**
 * Clona completamente un estado de juego (deep clone)
 */
function cloneGameState(state) {
    return {
        ...state,
        players: [...state.players],
        tiles: new Map(state.tiles),
        ghettos: new Map(state.ghettos),
        characters: new Map(state.characters),
        alien: { ...state.alien },
        actionsThisTurn: [...state.actionsThisTurn],
    };
}
/**
 * Serializa un estado de juego a JSON
 */
function serializeGameState(state) {
    const serializable = {
        ...state,
        tiles: Array.from(state.tiles.entries()),
        ghettos: Array.from(state.ghettos.entries()),
        characters: Array.from(state.characters.entries()),
    };
    return JSON.stringify(serializable, null, 2);
}
/**
 * Deserializa un estado de juego desde JSON
 */
function deserializeGameState(json) {
    const parsed = JSON.parse(json);
    return {
        ...parsed,
        tiles: new Map(parsed.tiles),
        ghettos: new Map(parsed.ghettos),
        characters: new Map(parsed.characters),
    };
}
//# sourceMappingURL=state-factory.js.map