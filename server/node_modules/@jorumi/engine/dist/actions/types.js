"use strict";
/**
 * JORUMI Game Engine - Action Types
 *
 * Definición de todas las acciones posibles en el juego
 * Todas las modificaciones de estado se realizan mediante acciones
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEventType = exports.ActionType = void 0;
// ============================================================================
// TIPOS BASE DE ACCIONES
// ============================================================================
var ActionType;
(function (ActionType) {
    // Gestión de partida
    ActionType["START_GAME"] = "START_GAME";
    ActionType["END_TURN"] = "END_TURN";
    ActionType["ADVANCE_PHASE"] = "ADVANCE_PHASE";
    // Exploración (Fase 2)
    ActionType["EXPLORE_TILE"] = "EXPLORE_TILE";
    ActionType["PLACE_TILE"] = "PLACE_TILE";
    // Movimiento (Fase 3)
    ActionType["MOVE_CHARACTER"] = "MOVE_CHARACTER";
    ActionType["MOVE_ALIEN"] = "MOVE_ALIEN";
    // Recursos (Fase 4)
    ActionType["GATHER_RESOURCES"] = "GATHER_RESOURCES";
    ActionType["CONSUME_FOOD"] = "CONSUME_FOOD";
    // Construcción
    ActionType["BUILD_STRUCTURE"] = "BUILD_STRUCTURE";
    // Curación
    ActionType["HEAL_WOUNDED"] = "HEAL_WOUNDED";
    // Intercambio (Fase 5)
    ActionType["TRANSFER_RESOURCES"] = "TRANSFER_RESOURCES";
    ActionType["CONVERT_RESOURCES"] = "CONVERT_RESOURCES";
    // Combate
    ActionType["ATTACK_ALIEN"] = "ATTACK_ALIEN";
    ActionType["ATTACK_MOTHERSHIP"] = "ATTACK_MOTHERSHIP";
    ActionType["DEFEND"] = "DEFEND";
    // Turno alienígena (Fase 6)
    ActionType["ALIEN_ATTACK"] = "ALIEN_ATTACK";
    ActionType["ALIEN_CONTROL_GHETTO"] = "ALIEN_CONTROL_GHETTO";
    ActionType["ALIEN_BOMB"] = "ALIEN_BOMB";
    ActionType["ALIEN_SCAN"] = "ALIEN_SCAN";
    // Cambio de rol (Fase 7)
    ActionType["CHANGE_ROLE"] = "CHANGE_ROLE";
    // Victoria
    ActionType["ACTIVATE_BEACON"] = "ACTIVATE_BEACON";
    ActionType["ESCAPE_SHIP"] = "ESCAPE_SHIP";
    ActionType["END_GAME"] = "END_GAME";
})(ActionType || (exports.ActionType = ActionType = {}));
/**
 * Eventos del juego (para logging y UI)
 */
var GameEventType;
(function (GameEventType) {
    GameEventType["CHARACTER_MOVED"] = "CHARACTER_MOVED";
    GameEventType["RESOURCES_GATHERED"] = "RESOURCES_GATHERED";
    GameEventType["BUILDING_CONSTRUCTED"] = "BUILDING_CONSTRUCTED";
    GameEventType["ALIEN_ATTACKED"] = "ALIEN_ATTACKED";
    GameEventType["GHETTO_CONTROLLED"] = "GHETTO_CONTROLLED";
    GameEventType["HUMANS_DIED"] = "HUMANS_DIED";
    GameEventType["PHASE_CHANGED"] = "PHASE_CHANGED";
    GameEventType["GAME_WON"] = "GAME_WON";
    GameEventType["GAME_LOST"] = "GAME_LOST";
})(GameEventType || (exports.GameEventType = GameEventType = {}));
//# sourceMappingURL=types.js.map