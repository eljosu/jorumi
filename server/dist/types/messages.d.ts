/**
 * JORUMI Server - WebSocket Message Protocol
 *
 * Definición completa del protocolo de comunicación cliente-servidor
 * Diseñado para servidor autoritativo
 */
import type { GameState, GameAction, GameEvent, PlayerRole } from '@jorumi/engine';
export type RoomId = string;
export type ConnectionId = string;
/**
 * Tipos de mensajes del cliente al servidor
 */
export declare enum ClientMessageType {
    CREATE_ROOM = "CREATE_ROOM",
    JOIN_ROOM = "JOIN_ROOM",
    LEAVE_ROOM = "LEAVE_ROOM",
    PLAYER_ACTION = "PLAYER_ACTION",
    REQUEST_SNAPSHOT = "REQUEST_SNAPSHOT"
}
/**
 * Tipos de mensajes del servidor al cliente
 */
export declare enum ServerMessageType {
    ROOM_CREATED = "ROOM_CREATED",
    ROOM_JOINED = "ROOM_JOINED",
    ROOM_LEFT = "ROOM_LEFT",
    PLAYER_JOINED = "PLAYER_JOINED",
    PLAYER_LEFT = "PLAYER_LEFT",
    PLAYER_ROLE_ASSIGNED = "PLAYER_ROLE_ASSIGNED",
    GAME_STARTED = "GAME_STARTED",
    GAME_STATE_UPDATE = "GAME_STATE_UPDATE",
    GAME_STATE_SNAPSHOT = "GAME_STATE_SNAPSHOT",
    GAME_ENDED = "GAME_ENDED",
    ACTION_APPLIED = "ACTION_APPLIED",
    ACTION_REJECTED = "ACTION_REJECTED",
    DICE_ROLLED = "DICE_ROLLED",
    PHASE_CHANGED = "PHASE_CHANGED",
    ERROR = "ERROR"
}
/**
 * Crear nueva sala de juego
 */
export interface CreateRoomMessage {
    type: ClientMessageType.CREATE_ROOM;
    playerName: string;
    roomConfig?: RoomConfig;
}
/**
 * Unirse a sala existente
 */
export interface JoinRoomMessage {
    type: ClientMessageType.JOIN_ROOM;
    roomId: RoomId;
    playerName: string;
}
/**
 * Abandonar sala
 */
export interface LeaveRoomMessage {
    type: ClientMessageType.LEAVE_ROOM;
    roomId: RoomId;
}
/**
 * Ejecutar acción de jugador
 * CRÍTICO: El servidor SIEMPRE valida antes de aplicar
 */
export interface PlayerActionMessage {
    type: ClientMessageType.PLAYER_ACTION;
    roomId: RoomId;
    action: GameAction;
}
/**
 * Solicitar snapshot completo (reconexión)
 */
export interface RequestSnapshotMessage {
    type: ClientMessageType.REQUEST_SNAPSHOT;
    roomId: RoomId;
}
/**
 * Tipo unión de mensajes del cliente
 */
export type ClientMessage = CreateRoomMessage | JoinRoomMessage | LeaveRoomMessage | PlayerActionMessage | RequestSnapshotMessage;
/**
 * Sala creada exitosamente
 */
export interface RoomCreatedMessage {
    type: ServerMessageType.ROOM_CREATED;
    roomId: RoomId;
    playerId: string;
    playerName: string;
}
/**
 * Unión exitosa a sala
 */
export interface RoomJoinedMessage {
    type: ServerMessageType.ROOM_JOINED;
    roomId: RoomId;
    playerId: string;
    playerName: string;
    players: RoomPlayer[];
    gameState: GameState | null;
}
/**
 * Salida de sala
 */
export interface RoomLeftMessage {
    type: ServerMessageType.ROOM_LEFT;
    roomId: RoomId;
    playerId: string;
}
/**
 * Otro jugador se unió
 */
export interface PlayerJoinedMessage {
    type: ServerMessageType.PLAYER_JOINED;
    roomId: RoomId;
    player: RoomPlayer;
}
/**
 * Jugador abandonó
 */
export interface PlayerLeftMessage {
    type: ServerMessageType.PLAYER_LEFT;
    roomId: RoomId;
    playerId: string;
    playerName: string;
}
/**
 * Rol asignado a jugador
 */
export interface PlayerRoleAssignedMessage {
    type: ServerMessageType.PLAYER_ROLE_ASSIGNED;
    roomId: RoomId;
    playerId: string;
    role: PlayerRole;
}
/**
 * Partida iniciada
 */
export interface GameStartedMessage {
    type: ServerMessageType.GAME_STARTED;
    roomId: RoomId;
    gameState: GameState;
}
/**
 * Actualización de estado (después de acción)
 */
export interface GameStateUpdateMessage {
    type: ServerMessageType.GAME_STATE_UPDATE;
    roomId: RoomId;
    gameState: GameState;
    events: GameEvent[];
}
/**
 * Snapshot completo del estado (reconexión)
 */
export interface GameStateSnapshotMessage {
    type: ServerMessageType.GAME_STATE_SNAPSHOT;
    roomId: RoomId;
    gameState: GameState;
}
/**
 * Partida terminada
 */
export interface GameEndedMessage {
    type: ServerMessageType.GAME_ENDED;
    roomId: RoomId;
    gameState: GameState;
    winner?: PlayerRole;
}
/**
 * Acción aplicada exitosamente
 */
export interface ActionAppliedMessage {
    type: ServerMessageType.ACTION_APPLIED;
    roomId: RoomId;
    action: GameAction;
    events: GameEvent[];
}
/**
 * Acción rechazada por el servidor
 */
export interface ActionRejectedMessage {
    type: ServerMessageType.ACTION_REJECTED;
    roomId: RoomId;
    action: GameAction;
    reason: string;
}
/**
 * Dado lanzado (evento del servidor)
 */
export interface DiceRolledMessage {
    type: ServerMessageType.DICE_ROLLED;
    roomId: RoomId;
    diceType: string;
    result: any;
    context?: string;
}
/**
 * Fase cambiada
 */
export interface PhaseChangedMessage {
    type: ServerMessageType.PHASE_CHANGED;
    roomId: RoomId;
    previousPhase: string;
    newPhase: string;
    turn: number;
}
/**
 * Error general
 */
export interface ErrorMessage {
    type: ServerMessageType.ERROR;
    code: ErrorCode;
    message: string;
    details?: any;
}
/**
 * Tipo unión de mensajes del servidor
 */
export type ServerMessage = RoomCreatedMessage | RoomJoinedMessage | RoomLeftMessage | PlayerJoinedMessage | PlayerLeftMessage | PlayerRoleAssignedMessage | GameStartedMessage | GameStateUpdateMessage | GameStateSnapshotMessage | GameEndedMessage | ActionAppliedMessage | ActionRejectedMessage | DiceRolledMessage | PhaseChangedMessage | ErrorMessage;
/**
 * Información de jugador en sala
 */
export interface RoomPlayer {
    id: string;
    name: string;
    role?: PlayerRole;
    isReady: boolean;
    connectionId: ConnectionId;
    connectedAt: number;
}
/**
 * Configuración de sala
 */
export interface RoomConfig {
    maxPlayers: number;
    isPrivate: boolean;
    gameSeed?: number;
}
/**
 * Códigos de error
 */
export declare enum ErrorCode {
    ROOM_NOT_FOUND = "ROOM_NOT_FOUND",
    ROOM_FULL = "ROOM_FULL",
    ROOM_ALREADY_STARTED = "ROOM_ALREADY_STARTED",
    PLAYER_NOT_IN_ROOM = "PLAYER_NOT_IN_ROOM",
    PLAYER_NOT_AUTHORIZED = "PLAYER_NOT_AUTHORIZED",
    INVALID_PLAYER_NAME = "INVALID_PLAYER_NAME",
    ACTION_NOT_ALLOWED = "ACTION_NOT_ALLOWED",
    INVALID_ACTION = "INVALID_ACTION",
    NOT_PLAYER_TURN = "NOT_PLAYER_TURN",
    WRONG_PHASE = "WRONG_PHASE",
    WRONG_ROLE = "WRONG_ROLE",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    INVALID_GAME_STATE = "INVALID_GAME_STATE",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED"
}
/**
 * Resultado de validación de mensaje
 */
export interface MessageValidationResult {
    valid: boolean;
    error?: {
        code: ErrorCode;
        message: string;
    };
}
//# sourceMappingURL=messages.d.ts.map