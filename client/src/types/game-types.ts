/**
 * JORUMI Client - Game Types
 * 
 * Tipos básicos para el cliente
 * En producción, el cliente solo recibe estos tipos del servidor vía WebSocket
 * 
 * NOTA: Estos tipos están duplicados para evitar problemas de build con Vite
 * En el futuro, se pueden generar automáticamente desde el engine
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum PlayerRole {
  HUMAN = 'HUMAN',
  ALIEN = 'ALIEN',
}

export enum CharacterType {
  DOCTOR = 'DOCTOR',
  SOLDIER = 'SOLDIER',
  PEASANT = 'PEASANT',
  CONSTRUCTOR = 'CONSTRUCTOR',
  MINER = 'MINER',
}

export enum ResourceType {
  FOOD = 'FOOD',
  MEDICINE = 'MEDICINE',
  METAL = 'METAL',
  MINERALS = 'MINERALS',
}

export enum TileType {
  GHETTO = 'GHETTO',
  FOREST = 'FOREST',
  MINE = 'MINE',
  RUINS = 'RUINS',
  ALIEN_SHIP = 'ALIEN_SHIP',
  WASTELAND = 'WASTELAND',
}

export enum BuildingType {
  BUNKER = 'BUNKER',
  HOSPITAL = 'HOSPITAL',
  WORKSHOP = 'WORKSHOP',
  BEACON = 'BEACON',
}

export enum GamePhase {
  PREPARATION = 'PREPARATION',
  EXPLORATION = 'EXPLORATION',
  MOVEMENT = 'MOVEMENT',
  RESOURCE_GATHERING = 'RESOURCE_GATHERING',
  TRADING = 'TRADING',
  ALIEN_TURN = 'ALIEN_TURN',
  ROLE_CHECK = 'ROLE_CHECK',
  END_GAME_CHECK = 'END_GAME_CHECK',
}

export enum VictoryCondition {
  MOTHERSHIP_DESTROYED = 'MOTHERSHIP_DESTROYED',
  ESCAPE_SHIP = 'ESCAPE_SHIP',
  BEACON_ACTIVATED = 'BEACON_ACTIVATED',
  TOTAL_DEFEAT = 'TOTAL_DEFEAT',
}

export enum GhettoControlStatus {
  HUMAN = 'HUMAN',
  ALIEN = 'ALIEN',
  CONTESTED = 'CONTESTED',
}

export enum DiceType {
  ALIEN_ATTACK = 'ALIEN_ATTACK',
  ALIEN_ACTION = 'ALIEN_ACTION',
  HUMAN_D6 = 'HUMAN_D6',
  HUMAN_2D3 = 'HUMAN_2D3',
  COMBAT = 'COMBAT',
}

export enum AlienAttackFace {
  SHIELD = 'SHIELD',
  CONTROL = 'CONTROL',
  ATTACK = 'ATTACK',
  DOUBLE_ATTACK = 'DOUBLE_ATTACK',
}

export enum AlienActionFace {
  MOVE = 'MOVE',
  SCAN = 'SCAN',
  BOMB = 'BOMB',
  SPECIAL = 'SPECIAL',
}

export enum ActionType {
  START_GAME = 'START_GAME',
  END_TURN = 'END_TURN',
  ADVANCE_PHASE = 'ADVANCE_PHASE',
  PLACE_TILE = 'PLACE_TILE',
  MOVE_CHARACTER = 'MOVE_CHARACTER',
  MOVE_ALIEN = 'MOVE_ALIEN',
  GATHER_RESOURCES = 'GATHER_RESOURCES',
  CONSUME_FOOD = 'CONSUME_FOOD',
  BUILD_STRUCTURE = 'BUILD_STRUCTURE',
  HEAL_WOUNDED = 'HEAL_WOUNDED',
  TRANSFER_RESOURCES = 'TRANSFER_RESOURCES',
  CONVERT_RESOURCES = 'CONVERT_RESOURCES',
  ATTACK_ALIEN = 'ATTACK_ALIEN',
  ALIEN_ATTACK = 'ALIEN_ATTACK',
  ALIEN_CONTROL_GHETTO = 'ALIEN_CONTROL_GHETTO',
  ALIEN_BOMB = 'ALIEN_BOMB',
  ALIEN_SCAN = 'ALIEN_SCAN',
  CHANGE_ROLE = 'CHANGE_ROLE',
  ACTIVATE_BEACON = 'ACTIVATE_BEACON',
  ESCAPE_SHIP = 'ESCAPE_SHIP',
  END_GAME = 'END_GAME',
}

export enum GameEventType {
  GAME_STARTED = 'GAME_STARTED',
  TURN_STARTED = 'TURN_STARTED',
  PHASE_CHANGED = 'PHASE_CHANGED',
  CHARACTER_MOVED = 'CHARACTER_MOVED',
  RESOURCES_GATHERED = 'RESOURCES_GATHERED',
  BUILDING_CONSTRUCTED = 'BUILDING_CONSTRUCTED',
  COMBAT_OCCURRED = 'COMBAT_OCCURRED',
  ALIEN_ATTACKED = 'ALIEN_ATTACKED',
  GHETTO_CONTROLLED = 'GHETTO_CONTROLLED',
  TILE_DESTROYED = 'TILE_DESTROYED',
  CHARACTER_WOUNDED = 'CHARACTER_WOUNDED',
  CHARACTER_HEALED = 'CHARACTER_HEALED',
  GAME_WON = 'GAME_WON',
  GAME_LOST = 'GAME_LOST',
}

// ============================================================================
// TYPES
// ============================================================================

export type PlayerId = string;
export type CharacterId = string;
export type GhettoId = string;
export type TileId = string;

export interface HexCoordinates {
  q: number;
  r: number;
  s: number;
}

export interface ResourceInventory {
  [ResourceType.FOOD]: number;
  [ResourceType.MEDICINE]: number;
  [ResourceType.METAL]: number;
  [ResourceType.MINERALS]: number;
}

export interface Tile {
  id: TileId;
  type: TileType;
  coordinates: HexCoordinates;
  explored: boolean;
  destroyed: boolean;
  building?: BuildingType;
  resources?: Partial<ResourceInventory>;
}

export interface Character {
  id: CharacterId;
  type: CharacterType;
  name: string;
  ghettoId: GhettoId;
  tileId?: TileId;
  isWounded: boolean;
  isUsed: boolean;
  canAct: boolean;
}

export interface Ghetto {
  id: GhettoId;
  name: string;
  tileId: TileId;
  controlStatus: GhettoControlStatus;
  population: number;
  wounded: number;
  resources: ResourceInventory;
  buildings: BuildingType[];
  characters: CharacterId[];
}

export interface AlienState {
  shieldLevel: number;
  controlTokens: number;
  mothershipHealth: number;
  mothershipShield: number;
  currentTileId?: TileId;
  hasAuxiliaryShip: boolean;
}

export interface Player {
  id: PlayerId;
  name: string;
  role: PlayerRole;
}

export interface GameState {
  gameId: string;
  turn: number;
  phase: GamePhase;
  currentPlayerId: PlayerId;
  players: Player[];
  tiles: Map<TileId, Tile>;
  ghettos: Map<GhettoId, Ghetto>;
  characters: Map<CharacterId, Character>;
  alien: AlienState;
  actionsThisTurn: string[];
  gameOver: boolean;
  victoryCondition?: VictoryCondition;
  winner?: PlayerRole;
  rngSeed: number;
  rngState: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface DiceRollResult {
  diceType: DiceType;
  result: number | AlienAttackFace | AlienActionFace;
  timestamp: number;
}

export interface GameAction {
  type: ActionType;
  playerId: PlayerId;
  timestamp: number;
  [key: string]: any;
}

export interface ActionResult {
  success: boolean;
  newState?: GameState;
  events?: GameEvent[];
  error?: string;
}

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: any;
}

