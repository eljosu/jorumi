/**
 * JORUMI Server - Game Room
 *
 * Gestiona una partida individual con su motor de reglas
 * Una sala = Una instancia de GameEngine
 */
import { GameState, GameAction, ActionResult, PlayerRole } from '@jorumi/engine';
import type { RoomId, RoomPlayer } from '../types/messages';
/**
 * Estados de la sala
 */
export declare enum RoomStatus {
    WAITING = "WAITING",// Esperando jugadores
    STARTING = "STARTING",// Iniciando partida
    IN_PROGRESS = "IN_PROGRESS",// Partida en curso
    FINISHED = "FINISHED",// Partida terminada
    ABANDONED = "ABANDONED"
}
/**
 * Opciones de sala
 */
export interface GameRoomOptions {
    maxPlayers?: number;
    isPrivate?: boolean;
    gameSeed?: number;
    enableLogging?: boolean;
}
/**
 * GameRoom - Gestiona una partida con servidor autoritativo
 *
 * RESPONSABILIDADES:
 * - Mantener lista de jugadores conectados
 * - Ejecutar el motor de reglas (ÚNICA fuente de verdad)
 * - Validar acciones de jugadores
 * - Generar eventos de juego
 * - Gestionar turnos y roles
 */
export declare class GameRoom {
    readonly id: RoomId;
    private engine;
    private players;
    private status;
    private config;
    private createdAt;
    private lastActivityAt;
    constructor(id: RoomId, options?: GameRoomOptions);
    /**
     * Agrega un jugador a la sala
     */
    addPlayer(playerId: string, playerName: string, connectionId: string): RoomPlayer | null;
    /**
     * Remueve un jugador de la sala
     */
    removePlayer(playerId: string): boolean;
    /**
     * Obtiene un jugador por ID
     */
    getPlayer(playerId: string): RoomPlayer | undefined;
    /**
     * Obtiene todos los jugadores
     */
    getAllPlayers(): RoomPlayer[];
    /**
     * Verifica si un jugador está en la sala
     */
    hasPlayer(playerId: string): boolean;
    /**
     * Inicia la partida
     * CRÍTICO: Ejecuta el motor de reglas en el servidor
     */
    startGame(): boolean;
    /**
     * Asigna roles a jugadores
     * En JORUMI: primer jugador = HUMAN, segundo = ALIEN
     */
    private assignRoles;
    /**
     * Aplica una acción de jugador
     * CRÍTICO: Ejecuta validación y reglas SOLO en el servidor
     */
    applyPlayerAction(playerId: string, action: GameAction): ActionResult;
    /**
     * Obtiene el estado actual del juego
     */
    getGameState(): GameState | null;
    /**
     * Obtiene el rol de un jugador
     */
    getPlayerRole(playerId: string): PlayerRole | undefined;
    /**
     * Obtiene el estado de la sala
     */
    getStatus(): RoomStatus;
    /**
     * Verifica si la sala está llena
     */
    isFull(): boolean;
    /**
     * Verifica si la sala está vacía
     */
    isEmpty(): boolean;
    /**
     * Verifica si la partida está en curso
     */
    isGameInProgress(): boolean;
    /**
     * Verifica si la sala debe ser eliminada
     */
    shouldBeDeleted(maxIdleTime?: number): boolean;
    /**
     * Obtiene información de la sala
     */
    getInfo(): {
        id: string;
        status: RoomStatus;
        playerCount: number;
        maxPlayers: number;
        isPrivate: boolean;
        createdAt: number;
        lastActivityAt: number;
        hasActiveGame: boolean;
    };
    private log;
}
/**
 * Factory para crear salas
 */
export declare class GameRoomFactory {
    static create(options?: GameRoomOptions): GameRoom;
    static createWithId(roomId: RoomId, options?: GameRoomOptions): GameRoom;
}
//# sourceMappingURL=game-room.d.ts.map