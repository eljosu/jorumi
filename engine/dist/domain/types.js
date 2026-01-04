"use strict";
/**
 * JORUMI Game Engine - Core Domain Types
 *
 * Tipos fundamentales del dominio del juego JORUMI.
 * Estos tipos son inmutables y serializables.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlienActionFace = exports.AlienAttackFace = exports.DiceType = exports.GhettoControlStatus = exports.VictoryCondition = exports.GamePhase = exports.BuildingType = exports.TileType = exports.ResourceType = exports.CharacterType = exports.PlayerRole = void 0;
// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================
/**
 * Rol del jugador en la partida
 * Manual: Los jugadores pueden ser Humanos o controlar al Alienígena
 */
var PlayerRole;
(function (PlayerRole) {
    PlayerRole["HUMAN"] = "HUMAN";
    PlayerRole["ALIEN"] = "ALIEN";
})(PlayerRole || (exports.PlayerRole = PlayerRole = {}));
/**
 * Tipos de personajes humanos
 * Manual: Cada personaje tiene habilidades específicas
 */
var CharacterType;
(function (CharacterType) {
    CharacterType["DOCTOR"] = "DOCTOR";
    CharacterType["SOLDIER"] = "SOLDIER";
    CharacterType["PEASANT"] = "PEASANT";
    CharacterType["CONSTRUCTOR"] = "CONSTRUCTOR";
    CharacterType["MINER"] = "MINER";
})(CharacterType || (exports.CharacterType = CharacterType = {}));
/**
 * Tipos de recursos del juego
 * Manual: Los humanos necesitan gestionar estos recursos para sobrevivir
 */
var ResourceType;
(function (ResourceType) {
    ResourceType["FOOD"] = "FOOD";
    ResourceType["MEDICINE"] = "MEDICINE";
    ResourceType["METAL"] = "METAL";
    ResourceType["MINERALS"] = "MINERALS";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
/**
 * Tipos de losetas del mapa
 * Manual: El mapa se construye con losetas durante la exploración
 */
var TileType;
(function (TileType) {
    TileType["GHETTO"] = "GHETTO";
    TileType["FOREST"] = "FOREST";
    TileType["MINE"] = "MINE";
    TileType["RUINS"] = "RUINS";
    TileType["ALIEN_SHIP"] = "ALIEN_SHIP";
    TileType["WASTELAND"] = "WASTELAND";
})(TileType || (exports.TileType = TileType = {}));
/**
 * Tipos de edificios que se pueden construir
 * Manual: Los constructores pueden edificar estructuras especiales
 */
var BuildingType;
(function (BuildingType) {
    BuildingType["BUNKER"] = "BUNKER";
    BuildingType["HOSPITAL"] = "HOSPITAL";
    BuildingType["WORKSHOP"] = "WORKSHOP";
    BuildingType["BEACON"] = "BEACON";
})(BuildingType || (exports.BuildingType = BuildingType = {}));
/**
 * Fases del turno de juego
 * Manual: El juego se estructura en 8 fases por turno
 */
var GamePhase;
(function (GamePhase) {
    GamePhase["PREPARATION"] = "PREPARATION";
    GamePhase["EXPLORATION"] = "EXPLORATION";
    GamePhase["MOVEMENT"] = "MOVEMENT";
    GamePhase["RESOURCE_GATHERING"] = "RESOURCE_GATHERING";
    GamePhase["TRADING"] = "TRADING";
    GamePhase["ALIEN_TURN"] = "ALIEN_TURN";
    GamePhase["ROLE_CHECK"] = "ROLE_CHECK";
    GamePhase["END_GAME_CHECK"] = "END_GAME_CHECK";
})(GamePhase || (exports.GamePhase = GamePhase = {}));
/**
 * Condiciones de victoria/derrota
 * Manual: Múltiples finales posibles
 */
var VictoryCondition;
(function (VictoryCondition) {
    VictoryCondition["MOTHERSHIP_DESTROYED"] = "MOTHERSHIP_DESTROYED";
    VictoryCondition["ESCAPE_SHIP"] = "ESCAPE_SHIP";
    VictoryCondition["BEACON_ACTIVATED"] = "BEACON_ACTIVATED";
    VictoryCondition["TOTAL_DEFEAT"] = "TOTAL_DEFEAT";
})(VictoryCondition || (exports.VictoryCondition = VictoryCondition = {}));
/**
 * Estado de control de un guetto
 * Manual: Los guettos pueden estar bajo control alienígena
 */
var GhettoControlStatus;
(function (GhettoControlStatus) {
    GhettoControlStatus["HUMAN"] = "HUMAN";
    GhettoControlStatus["ALIEN"] = "ALIEN";
    GhettoControlStatus["CONTESTED"] = "CONTESTED";
})(GhettoControlStatus || (exports.GhettoControlStatus = GhettoControlStatus = {}));
// ============================================================================
// TIPOS DE DADOS
// ============================================================================
/**
 * Tipos de dados usados en el juego
 * Manual: Distintos dados para diferentes mecánicas
 */
var DiceType;
(function (DiceType) {
    DiceType["ALIEN_ATTACK"] = "ALIEN_ATTACK";
    DiceType["ALIEN_ACTION"] = "ALIEN_ACTION";
    DiceType["HUMAN_D6"] = "HUMAN_D6";
    DiceType["HUMAN_2D3"] = "HUMAN_2D3";
    DiceType["COMBAT"] = "COMBAT";
})(DiceType || (exports.DiceType = DiceType = {}));
/**
 * Caras del dado de ataque alienígena
 */
var AlienAttackFace;
(function (AlienAttackFace) {
    AlienAttackFace["SHIELD"] = "SHIELD";
    AlienAttackFace["CONTROL"] = "CONTROL";
    AlienAttackFace["ATTACK"] = "ATTACK";
    AlienAttackFace["DOUBLE_ATTACK"] = "DOUBLE_ATTACK";
})(AlienAttackFace || (exports.AlienAttackFace = AlienAttackFace = {}));
/**
 * Caras del dado de acción alienígena
 */
var AlienActionFace;
(function (AlienActionFace) {
    AlienActionFace["MOVE"] = "MOVE";
    AlienActionFace["SCAN"] = "SCAN";
    AlienActionFace["BOMB"] = "BOMB";
    AlienActionFace["SPECIAL"] = "SPECIAL";
})(AlienActionFace || (exports.AlienActionFace = AlienActionFace = {}));
//# sourceMappingURL=types.js.map