"use strict";
/**
 * JORUMI Server - WebSocket Message Protocol
 *
 * Definición completa del protocolo de comunicación cliente-servidor
 * Diseñado para servidor autoritativo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.ServerMessageType = exports.ClientMessageType = void 0;
/**
 * Tipos de mensajes del cliente al servidor
 */
var ClientMessageType;
(function (ClientMessageType) {
    // Gestión de sala
    ClientMessageType["CREATE_ROOM"] = "CREATE_ROOM";
    ClientMessageType["JOIN_ROOM"] = "JOIN_ROOM";
    ClientMessageType["LEAVE_ROOM"] = "LEAVE_ROOM";
    // Acciones de juego
    ClientMessageType["PLAYER_ACTION"] = "PLAYER_ACTION";
    // Sincronización
    ClientMessageType["REQUEST_SNAPSHOT"] = "REQUEST_SNAPSHOT";
})(ClientMessageType || (exports.ClientMessageType = ClientMessageType = {}));
/**
 * Tipos de mensajes del servidor al cliente
 */
var ServerMessageType;
(function (ServerMessageType) {
    // Confirmaciones de sala
    ServerMessageType["ROOM_CREATED"] = "ROOM_CREATED";
    ServerMessageType["ROOM_JOINED"] = "ROOM_JOINED";
    ServerMessageType["ROOM_LEFT"] = "ROOM_LEFT";
    // Notificaciones de jugadores
    ServerMessageType["PLAYER_JOINED"] = "PLAYER_JOINED";
    ServerMessageType["PLAYER_LEFT"] = "PLAYER_LEFT";
    ServerMessageType["PLAYER_ROLE_ASSIGNED"] = "PLAYER_ROLE_ASSIGNED";
    // Estado del juego
    ServerMessageType["GAME_STARTED"] = "GAME_STARTED";
    ServerMessageType["GAME_STATE_UPDATE"] = "GAME_STATE_UPDATE";
    ServerMessageType["GAME_STATE_SNAPSHOT"] = "GAME_STATE_SNAPSHOT";
    ServerMessageType["GAME_ENDED"] = "GAME_ENDED";
    // Eventos de juego
    ServerMessageType["ACTION_APPLIED"] = "ACTION_APPLIED";
    ServerMessageType["ACTION_REJECTED"] = "ACTION_REJECTED";
    ServerMessageType["DICE_ROLLED"] = "DICE_ROLLED";
    ServerMessageType["PHASE_CHANGED"] = "PHASE_CHANGED";
    // Errores
    ServerMessageType["ERROR"] = "ERROR";
})(ServerMessageType || (exports.ServerMessageType = ServerMessageType = {}));
/**
 * Códigos de error
 */
var ErrorCode;
(function (ErrorCode) {
    // Errores de sala
    ErrorCode["ROOM_NOT_FOUND"] = "ROOM_NOT_FOUND";
    ErrorCode["ROOM_FULL"] = "ROOM_FULL";
    ErrorCode["ROOM_ALREADY_STARTED"] = "ROOM_ALREADY_STARTED";
    // Errores de jugador
    ErrorCode["PLAYER_NOT_IN_ROOM"] = "PLAYER_NOT_IN_ROOM";
    ErrorCode["PLAYER_NOT_AUTHORIZED"] = "PLAYER_NOT_AUTHORIZED";
    ErrorCode["INVALID_PLAYER_NAME"] = "INVALID_PLAYER_NAME";
    // Errores de acción
    ErrorCode["ACTION_NOT_ALLOWED"] = "ACTION_NOT_ALLOWED";
    ErrorCode["INVALID_ACTION"] = "INVALID_ACTION";
    ErrorCode["NOT_PLAYER_TURN"] = "NOT_PLAYER_TURN";
    ErrorCode["WRONG_PHASE"] = "WRONG_PHASE";
    ErrorCode["WRONG_ROLE"] = "WRONG_ROLE";
    // Errores de validación
    ErrorCode["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    ErrorCode["INVALID_GAME_STATE"] = "INVALID_GAME_STATE";
    // Errores del servidor
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=messages.js.map