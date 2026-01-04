/**
 * JORUMI Server - Room Manager
 *
 * Gestiona todas las salas de juego del servidor
 * Matchmaking, creación, destrucción de salas
 */
import { GameRoom, RoomStatus } from './game-room';
import type { RoomId } from '../types/messages';
/**
 * Opciones del gestor de salas
 */
export interface RoomManagerOptions {
    maxRooms?: number;
    maxIdleTime?: number;
    cleanupInterval?: number;
}
/**
 * RoomManager - Gestiona el ciclo de vida de todas las salas
 *
 * RESPONSABILIDADES:
 * - Crear y destruir salas
 * - Matchmaking (buscar salas disponibles)
 * - Limpieza de salas abandonadas
 * - Estadísticas del servidor
 */
export declare class RoomManager {
    private rooms;
    private options;
    private cleanupTimer?;
    constructor(options?: RoomManagerOptions);
    /**
     * Crea una nueva sala
     */
    createRoom(options?: any): GameRoom | null;
    /**
     * Obtiene una sala por ID
     */
    getRoom(roomId: RoomId): GameRoom | undefined;
    /**
     * Elimina una sala
     */
    deleteRoom(roomId: RoomId): boolean;
    /**
     * Busca una sala disponible para unirse (matchmaking)
     */
    findAvailableRoom(): GameRoom | null;
    /**
     * Obtiene todas las salas
     */
    getAllRooms(): GameRoom[];
    /**
     * Obtiene salas públicas disponibles
     */
    getAvailableRooms(): GameRoom[];
    /**
     * Inicia el timer de limpieza periódica
     */
    private startCleanupTimer;
    /**
     * Detiene el timer de limpieza
     */
    stopCleanupTimer(): void;
    /**
     * Limpia salas abandonadas o inactivas
     */
    cleanup(): void;
    /**
     * Obtiene estadísticas del servidor
     */
    getStats(): {
        totalRooms: number;
        waitingRooms: number;
        activeGames: number;
        finishedGames: number;
        totalPlayers: number;
        availableSlots: number;
    };
    /**
     * Obtiene información detallada de todas las salas
     */
    getRoomsInfo(): {
        id: string;
        status: RoomStatus;
        playerCount: number;
        maxPlayers: number;
        isPrivate: boolean;
        createdAt: number;
        lastActivityAt: number;
        hasActiveGame: boolean;
    }[];
    /**
     * Cierra el gestor de salas limpiamente
     */
    shutdown(): void;
    private log;
}
//# sourceMappingURL=room-manager.d.ts.map