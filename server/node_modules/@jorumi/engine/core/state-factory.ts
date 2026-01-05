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
 * Crea un guetto inicial (New York barrios)
 * Manual: Los humanos empiezan en guettos con población y recursos
 */
function createInitialGhetto(index: number, tileId: string, name?: string): Ghetto {
  const ghettoNames = ['Manhattan', 'Bronx', 'Queens', 'Long Island'];
  return {
    id: generateId('ghetto'),
    name: name || ghettoNames[index] || `Ghetto ${index + 1}`,
    tileId,
    controlStatus: GhettoControlStatus.HUMAN,
    population: 8, // Reducido por la invasión (de 10 a 8)
    wounded: 2, // Algunos heridos iniciales
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
 * NEW YORK POST-INVASION: 4 ghettos + Liberty Island
 */
export function createInitialGameState(config: GameConfig): GameState {
  const gameId = generateId('game');
  const seed = config.seed ?? Date.now();
  
  // Crear jugadores
  const players = createPlayers(config.playerNames);
  
  // Crear mapa inicial - NEW YORK POST-INVASION
  const tiles = new Map<string, Tile>();
  const ghettos = new Map<string, Ghetto>();
  
  // ============================================================================
  // 4 GHETTOS: Manhattan, Bronx, Queens, Long Island (50% completos)
  // ============================================================================
  
  const ghettoPositions = [
    // Manhattan (suroeste)
    { q: -4, r: 2, name: 'Manhattan' },
    // Bronx (noroeste)
    { q: -4, r: -2, name: 'Bronx' },
    // Queens (noreste)
    { q: 4, r: -2, name: 'Queens' },
    // Long Island (sureste)
    { q: 4, r: 2, name: 'Long Island' },
  ];
  
  ghettoPositions.forEach((pos, index) => {
    // Loseta central del ghetto (en ruinas)
    const centralTile = createInitialTile(TileType.RUINS, pos.q, pos.r);
    tiles.set(centralTile.id, centralTile);
    
    // Crear ghetto
    const ghetto = createInitialGhetto(index, centralTile.id, pos.name);
    ghettos.set(ghetto.id, ghetto);
    
    // Crear 50% de losetas adyacentes (en ruinas)
    const adjacentOffsets = [
      { q: 1, r: 0 },   // Este
      { q: 0, r: 1 },   // Sureste
      { q: -1, r: 1 },  // Suroeste
    ];
    
    adjacentOffsets.forEach(offset => {
      const adjTile = createInitialTile(TileType.RUINS, pos.q + offset.q, pos.r + offset.r);
      tiles.set(adjTile.id, adjTile);
    });
  });
  
  // ============================================================================
  // ISLA DE LA ESTATUA DE LA LIBERTAD (centro)
  // ============================================================================
  
  // Base de la isla (parcialmente completa)
  const libertyIslandBase = createInitialTile(TileType.LIBERTY_ISLAND, 0, 0);
  tiles.set(libertyIslandBase.id, libertyIslandBase);
  
  // Losetas adyacentes (mar alrededor)
  const libertyAdjacentOffsets = [
    { q: 1, r: 0 },
    { q: 0, r: 1 },
    { q: -1, r: 1 },
  ];
  
  libertyAdjacentOffsets.forEach(offset => {
    const seaTile = createInitialTile(TileType.SEA, offset.q, offset.r);
    tiles.set(seaTile.id, seaTile);
  });
  
  // Espacio para 3 losetas especiales (aún no colocadas)
  // - 2 partes de nave espacial
  // - 1 baliza de rescate
  // Se colocarán durante el juego en posiciones específicas:
  // { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
  
  // ============================================================================
  // PERSONAJES INICIALES (distribuidos entre ghettos)
  // ============================================================================
  
  const characters = new Map<string, Character>();
  const characterTypes = Object.values(CharacterType);
  const ghettoList = Array.from(ghettos.values());
  
  // Distribuir personajes entre los 4 ghettos
  characterTypes.forEach((type, index) => {
    const targetGhetto = ghettoList[index % 4];
    const character = createInitialCharacter(type, 1, targetGhetto.id);
    characters.set(character.id, character);
    targetGhetto.characters.push(character.id);
  });
  
  // ============================================================================
  // ESTADO ALIENÍGENA
  // ============================================================================
  
  const alien = createInitialAlienState();
  
  // Nave nodriza en posición lejana (fuera del mapa inicial)
  const mothershipTile = createInitialTile(TileType.ALIEN_SHIP, -8, 4);
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



