/**
 * JORUMI Game Engine - Action Types
 * 
 * Definición de todas las acciones posibles en el juego
 * Todas las modificaciones de estado se realizan mediante acciones
 */

import {
  PlayerId,
  CharacterId,
  GhettoId,
  TileId,
  HexCoordinates,
  TileType,
  BuildingType,
  ResourceType,
  CharacterType,
  GamePhase,
} from '../domain/types';

// ============================================================================
// TIPOS BASE DE ACCIONES
// ============================================================================

export enum ActionType {
  // Gestión de partida
  START_GAME = 'START_GAME',
  END_TURN = 'END_TURN',
  ADVANCE_PHASE = 'ADVANCE_PHASE',
  
  // Exploración (Fase 2)
  EXPLORE_TILE = 'EXPLORE_TILE',
  PLACE_TILE = 'PLACE_TILE',
  
  // Movimiento (Fase 3)
  MOVE_CHARACTER = 'MOVE_CHARACTER',
  MOVE_ALIEN = 'MOVE_ALIEN',
  
  // Recursos (Fase 4)
  GATHER_RESOURCES = 'GATHER_RESOURCES',
  CONSUME_FOOD = 'CONSUME_FOOD',
  
  // Construcción
  BUILD_STRUCTURE = 'BUILD_STRUCTURE',
  
  // Curación
  HEAL_WOUNDED = 'HEAL_WOUNDED',
  
  // Intercambio (Fase 5)
  TRANSFER_RESOURCES = 'TRANSFER_RESOURCES',
  CONVERT_RESOURCES = 'CONVERT_RESOURCES',
  
  // Combate
  ATTACK_ALIEN = 'ATTACK_ALIEN',
  ATTACK_MOTHERSHIP = 'ATTACK_MOTHERSHIP',
  DEFEND = 'DEFEND',
  
  // Turno alienígena (Fase 6)
  ALIEN_ATTACK = 'ALIEN_ATTACK',
  ALIEN_CONTROL_GHETTO = 'ALIEN_CONTROL_GHETTO',
  ALIEN_BOMB = 'ALIEN_BOMB',
  ALIEN_SCAN = 'ALIEN_SCAN',
  
  // Cambio de rol (Fase 7)
  CHANGE_ROLE = 'CHANGE_ROLE',
  
  // Victoria
  ACTIVATE_BEACON = 'ACTIVATE_BEACON',
  ESCAPE_SHIP = 'ESCAPE_SHIP',
  END_GAME = 'END_GAME',
}

/**
 * Interfaz base para todas las acciones
 */
export interface BaseAction {
  type: ActionType;
  playerId: PlayerId;
  timestamp: number;
}

// ============================================================================
// ACCIONES ESPECÍFICAS
// ============================================================================

/**
 * Iniciar partida
 */
export interface StartGameAction extends BaseAction {
  type: ActionType.START_GAME;
  playerNames: string[];
  seed?: number;
}

/**
 * Finalizar turno
 */
export interface EndTurnAction extends BaseAction {
  type: ActionType.END_TURN;
}

/**
 * Avanzar a siguiente fase
 */
export interface AdvancePhaseAction extends BaseAction {
  type: ActionType.ADVANCE_PHASE;
  nextPhase: GamePhase;
}

/**
 * Explorar nueva loseta
 * Manual: Fase 2 - Los jugadores exploran el mapa
 */
export interface ExploreTileAction extends BaseAction {
  type: ActionType.EXPLORE_TILE;
  tileType: TileType;
  coordinates: HexCoordinates;
}

/**
 * Colocar loseta en el mapa
 */
export interface PlaceTileAction extends BaseAction {
  type: ActionType.PLACE_TILE;
  tileId: TileId;
  coordinates: HexCoordinates;
}

/**
 * Mover personaje
 * Manual: Fase 3 - Los personajes se mueven por el mapa
 */
export interface MoveCharacterAction extends BaseAction {
  type: ActionType.MOVE_CHARACTER;
  characterId: CharacterId;
  targetTileId: TileId;
}

/**
 * Mover alienígena
 * Manual: Fase 6 - El alienígena se mueve por el mapa
 */
export interface MoveAlienAction extends BaseAction {
  type: ActionType.MOVE_ALIEN;
  targetTileId: TileId;
}

/**
 * Recolectar recursos
 * Manual: Fase 4 - Los personajes obtienen recursos
 */
export interface GatherResourcesAction extends BaseAction {
  type: ActionType.GATHER_RESOURCES;
  characterId: CharacterId;
  resourceType: ResourceType;
  amount: number;
}

/**
 * Consumir comida
 * Manual: Los humanos consumen comida cada turno
 */
export interface ConsumeFoodAction extends BaseAction {
  type: ActionType.CONSUME_FOOD;
  ghettoId: GhettoId;
  amount: number;
}

/**
 * Construir estructura
 * Manual: Los constructores pueden edificar
 */
export interface BuildStructureAction extends BaseAction {
  type: ActionType.BUILD_STRUCTURE;
  characterId: CharacterId;
  ghettoId: GhettoId;
  buildingType: BuildingType;
}

/**
 * Curar heridos
 * Manual: Los doctores curan humanos heridos
 */
export interface HealWoundedAction extends BaseAction {
  type: ActionType.HEAL_WOUNDED;
  characterId: CharacterId;
  ghettoId: GhettoId;
  amount: number;
}

/**
 * Transferir recursos entre guettos
 * Manual: Fase 5 - Intercambio de recursos
 */
export interface TransferResourcesAction extends BaseAction {
  type: ActionType.TRANSFER_RESOURCES;
  fromGhettoId: GhettoId;
  toGhettoId: GhettoId;
  resources: Partial<ResourceInventory>;
}

/**
 * Convertir recursos (en taller)
 * Manual: Fase 5 - Conversión en workshop
 */
export interface ConvertResourcesAction extends BaseAction {
  type: ActionType.CONVERT_RESOURCES;
  ghettoId: GhettoId;
  inputResources: Partial<ResourceInventory>;
  outputResources: Partial<ResourceInventory>;
}

/**
 * Atacar al alienígena
 * Manual: Los soldados pueden atacar
 */
export interface AttackAlienAction extends BaseAction {
  type: ActionType.ATTACK_ALIEN;
  characterId: CharacterId;
  damage: number;
}

/**
 * Atacar nave nodriza
 * Manual: Condición de victoria - destruir la nave
 */
export interface AttackMothershipAction extends BaseAction {
  type: ActionType.ATTACK_MOTHERSHIP;
  characterId: CharacterId;
  damage: number;
}

/**
 * Defender posición
 */
export interface DefendAction extends BaseAction {
  type: ActionType.DEFEND;
  characterId: CharacterId;
  tileId: TileId;
}

/**
 * Ataque alienígena
 * Manual: Fase 6 - El alienígena ataca
 */
export interface AlienAttackAction extends BaseAction {
  type: ActionType.ALIEN_ATTACK;
  targetGhettoId: GhettoId;
  damage: number;
}

/**
 * Control alienígena de guetto
 * Manual: El alienígena puede tomar control
 */
export interface AlienControlGhettoAction extends BaseAction {
  type: ActionType.ALIEN_CONTROL_GHETTO;
  ghettoId: GhettoId;
}

/**
 * Bomba alienígena
 * Manual: Destruye una loseta
 */
export interface AlienBombAction extends BaseAction {
  type: ActionType.ALIEN_BOMB;
  tileId: TileId;
}

/**
 * Escaneo alienígena
 * Manual: El alienígena escanea el mapa
 */
export interface AlienScanAction extends BaseAction {
  type: ActionType.ALIEN_SCAN;
  targetTileId: TileId;
}

/**
 * Cambio de rol
 * Manual: Fase 7 - El jugador puede cambiar de rol
 */
export interface ChangeRoleAction extends BaseAction {
  type: ActionType.CHANGE_ROLE;
  newRole: PlayerRole;
}

/**
 * Activar baliza
 * Manual: Condición de victoria - activar señal
 */
export interface ActivateBeaconAction extends BaseAction {
  type: ActionType.ACTIVATE_BEACON;
  ghettoId: GhettoId;
}

/**
 * Escapar en nave
 * Manual: Condición de victoria - escapar
 */
export interface EscapeShipAction extends BaseAction {
  type: ActionType.ESCAPE_SHIP;
  characterIds: CharacterId[];
}

/**
 * Finalizar partida
 */
export interface EndGameAction extends BaseAction {
  type: ActionType.END_GAME;
  victoryCondition: VictoryCondition;
  winner: PlayerRole;
}

// ============================================================================
// TIPO UNIÓN DE TODAS LAS ACCIONES
// ============================================================================

export type GameAction =
  | StartGameAction
  | EndTurnAction
  | AdvancePhaseAction
  | ExploreTileAction
  | PlaceTileAction
  | MoveCharacterAction
  | MoveAlienAction
  | GatherResourcesAction
  | ConsumeFoodAction
  | BuildStructureAction
  | HealWoundedAction
  | TransferResourcesAction
  | ConvertResourcesAction
  | AttackAlienAction
  | AttackMothershipAction
  | DefendAction
  | AlienAttackAction
  | AlienControlGhettoAction
  | AlienBombAction
  | AlienScanAction
  | ChangeRoleAction
  | ActivateBeaconAction
  | EscapeShipAction
  | EndGameAction;

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

import { ResourceInventory, PlayerRole, VictoryCondition } from '../domain/types';

/**
 * Resultado de aplicar una acción
 */
export interface ActionResult {
  success: boolean;
  newState?: any; // GameState (evitar dependencia circular)
  error?: string;
  events?: GameEvent[];
}

/**
 * Eventos del juego (para logging y UI)
 */
export enum GameEventType {
  CHARACTER_MOVED = 'CHARACTER_MOVED',
  RESOURCES_GATHERED = 'RESOURCES_GATHERED',
  BUILDING_CONSTRUCTED = 'BUILDING_CONSTRUCTED',
  ALIEN_ATTACKED = 'ALIEN_ATTACKED',
  GHETTO_CONTROLLED = 'GHETTO_CONTROLLED',
  HUMANS_DIED = 'HUMANS_DIED',
  PHASE_CHANGED = 'PHASE_CHANGED',
  GAME_WON = 'GAME_WON',
  GAME_LOST = 'GAME_LOST',
}

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: any;
}


