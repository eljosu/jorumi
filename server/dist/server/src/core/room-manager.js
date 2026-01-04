"use strict";
/**
 * JORUMI Server - Room Manager
 *
 * Gestiona todas las salas de juego del servidor
 * Matchmaking, creación, destrucción de salas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const game_room_1 = require("./game-room");
/**
 * RoomManager - Gestiona el ciclo de vida de todas las salas
 *
 * RESPONSABILIDADES:
 * - Crear y destruir salas
 * - Matchmaking (buscar salas disponibles)
 * - Limpieza de salas abandonadas
 * - Estadísticas del servidor
 */
class RoomManager {
    rooms = new Map();
    options;
    cleanupTimer;
    constructor(options = {}) {
        this.options = {
            maxRooms: options.maxRooms ?? 100,
            maxIdleTime: options.maxIdleTime ?? 3600000, // 1 hora
            cleanupInterval: options.cleanupInterval ?? 60000, // 1 minuto
        };
        this.startCleanupTimer();
        this.log('RoomManager initialized', this.options);
    }
    // ==========================================================================
    // GESTIÓN DE SALAS
    // ==========================================================================
    /**
     * Crea una nueva sala
     */
    createRoom(options) {
        // Verificar límite de salas
        if (this.rooms.size >= this.options.maxRooms) {
            this.log('Cannot create room - max rooms reached', {
                current: this.rooms.size,
                max: this.options.maxRooms,
            });
            return null;
        }
        // Crear sala
        const room = game_room_1.GameRoomFactory.create(options);
        this.rooms.set(room.id, room);
        this.log('Room created', {
            roomId: room.id,
            totalRooms: this.rooms.size,
        });
        return room;
    }
    /**
     * Obtiene una sala por ID
     */
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    /**
     * Elimina una sala
     */
    deleteRoom(roomId) {
        const existed = this.rooms.delete(roomId);
        if (existed) {
            this.log('Room deleted', {
                roomId,
                totalRooms: this.rooms.size,
            });
        }
        return existed;
    }
    /**
     * Busca una sala disponible para unirse (matchmaking)
     */
    findAvailableRoom() {
        for (const room of this.rooms.values()) {
            // Buscar salas públicas que no estén llenas ni en progreso
            if (!room.isFull() &&
                room.getStatus() === game_room_1.RoomStatus.WAITING) {
                return room;
            }
        }
        return null;
    }
    /**
     * Obtiene todas las salas
     */
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    /**
     * Obtiene salas públicas disponibles
     */
    getAvailableRooms() {
        return this.getAllRooms().filter(room => !room.isFull() &&
            room.getStatus() === game_room_1.RoomStatus.WAITING);
    }
    // ==========================================================================
    // LIMPIEZA
    // ==========================================================================
    /**
     * Inicia el timer de limpieza periódica
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.options.cleanupInterval);
    }
    /**
     * Detiene el timer de limpieza
     */
    stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
    }
    /**
     * Limpia salas abandonadas o inactivas
     */
    cleanup() {
        const roomsToDelete = [];
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.shouldBeDeleted(this.options.maxIdleTime)) {
                roomsToDelete.push(roomId);
            }
        }
        if (roomsToDelete.length > 0) {
            this.log('Cleaning up rooms', {
                count: roomsToDelete.length,
                rooms: roomsToDelete,
            });
            roomsToDelete.forEach(roomId => this.deleteRoom(roomId));
        }
    }
    // ==========================================================================
    // ESTADÍSTICAS
    // ==========================================================================
    /**
     * Obtiene estadísticas del servidor
     */
    getStats() {
        const rooms = this.getAllRooms();
        const stats = {
            totalRooms: rooms.length,
            waitingRooms: 0,
            activeGames: 0,
            finishedGames: 0,
            totalPlayers: 0,
            availableSlots: 0,
        };
        rooms.forEach(room => {
            const status = room.getStatus();
            const players = room.getAllPlayers().length;
            stats.totalPlayers += players;
            switch (status) {
                case game_room_1.RoomStatus.WAITING:
                    stats.waitingRooms++;
                    stats.availableSlots += (2 - players); // Asumiendo max 2 jugadores
                    break;
                case game_room_1.RoomStatus.IN_PROGRESS:
                    stats.activeGames++;
                    break;
                case game_room_1.RoomStatus.FINISHED:
                    stats.finishedGames++;
                    break;
            }
        });
        return stats;
    }
    /**
     * Obtiene información detallada de todas las salas
     */
    getRoomsInfo() {
        return this.getAllRooms().map(room => room.getInfo());
    }
    // ==========================================================================
    // SHUTDOWN
    // ==========================================================================
    /**
     * Cierra el gestor de salas limpiamente
     */
    shutdown() {
        this.log('Shutting down RoomManager...');
        this.stopCleanupTimer();
        // Limpiar todas las salas
        this.rooms.clear();
        this.log('RoomManager shutdown complete');
    }
    // ==========================================================================
    // UTILIDADES
    // ==========================================================================
    log(message, data) {
        console.log(`[RoomManager] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
}
exports.RoomManager = RoomManager;
//# sourceMappingURL=room-manager.js.map