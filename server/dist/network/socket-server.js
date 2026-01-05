"use strict";
/**
 * JORUMI Server - WebSocket Server
 *
 * Servidor WebSocket con Socket.IO
 * Gestiona conexiones y mensajes de jugadores
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const socket_io_1 = require("socket.io");
const room_manager_1 = require("../core/room-manager");
const messages_1 = require("../types/messages");
const nanoid_1 = require("nanoid");
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
class SocketServer {
    io;
    roomManager;
    connections = new Map();
    options;
    constructor(httpServer, options = {}) {
        this.options = {
            cors: options.cors ?? {
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST'],
            },
            maxConnections: options.maxConnections ?? 1000,
        };
        // Crear servidor Socket.IO
        this.io = new socket_io_1.Server(httpServer, {
            cors: this.options.cors,
            pingTimeout: 60000,
            pingInterval: 25000,
        });
        // Crear gestor de salas
        this.roomManager = new room_manager_1.RoomManager({
            maxRooms: 100,
            maxIdleTime: 3600000,
        });
        this.setupEventHandlers();
        this.log('SocketServer initialized');
    }
    // ==========================================================================
    // CONFIGURACIÓN DE EVENTOS
    // ==========================================================================
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }
    handleConnection(socket) {
        const connectionId = socket.id;
        // Crear conexión
        const connection = {
            id: connectionId,
            connectedAt: Date.now(),
        };
        this.connections.set(connectionId, connection);
        this.log('Client connected', { connectionId, totalConnections: this.connections.size });
        // Configurar handlers de mensajes
        socket.on('message', (message) => {
            this.handleMessage(socket, message);
        });
        socket.on('disconnect', (reason) => {
            this.handleDisconnection(socket, reason);
        });
        socket.on('error', (error) => {
            this.log('Socket error', { connectionId, error: error.message });
        });
    }
    handleDisconnection(socket, reason) {
        const connectionId = socket.id;
        const connection = this.connections.get(connectionId);
        if (connection) {
            // Si el jugador estaba en una sala, removerlo
            if (connection.roomId && connection.playerId) {
                const room = this.roomManager.getRoom(connection.roomId);
                if (room) {
                    room.removePlayer(connection.playerId);
                    // Notificar a otros jugadores
                    this.broadcastToRoom(connection.roomId, {
                        type: messages_1.ServerMessageType.PLAYER_LEFT,
                        roomId: connection.roomId,
                        playerId: connection.playerId,
                        playerName: connection.playerName ?? 'Unknown',
                    });
                }
            }
            this.connections.delete(connectionId);
        }
        this.log('Client disconnected', {
            connectionId,
            reason,
            totalConnections: this.connections.size,
        });
    }
    // ==========================================================================
    // MANEJO DE MENSAJES
    // ==========================================================================
    handleMessage(socket, message) {
        const connectionId = socket.id;
        const connection = this.connections.get(connectionId);
        if (!connection) {
            this.sendError(socket, messages_1.ErrorCode.INTERNAL_ERROR, 'Connection not found');
            return;
        }
        this.log('Message received', {
            connectionId,
            type: message.type,
        });
        // Enrutar mensaje según tipo
        switch (message.type) {
            case messages_1.ClientMessageType.CREATE_ROOM:
                this.handleCreateRoom(socket, connection, message);
                break;
            case messages_1.ClientMessageType.JOIN_ROOM:
                this.handleJoinRoom(socket, connection, message);
                break;
            case messages_1.ClientMessageType.LEAVE_ROOM:
                this.handleLeaveRoom(socket, connection, message);
                break;
            case messages_1.ClientMessageType.START_GAME:
                this.handleStartGame(socket, connection, message);
                break;
            case messages_1.ClientMessageType.PLAYER_ACTION:
                this.handlePlayerAction(socket, connection, message);
                break;
            case messages_1.ClientMessageType.REQUEST_SNAPSHOT:
                this.handleRequestSnapshot(socket, connection, message);
                break;
            default:
                this.sendError(socket, messages_1.ErrorCode.NOT_IMPLEMENTED, `Message type not implemented: ${message.type}`);
        }
    }
    // ==========================================================================
    // HANDLERS DE MENSAJES ESPECÍFICOS
    // ==========================================================================
    handleCreateRoom(socket, connection, message) {
        console.log('[SocketServer] handleCreateRoom called with:', message);
        // Validar nombre de jugador
        if (!message.playerName || message.playerName.trim().length === 0) {
            console.error('[SocketServer] Invalid player name');
            this.sendError(socket, messages_1.ErrorCode.INVALID_PLAYER_NAME, 'Player name is required');
            return;
        }
        console.log('[SocketServer] Creating room...');
        // Crear sala
        const room = this.roomManager.createRoom(message.roomConfig);
        if (!room) {
            console.error('[SocketServer] Failed to create room');
            this.sendError(socket, messages_1.ErrorCode.INTERNAL_ERROR, 'Could not create room');
            return;
        }
        console.log('[SocketServer] Room created with ID:', room.id);
        // Crear ID de jugador
        const playerId = (0, nanoid_1.nanoid)(10);
        console.log('[SocketServer] Generated player ID:', playerId);
        // Agregar jugador a la sala
        console.log('[SocketServer] Adding player to room...');
        const player = room.addPlayer(playerId, message.playerName, connection.id);
        if (!player) {
            console.error('[SocketServer] Failed to add player to room');
            this.sendError(socket, messages_1.ErrorCode.INTERNAL_ERROR, 'Could not add player to room');
            this.roomManager.deleteRoom(room.id);
            return;
        }
        console.log('[SocketServer] Player added successfully');
        // Actualizar conexión
        connection.playerId = playerId;
        connection.playerName = message.playerName;
        connection.roomId = room.id;
        // Unir socket a sala de Socket.IO
        socket.join(room.id);
        console.log('[SocketServer] Socket joined room:', room.id);
        // Enviar confirmación
        const response = {
            type: messages_1.ServerMessageType.ROOM_CREATED,
            roomId: room.id,
            playerId,
            playerName: message.playerName,
        };
        console.log('[SocketServer] Sending ROOM_CREATED message:', response);
        this.send(socket, response);
        this.log('Room created', {
            roomId: room.id,
            playerId,
            playerName: message.playerName,
        });
    }
    handleJoinRoom(socket, connection, message) {
        // Validar nombre de jugador
        if (!message.playerName || message.playerName.trim().length === 0) {
            this.sendError(socket, messages_1.ErrorCode.INVALID_PLAYER_NAME, 'Player name is required');
            return;
        }
        // Obtener sala
        const room = this.roomManager.getRoom(message.roomId);
        if (!room) {
            this.sendError(socket, messages_1.ErrorCode.ROOM_NOT_FOUND, 'Room not found');
            return;
        }
        // Verificar si está llena
        if (room.isFull()) {
            this.sendError(socket, messages_1.ErrorCode.ROOM_FULL, 'Room is full');
            return;
        }
        // Crear ID de jugador
        const playerId = (0, nanoid_1.nanoid)(10);
        // Agregar jugador a la sala
        const player = room.addPlayer(playerId, message.playerName, connection.id);
        if (!player) {
            this.sendError(socket, messages_1.ErrorCode.INTERNAL_ERROR, 'Could not add player to room');
            return;
        }
        // Actualizar conexión
        connection.playerId = playerId;
        connection.playerName = message.playerName;
        connection.roomId = room.id;
        // Unir socket a sala de Socket.IO
        socket.join(room.id);
        // Enviar confirmación al jugador que se unió
        this.send(socket, {
            type: messages_1.ServerMessageType.ROOM_JOINED,
            roomId: room.id,
            playerId,
            playerName: message.playerName,
            players: room.getAllPlayers(),
            gameState: room.getGameState(),
        });
        // Notificar a otros jugadores
        this.broadcastToRoomExcept(room.id, socket.id, {
            type: messages_1.ServerMessageType.PLAYER_JOINED,
            roomId: room.id,
            player,
        });
        // Si la partida inició, enviar estado del juego
        if (room.isGameInProgress()) {
            const gameState = room.getGameState();
            if (gameState) {
                this.broadcastToRoom(room.id, {
                    type: messages_1.ServerMessageType.GAME_STARTED,
                    roomId: room.id,
                    gameState,
                });
                // Notificar roles
                room.getAllPlayers().forEach(p => {
                    if (p.role) {
                        this.broadcastToRoom(room.id, {
                            type: messages_1.ServerMessageType.PLAYER_ROLE_ASSIGNED,
                            roomId: room.id,
                            playerId: p.id,
                            role: p.role,
                        });
                    }
                });
            }
        }
        this.log('Player joined room', {
            roomId: room.id,
            playerId,
            playerName: message.playerName,
            totalPlayers: room.getAllPlayers().length,
        });
    }
    handleLeaveRoom(socket, connection, message) {
        if (!connection.playerId || !connection.roomId) {
            this.sendError(socket, messages_1.ErrorCode.PLAYER_NOT_IN_ROOM, 'Not in a room');
            return;
        }
        const room = this.roomManager.getRoom(connection.roomId);
        if (!room) {
            this.sendError(socket, messages_1.ErrorCode.ROOM_NOT_FOUND, 'Room not found');
            return;
        }
        // Remover jugador
        room.removePlayer(connection.playerId);
        // Salir de la sala de Socket.IO
        socket.leave(connection.roomId);
        // Notificar a otros jugadores
        this.broadcastToRoom(connection.roomId, {
            type: messages_1.ServerMessageType.PLAYER_LEFT,
            roomId: connection.roomId,
            playerId: connection.playerId,
            playerName: connection.playerName ?? 'Unknown',
        });
        // Enviar confirmación
        this.send(socket, {
            type: messages_1.ServerMessageType.ROOM_LEFT,
            roomId: connection.roomId,
            playerId: connection.playerId,
        });
        this.log('Player left room', {
            roomId: connection.roomId,
            playerId: connection.playerId,
        });
        // Limpiar conexión
        connection.roomId = undefined;
        connection.playerId = undefined;
        connection.playerName = undefined;
    }
    handleStartGame(socket, connection, message) {
        console.log('[SocketServer] handleStartGame called');
        if (!connection.playerId || !connection.roomId) {
            console.error('[SocketServer] Player not in room');
            this.sendError(socket, messages_1.ErrorCode.PLAYER_NOT_IN_ROOM, 'Not in a room');
            return;
        }
        const room = this.roomManager.getRoom(connection.roomId);
        if (!room) {
            console.error('[SocketServer] Room not found:', connection.roomId);
            this.sendError(socket, messages_1.ErrorCode.ROOM_NOT_FOUND, 'Room not found');
            return;
        }
        // Verificar que sea el host (primer jugador)
        const players = room.getAllPlayers();
        if (players.length === 0 || players[0].id !== connection.playerId) {
            console.error('[SocketServer] Only host can start game');
            this.sendError(socket, messages_1.ErrorCode.UNAUTHORIZED, 'Only the host can start the game');
            return;
        }
        // Verificar mínimo de jugadores (2 para jugar)
        if (players.length < 2) {
            console.error('[SocketServer] Not enough players:', players.length);
            this.sendError(socket, messages_1.ErrorCode.INVALID_GAME_STATE, 'Need at least 2 players to start');
            return;
        }
        console.log('[SocketServer] Starting game with', players.length, 'players');
        // Iniciar juego en la sala
        const success = room.startGame();
        if (!success) {
            console.error('[SocketServer] Failed to start game');
            this.sendError(socket, messages_1.ErrorCode.INTERNAL_ERROR, 'Could not start game');
            return;
        }
        const gameState = room.getGameState();
        if (!gameState) {
            console.error('[SocketServer] No game state after starting');
            this.sendError(socket, messages_1.ErrorCode.INTERNAL_ERROR, 'Game state not available');
            return;
        }
        console.log('[SocketServer] Game started successfully, broadcasting to room');
        // Broadcast GAME_STARTED a todos los jugadores de la sala
        this.broadcastToRoom(connection.roomId, {
            type: messages_1.ServerMessageType.GAME_STARTED,
            roomId: connection.roomId,
            gameState,
        });
        this.log('Game started', {
            roomId: connection.roomId,
            players: players.length,
            gameId: gameState.gameId,
        });
    }
    handlePlayerAction(socket, connection, message) {
        if (!connection.playerId || !connection.roomId) {
            this.sendError(socket, messages_1.ErrorCode.PLAYER_NOT_IN_ROOM, 'Not in a room');
            return;
        }
        const room = this.roomManager.getRoom(connection.roomId);
        if (!room) {
            this.sendError(socket, messages_1.ErrorCode.ROOM_NOT_FOUND, 'Room not found');
            return;
        }
        // CRÍTICO: Aplicar acción en el servidor (autoritativo)
        const result = room.applyPlayerAction(connection.playerId, message.action);
        if (result.success && result.newState) {
            // Broadcast estado actualizado a todos los jugadores
            this.broadcastToRoom(connection.roomId, {
                type: messages_1.ServerMessageType.GAME_STATE_UPDATE,
                roomId: connection.roomId,
                gameState: result.newState,
                events: result.events ?? [],
            });
            // Enviar confirmación de acción aplicada
            this.broadcastToRoom(connection.roomId, {
                type: messages_1.ServerMessageType.ACTION_APPLIED,
                roomId: connection.roomId,
                action: message.action,
                events: result.events ?? [],
            });
            // Verificar si el juego terminó
            if (result.newState.gameOver) {
                this.broadcastToRoom(connection.roomId, {
                    type: messages_1.ServerMessageType.GAME_ENDED,
                    roomId: connection.roomId,
                    gameState: result.newState,
                    winner: result.newState.winner,
                });
            }
            this.log('Action applied', {
                roomId: connection.roomId,
                playerId: connection.playerId,
                action: message.action.type,
            });
        }
        else {
            // Acción rechazada
            this.send(socket, {
                type: messages_1.ServerMessageType.ACTION_REJECTED,
                roomId: connection.roomId,
                action: message.action,
                reason: result.error ?? 'Unknown error',
            });
            this.log('Action rejected', {
                roomId: connection.roomId,
                playerId: connection.playerId,
                action: message.action.type,
                reason: result.error,
            });
        }
    }
    handleRequestSnapshot(socket, connection, message) {
        if (!connection.roomId) {
            this.sendError(socket, messages_1.ErrorCode.PLAYER_NOT_IN_ROOM, 'Not in a room');
            return;
        }
        const room = this.roomManager.getRoom(connection.roomId);
        if (!room) {
            this.sendError(socket, messages_1.ErrorCode.ROOM_NOT_FOUND, 'Room not found');
            return;
        }
        const gameState = room.getGameState();
        if (!gameState) {
            this.sendError(socket, messages_1.ErrorCode.INVALID_GAME_STATE, 'No active game');
            return;
        }
        // Enviar snapshot
        this.send(socket, {
            type: messages_1.ServerMessageType.GAME_STATE_SNAPSHOT,
            roomId: connection.roomId,
            gameState,
        });
        this.log('Snapshot sent', {
            roomId: connection.roomId,
            playerId: connection.playerId,
        });
    }
    // ==========================================================================
    // ENVÍO DE MENSAJES
    // ==========================================================================
    /**
     * Envía mensaje a un socket específico
     */
    send(socket, message) {
        console.log('[SocketServer] Emitting message to socket:', message.type);
        socket.emit('message', message);
        console.log('[SocketServer] Message emitted successfully');
    }
    /**
     * Broadcast a toda una sala
     */
    broadcastToRoom(roomId, message) {
        this.io.to(roomId).emit('message', message);
    }
    /**
     * Broadcast a una sala excepto un socket
     */
    broadcastToRoomExcept(roomId, socketId, message) {
        this.io.to(roomId).except(socketId).emit('message', message);
    }
    /**
     * Envía error a un socket
     */
    sendError(socket, code, message, details) {
        this.send(socket, {
            type: messages_1.ServerMessageType.ERROR,
            code,
            message,
            details,
        });
    }
    // ==========================================================================
    // API PÚBLICA
    // ==========================================================================
    /**
     * Obtiene estadísticas del servidor
     */
    getStats() {
        return {
            connections: this.connections.size,
            rooms: this.roomManager.getStats(),
        };
    }
    /**
     * Cierra el servidor limpiamente
     */
    shutdown() {
        this.log('Shutting down SocketServer...');
        this.roomManager.shutdown();
        this.io.close();
        this.log('SocketServer shutdown complete');
    }
    // ==========================================================================
    // UTILIDADES
    // ==========================================================================
    log(message, data) {
        console.log(`[SocketServer] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
}
exports.SocketServer = SocketServer;
//# sourceMappingURL=socket-server.js.map