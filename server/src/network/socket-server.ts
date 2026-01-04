/**
 * JORUMI Server - WebSocket Server
 * 
 * Servidor WebSocket con Socket.IO
 * Gestiona conexiones y mensajes de jugadores
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { RoomManager } from '../core/room-manager';
import { GameRoom } from '../core/game-room';
import {
  ClientMessage,
  ClientMessageType,
  ServerMessage,
  ServerMessageType,
  ErrorCode,
  type RoomId,
  type ConnectionId,
} from '../types/messages';
import { nanoid } from 'nanoid';

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
 * Información de conexión del cliente
 */
interface ClientConnection {
  id: ConnectionId;
  playerId?: string;
  playerName?: string;
  roomId?: RoomId;
  connectedAt: number;
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
export class SocketServer {
  private io: SocketIOServer;
  private roomManager: RoomManager;
  private connections: Map<ConnectionId, ClientConnection> = new Map();
  private options: Required<SocketServerOptions>;

  constructor(httpServer: HTTPServer, options: SocketServerOptions = {}) {
    this.options = {
      cors: options.cors ?? {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
      maxConnections: options.maxConnections ?? 1000,
    };
    
    // Crear servidor Socket.IO
    this.io = new SocketIOServer(httpServer, {
      cors: this.options.cors,
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    
    // Crear gestor de salas
    this.roomManager = new RoomManager({
      maxRooms: 100,
      maxIdleTime: 3600000,
    });
    
    this.setupEventHandlers();
    this.log('SocketServer initialized');
  }

  // ==========================================================================
  // CONFIGURACIÓN DE EVENTOS
  // ==========================================================================

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    const connectionId = socket.id;
    
    // Crear conexión
    const connection: ClientConnection = {
      id: connectionId,
      connectedAt: Date.now(),
    };
    
    this.connections.set(connectionId, connection);
    this.log('Client connected', { connectionId, totalConnections: this.connections.size });
    
    // Configurar handlers de mensajes
    socket.on('message', (message: ClientMessage) => {
      this.handleMessage(socket, message);
    });
    
    socket.on('disconnect', (reason: string) => {
      this.handleDisconnection(socket, reason);
    });
    
    socket.on('error', (error: Error) => {
      this.log('Socket error', { connectionId, error: error.message });
    });
  }

  private handleDisconnection(socket: Socket, reason: string): void {
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
            type: ServerMessageType.PLAYER_LEFT,
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

  private handleMessage(socket: Socket, message: ClientMessage): void {
    const connectionId = socket.id;
    const connection = this.connections.get(connectionId);
    
    if (!connection) {
      this.sendError(socket, ErrorCode.INTERNAL_ERROR, 'Connection not found');
      return;
    }
    
    this.log('Message received', {
      connectionId,
      type: message.type,
    });
    
    // Enrutar mensaje según tipo
    switch (message.type) {
      case ClientMessageType.CREATE_ROOM:
        this.handleCreateRoom(socket, connection, message);
        break;
        
      case ClientMessageType.JOIN_ROOM:
        this.handleJoinRoom(socket, connection, message);
        break;
        
      case ClientMessageType.LEAVE_ROOM:
        this.handleLeaveRoom(socket, connection, message);
        break;
        
      case ClientMessageType.PLAYER_ACTION:
        this.handlePlayerAction(socket, connection, message);
        break;
        
      case ClientMessageType.REQUEST_SNAPSHOT:
        this.handleRequestSnapshot(socket, connection, message);
        break;
        
      default:
        this.sendError(socket, ErrorCode.NOT_IMPLEMENTED, `Message type not implemented: ${(message as any).type}`);
    }
  }

  // ==========================================================================
  // HANDLERS DE MENSAJES ESPECÍFICOS
  // ==========================================================================

  private handleCreateRoom(socket: Socket, connection: ClientConnection, message: any): void {
    // Validar nombre de jugador
    if (!message.playerName || message.playerName.trim().length === 0) {
      this.sendError(socket, ErrorCode.INVALID_PLAYER_NAME, 'Player name is required');
      return;
    }
    
    // Crear sala
    const room = this.roomManager.createRoom(message.roomConfig);
    if (!room) {
      this.sendError(socket, ErrorCode.INTERNAL_ERROR, 'Could not create room');
      return;
    }
    
    // Crear ID de jugador
    const playerId = nanoid(10);
    
    // Agregar jugador a la sala
    const player = room.addPlayer(playerId, message.playerName, connection.id);
    if (!player) {
      this.sendError(socket, ErrorCode.INTERNAL_ERROR, 'Could not add player to room');
      this.roomManager.deleteRoom(room.id);
      return;
    }
    
    // Actualizar conexión
    connection.playerId = playerId;
    connection.playerName = message.playerName;
    connection.roomId = room.id;
    
    // Unir socket a sala de Socket.IO
    socket.join(room.id);
    
    // Enviar confirmación
    this.send(socket, {
      type: ServerMessageType.ROOM_CREATED,
      roomId: room.id,
      playerId,
      playerName: message.playerName,
    });
    
    this.log('Room created', {
      roomId: room.id,
      playerId,
      playerName: message.playerName,
    });
  }

  private handleJoinRoom(socket: Socket, connection: ClientConnection, message: any): void {
    // Validar nombre de jugador
    if (!message.playerName || message.playerName.trim().length === 0) {
      this.sendError(socket, ErrorCode.INVALID_PLAYER_NAME, 'Player name is required');
      return;
    }
    
    // Obtener sala
    const room = this.roomManager.getRoom(message.roomId);
    if (!room) {
      this.sendError(socket, ErrorCode.ROOM_NOT_FOUND, 'Room not found');
      return;
    }
    
    // Verificar si está llena
    if (room.isFull()) {
      this.sendError(socket, ErrorCode.ROOM_FULL, 'Room is full');
      return;
    }
    
    // Crear ID de jugador
    const playerId = nanoid(10);
    
    // Agregar jugador a la sala
    const player = room.addPlayer(playerId, message.playerName, connection.id);
    if (!player) {
      this.sendError(socket, ErrorCode.INTERNAL_ERROR, 'Could not add player to room');
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
      type: ServerMessageType.ROOM_JOINED,
      roomId: room.id,
      playerId,
      playerName: message.playerName,
      players: room.getAllPlayers(),
      gameState: room.getGameState(),
    });
    
    // Notificar a otros jugadores
    this.broadcastToRoomExcept(room.id, socket.id, {
      type: ServerMessageType.PLAYER_JOINED,
      roomId: room.id,
      player,
    });
    
    // Si la partida inició, enviar estado del juego
    if (room.isGameInProgress()) {
      const gameState = room.getGameState();
      if (gameState) {
        this.broadcastToRoom(room.id, {
          type: ServerMessageType.GAME_STARTED,
          roomId: room.id,
          gameState,
        });
        
        // Notificar roles
        room.getAllPlayers().forEach(p => {
          if (p.role) {
            this.broadcastToRoom(room.id, {
              type: ServerMessageType.PLAYER_ROLE_ASSIGNED,
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

  private handleLeaveRoom(socket: Socket, connection: ClientConnection, message: any): void {
    if (!connection.playerId || !connection.roomId) {
      this.sendError(socket, ErrorCode.PLAYER_NOT_IN_ROOM, 'Not in a room');
      return;
    }
    
    const room = this.roomManager.getRoom(connection.roomId);
    if (!room) {
      this.sendError(socket, ErrorCode.ROOM_NOT_FOUND, 'Room not found');
      return;
    }
    
    // Remover jugador
    room.removePlayer(connection.playerId);
    
    // Salir de la sala de Socket.IO
    socket.leave(connection.roomId);
    
    // Notificar a otros jugadores
    this.broadcastToRoom(connection.roomId, {
      type: ServerMessageType.PLAYER_LEFT,
      roomId: connection.roomId,
      playerId: connection.playerId,
      playerName: connection.playerName ?? 'Unknown',
    });
    
    // Enviar confirmación
    this.send(socket, {
      type: ServerMessageType.ROOM_LEFT,
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

  private handlePlayerAction(socket: Socket, connection: ClientConnection, message: any): void {
    if (!connection.playerId || !connection.roomId) {
      this.sendError(socket, ErrorCode.PLAYER_NOT_IN_ROOM, 'Not in a room');
      return;
    }
    
    const room = this.roomManager.getRoom(connection.roomId);
    if (!room) {
      this.sendError(socket, ErrorCode.ROOM_NOT_FOUND, 'Room not found');
      return;
    }
    
    // CRÍTICO: Aplicar acción en el servidor (autoritativo)
    const result = room.applyPlayerAction(connection.playerId, message.action);
    
    if (result.success && result.newState) {
      // Broadcast estado actualizado a todos los jugadores
      this.broadcastToRoom(connection.roomId, {
        type: ServerMessageType.GAME_STATE_UPDATE,
        roomId: connection.roomId,
        gameState: result.newState,
        events: result.events ?? [],
      });
      
      // Enviar confirmación de acción aplicada
      this.broadcastToRoom(connection.roomId, {
        type: ServerMessageType.ACTION_APPLIED,
        roomId: connection.roomId,
        action: message.action,
        events: result.events ?? [],
      });
      
      // Verificar si el juego terminó
      if (result.newState.gameOver) {
        this.broadcastToRoom(connection.roomId, {
          type: ServerMessageType.GAME_ENDED,
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
    } else {
      // Acción rechazada
      this.send(socket, {
        type: ServerMessageType.ACTION_REJECTED,
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

  private handleRequestSnapshot(socket: Socket, connection: ClientConnection, message: any): void {
    if (!connection.roomId) {
      this.sendError(socket, ErrorCode.PLAYER_NOT_IN_ROOM, 'Not in a room');
      return;
    }
    
    const room = this.roomManager.getRoom(connection.roomId);
    if (!room) {
      this.sendError(socket, ErrorCode.ROOM_NOT_FOUND, 'Room not found');
      return;
    }
    
    const gameState = room.getGameState();
    if (!gameState) {
      this.sendError(socket, ErrorCode.INVALID_GAME_STATE, 'No active game');
      return;
    }
    
    // Enviar snapshot
    this.send(socket, {
      type: ServerMessageType.GAME_STATE_SNAPSHOT,
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
  private send(socket: Socket, message: ServerMessage): void {
    socket.emit('message', message);
  }

  /**
   * Broadcast a toda una sala
   */
  private broadcastToRoom(roomId: RoomId, message: ServerMessage): void {
    this.io.to(roomId).emit('message', message);
  }

  /**
   * Broadcast a una sala excepto un socket
   */
  private broadcastToRoomExcept(roomId: RoomId, socketId: string, message: ServerMessage): void {
    this.io.to(roomId).except(socketId).emit('message', message);
  }

  /**
   * Envía error a un socket
   */
  private sendError(socket: Socket, code: ErrorCode, message: string, details?: any): void {
    this.send(socket, {
      type: ServerMessageType.ERROR,
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
  shutdown(): void {
    this.log('Shutting down SocketServer...');
    
    this.roomManager.shutdown();
    this.io.close();
    
    this.log('SocketServer shutdown complete');
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================

  private log(message: string, data?: any): void {
    console.log(`[SocketServer] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}


