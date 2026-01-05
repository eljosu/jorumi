/**
 * JORUMI Server - WebSocket Server
 *
 * Servidor WebSocket con Socket.IO
 * Gestiona conexiones y mensajes de jugadores
 */
import { Server as HTTPServer } from 'http';
/**
 * Opciones del servidor WebSocket
 */
export interface SocketServerOptions {
    cors?: {
        origin: string | string[];
        methods?: string[];
    };
    maxConnections?: number;
}
/**
 * SocketServer - Servidor WebSocket autoritativo
 *
 * RESPONSABILIDADES:
 * - Gestionar conexiones de clientes
 * - Enrutar mensajes a GameRooms
 * - Broadcast de eventos a jugadores
 * - Validar mensajes del cliente
 *
 * FLUJO:
 * 1. Cliente se conecta → Socket.IO connection
 * 2. Cliente envía mensaje → Validación → Enrutamiento a GameRoom
 * 3. GameRoom procesa → Genera eventos → Broadcast a todos los jugadores
 */
export declare class SocketServer {
    private io;
    private roomManager;
    private connections;
    private options;
    constructor(httpServer: HTTPServer, options?: SocketServerOptions);
    private setupEventHandlers;
    private handleConnection;
    private handleDisconnection;
    private handleMessage;
    private handleCreateRoom;
    private handleJoinRoom;
    private handleLeaveRoom;
    private handleStartGame;
    private handlePlayerAction;
    private handleRequestSnapshot;
    /**
     * Envía mensaje a un socket específico
     */
    private send;
    /**
     * Broadcast a toda una sala
     */
    private broadcastToRoom;
    /**
     * Broadcast a una sala excepto un socket
     */
    private broadcastToRoomExcept;
    /**
     * Envía error a un socket
     */
    private sendError;
    /**
     * Obtiene estadísticas del servidor
     */
    getStats(): {
        connections: number;
        rooms: {
            totalRooms: number;
            waitingRooms: number;
            activeGames: number;
            finishedGames: number;
            totalPlayers: number;
            availableSlots: number;
        };
    };
    /**
     * Cierra el servidor limpiamente
     */
    shutdown(): void;
    private log;
}
//# sourceMappingURL=socket-server.d.ts.map