/**
 * JORUMI Game Engine - Core Domain Types
 *
 * Tipos fundamentales del dominio del juego JORUMI.
 * Estos tipos son inmutables y serializables.
 */
export type PlayerId = string;
export type CharacterId = string;
export type GhettoId = string;
export type TileId = string;
/**
 * Rol del jugador en la partida
 * Manual: Los jugadores pueden ser Humanos o controlar al Alienígena
 */
export declare enum PlayerRole {
    HUMAN = "HUMAN",
    ALIEN = "ALIEN"
}
/**
 * Tipos de personajes humanos
 * Manual: Cada personaje tiene habilidades específicas
 */
export declare enum CharacterType {
    DOCTOR = "DOCTOR",// Cura humanos
    SOLDIER = "SOLDIER",// Combate
    PEASANT = "PEASANT",// Obtiene comida
    CONSTRUCTOR = "CONSTRUCTOR",// Construye edificios
    MINER = "MINER"
}
/**
 * Tipos de recursos del juego
 * Manual: Los humanos necesitan gestionar estos recursos para sobrevivir
 */
export declare enum ResourceType {
    FOOD = "FOOD",// Comida - necesaria para sobrevivir
    MEDICINE = "MEDICINE",// Medicina - cura heridos
    METAL = "METAL",// Metal - construcción
    MINERALS = "MINERALS"
}
/**
 * Tipos de losetas del mapa
 * Manual: El mapa se construye con losetas durante la exploración
 */
export declare enum TileType {
    GHETTO = "GHETTO",// Guetto - refugio de humanos
    FOREST = "FOREST",// Bosque - comida
    MINE = "MINE",// Mina - minerales y metal
    RUINS = "RUINS",// Ruinas - recursos variados
    ALIEN_SHIP = "ALIEN_SHIP",// Nave nodriza alienígena
    WASTELAND = "WASTELAND"
}
/**
 * Tipos de edificios que se pueden construir
 * Manual: Los constructores pueden edificar estructuras especiales
 */
export declare enum BuildingType {
    BUNKER = "BUNKER",// Defensa contra alienígena
    HOSPITAL = "HOSPITAL",// Cura heridos más rápido
    WORKSHOP = "WORKSHOP",// Convierte recursos
    BEACON = "BEACON"
}
/**
 * Fases del turno de juego
 * Manual: El juego se estructura en 8 fases por turno
 */
export declare enum GamePhase {
    PREPARATION = "PREPARATION",// 1. Preparación inicial
    EXPLORATION = "EXPLORATION",// 2. Exploración y colocación de losetas
    MOVEMENT = "MOVEMENT",// 3. Movimiento de personajes
    RESOURCE_GATHERING = "RESOURCE_GATHERING",// 4. Obtención de recursos
    TRADING = "TRADING",// 5. Intercambio y conversiones
    ALIEN_TURN = "ALIEN_TURN",// 6. Turno del alienígena
    ROLE_CHECK = "ROLE_CHECK",// 7. Comprobación de cambio de rol
    END_GAME_CHECK = "END_GAME_CHECK"
}
/**
 * Condiciones de victoria/derrota
 * Manual: Múltiples finales posibles
 */
export declare enum VictoryCondition {
    MOTHERSHIP_DESTROYED = "MOTHERSHIP_DESTROYED",// Destruir nave nodriza
    ESCAPE_SHIP = "ESCAPE_SHIP",// Escapar en nave auxiliar
    BEACON_ACTIVATED = "BEACON_ACTIVATED",// Activar baliza de rescate
    TOTAL_DEFEAT = "TOTAL_DEFEAT"
}
/**
 * Estado de control de un guetto
 * Manual: Los guettos pueden estar bajo control alienígena
 */
export declare enum GhettoControlStatus {
    HUMAN = "HUMAN",
    ALIEN = "ALIEN",
    CONTESTED = "CONTESTED"
}
/**
 * Tipos de dados usados en el juego
 * Manual: Distintos dados para diferentes mecánicas
 */
export declare enum DiceType {
    ALIEN_ATTACK = "ALIEN_ATTACK",// Dado de ataque alienígena
    ALIEN_ACTION = "ALIEN_ACTION",// Dado de acción alienígena
    HUMAN_D6 = "HUMAN_D6",// Dado estándar 1d6
    HUMAN_2D3 = "HUMAN_2D3",// Dos dados de 3 caras
    COMBAT = "COMBAT"
}
/**
 * Caras del dado de ataque alienígena
 */
export declare enum AlienAttackFace {
    SHIELD = "SHIELD",// Refuerza escudo
    CONTROL = "CONTROL",// Toma control de guetto
    ATTACK = "ATTACK",// Ataque directo
    DOUBLE_ATTACK = "DOUBLE_ATTACK"
}
/**
 * Caras del dado de acción alienígena
 */
export declare enum AlienActionFace {
    MOVE = "MOVE",// Movimiento
    SCAN = "SCAN",// Escaneo
    BOMB = "BOMB",// Bomba - destruye loseta
    SPECIAL = "SPECIAL"
}
/**
 * Inventario de recursos
 */
export interface ResourceInventory {
    [ResourceType.FOOD]: number;
    [ResourceType.MEDICINE]: number;
    [ResourceType.METAL]: number;
    [ResourceType.MINERALS]: number;
}
/**
 * Coordenadas en el mapa hexagonal
 */
export interface HexCoordinates {
    q: number;
    r: number;
    s: number;
}
/**
 * Loseta del mapa
 * Manual: El mapa se construye dinámicamente durante la exploración
 */
export interface Tile {
    id: TileId;
    type: TileType;
    coordinates: HexCoordinates;
    explored: boolean;
    destroyed: boolean;
    building?: BuildingType;
    resources?: Partial<ResourceInventory>;
}
/**
 * Personaje humano
 * Manual: Cada personaje tiene habilidades y estado específicos
 */
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
/**
 * Guetto - refugio de humanos
 * Manual: Los guettos son el hogar de los humanos y pueden ser controlados
 */
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
/**
 * Estado del alienígena
 * Manual: El alienígena tiene escudo, capacidad de control y su nave
 */
export interface AlienState {
    shieldLevel: number;
    controlTokens: number;
    mothershipHealth: number;
    mothershipShield: number;
    currentTileId?: TileId;
    hasAuxiliaryShip: boolean;
}
/**
 * Jugador
 */
export interface Player {
    id: PlayerId;
    name: string;
    role: PlayerRole;
}
/**
 * Estado completo del juego
 * Este es el único objeto de estado que se modifica (inmutablemente)
 */
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
/**
 * Resultado de una tirada de dados
 */
export interface DiceRollResult {
    diceType: DiceType;
    result: number | AlienAttackFace | AlienActionFace;
    timestamp: number;
}
/**
 * Conversión de recursos
 * Manual: Los recursos pueden convertirse en edificios o intercambiarse
 */
export interface ResourceConversion {
    input: Partial<ResourceInventory>;
    output: Partial<ResourceInventory> | BuildingType;
}
/**
 * Resultado de validación de acción
 */
export interface ValidationResult {
    valid: boolean;
    reason?: string;
}
//# sourceMappingURL=types.d.ts.map