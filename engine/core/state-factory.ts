/**
 * JORUMI Game Engine - State Factory
 * 
 * Factory para crear estados iniciales del juego
 */

import {
  GameState,
  Player,
  PlayerRole,
  GamePhase,
  Ghetto,
  Character,
  Tile,
  AlienState,
  CharacterType,
  TileType,
  GhettoControlStatus,
  BuildingType,
} from '../domain/types';
import { INITIAL_CONFIG } from '../domain/constants';
import { createEmptyInventory, generateId, cloneInventory } from '../utils/helpers';
import { createHexCoordinate } from '../utils/hex';

/**
 * Configuración para crear una nueva partida
 */
export interface GameConfig {
  playerNames: string[];
  seed?: number;
  customInitialState?: Partial<GameState>;
}

/**
 * Crea el estado inicial del alienígena
 * Manual: Configuración inicial del antagonista
 */
function createInitialAlienState(): AlienState {
  return {
    shieldLevel: INITIAL_CONFIG.ALIEN_INITIAL_SHIELD,
    controlTokens: INITIAL_CONFIG.ALIEN_INITIAL_CONTROL_TOKENS,
    mothershipHealth: INITIAL_CONFIG.MOTHERSHIP_INITIAL_HEALTH,
    mothershipShield: INITIAL_CONFIG.MOTHERSHIP_INITIAL_SHIELD,
    currentTileId: undefined,
    hasAuxiliaryShip: true,
  };
}

/**
 * Crea un guetto inicial
 * Manual: Los humanos empiezan en guettos con población y recursos
 */
function createInitialGhetto(index: number, tileId: string): Ghetto {
  return {
    id: generateId('ghetto'),
    name: `Ghetto ${index + 1}`,
    tileId,
    controlStatus: GhettoControlStatus.HUMAN,
    population: INITIAL_CONFIG.STARTING_POPULATION_PER_GHETTO,
    wounded: 0,
    resources: cloneInventory(INITIAL_CONFIG.INITIAL_RESOURCES),
    buildings: [],
    characters: [],
  };
}

/**
 * Crea un personaje inicial
 * Manual: Cada tipo de personaje comienza en un guetto
 */
function createInitialCharacter(
  type: CharacterType,
  index: number,
  ghettoId: string
): Character {
  const typeNames = {
    [CharacterType.DOCTOR]: 'Doctor',
    [CharacterType.SOLDIER]: 'Soldier',
    [CharacterType.PEASANT]: 'Peasant',
    [CharacterType.CONSTRUCTOR]: 'Constructor',
    [CharacterType.MINER]: 'Miner',
  };
  
  return {
    id: generateId('character'),
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
function createInitialTile(
  type: TileType,
  q: number,
  r: number
): Tile {
  return {
    id: generateId('tile'),
    type,
    coordinates: createHexCoordinate(q, r),
    explored: true,
    destroyed: false,
    building: undefined,
    resources: type === TileType.GHETTO ? undefined : createEmptyInventory(),
  };
}

/**
 * Crea jugadores iniciales
 */
function createPlayers(playerNames: string[]): Player[] {
  return playerNames.map((name, index) => ({
    id: generateId('player'),
    name,
    role: index === 0 ? PlayerRole.HUMAN : PlayerRole.ALIEN,
  }));
}

/**
 * Factory principal: crea el estado inicial completo del juego
 * Manual: Configuración inicial según las reglas oficiales
 */
export function createInitialGameState(config: GameConfig): GameState {
  const gameId = generateId('game');
  const seed = config.seed ?? Date.now();
  
  // Crear jugadores
  const players = createPlayers(config.playerNames);
  
  // Crear mapa inicial con losetas de guettos
  const tiles = new Map<string, Tile>();
  const ghettoTile1 = createInitialTile(TileType.GHETTO, 0, 0);
  const ghettoTile2 = createInitialTile(TileType.GHETTO, 2, 0);
  tiles.set(ghettoTile1.id, ghettoTile1);
  tiles.set(ghettoTile2.id, ghettoTile2);
  
  // Crear guettos iniciales
  const ghettos = new Map<string, Ghetto>();
  const ghetto1 = createInitialGhetto(0, ghettoTile1.id);
  const ghetto2 = createInitialGhetto(1, ghettoTile2.id);
  ghettos.set(ghetto1.id, ghetto1);
  ghettos.set(ghetto2.id, ghetto2);
  
  // Crear personajes iniciales (uno de cada tipo en cada guetto)
  const characters = new Map<string, Character>();
  const characterTypes = Object.values(CharacterType);
  
  // Distribuir personajes entre guettos
  characterTypes.forEach((type, index) => {
    const ghettoId = index % 2 === 0 ? ghetto1.id : ghetto2.id;
    const character = createInitialCharacter(type, 1, ghettoId);
    characters.set(character.id, character);
    
    // Agregar personaje al guetto
    const ghetto = ghettos.get(ghettoId)!;
    ghetto.characters.push(character.id);
  });
  
  // Crear estado alienígena
  const alien = createInitialAlienState();
  
  // Crear nave nodriza en posición lejana
  const mothershipTile = createInitialTile(TileType.ALIEN_SHIP, -3, 3);
  tiles.set(mothershipTile.id, mothershipTile);
  alien.currentTileId = mothershipTile.id;
  
  // Construir estado inicial completo
  const initialState: GameState = {
    gameId,
    turn: 1,
    phase: GamePhase.PREPARATION,
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
export function cloneGameState(state: GameState): GameState {
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
export function serializeGameState(state: GameState): string {
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
export function deserializeGameState(json: string): GameState {
  const parsed = JSON.parse(json);
  return {
    ...parsed,
    tiles: new Map(parsed.tiles),
    ghettos: new Map(parsed.ghettos),
    characters: new Map(parsed.characters),
  };
}


