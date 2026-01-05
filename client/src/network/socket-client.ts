/**
 * JORUMI Client - WebSocket Client
 * 
 * Cliente WebSocket para comunicación con el servidor autoritativo
 * Diseñado para NO ejecutar reglas, solo enviar comandos y recibir estado
 */

import { io, Socket } from 'socket.io-client';
import { ClientMessageType } from '../../../server/src/types/messages';
import type { 
  ClientMessage,
  ServerMessage,
  ServerMessageType,
  RoomId,
  RoomPlayer,
} from '../../../server/src/types/messages';
import type { GameState, GameAction, GameEvent } from '@/types/game-types';

/**
 * Opciones del cliente
 */
export interface SocketClientOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

/**
 * Estados de conexión
 */
export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

/**
 * Información de la sala actual
 */
export interface RoomInfo {
  roomId: RoomId;
  playerId: string;
  playerName: string;
  players: RoomPlayer[];
  gameState: GameState | null;
}

/**
 * Callbacks de eventos
 */
export interface SocketClientCallbacks {
  // Conexión
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  
  // Sala
  onRoomCreated?: (roomId: RoomId, playerId: string) => void;
  onRoomJoined?: (info: RoomInfo) => void;
  onRoomLeft?: () => void;
  onPlayerJoined?: (player: RoomPlayer) => void;
  onPlayerLeft?: (playerId: string, playerName: string) => void;
  
  // Juego
  onGameStarted?: (gameState: GameState) => void;
  onGameStateUpdate?: (gameState: GameState, events: GameEvent[]) => void;
  onGameEnded?: (gameState: GameState) => void;
  
  // Acciones
  onActionApplied?: (action: GameAction, events: GameEvent[]) => void;
  onActionRejected?: (action: GameAction, reason: string) => void;
  
  // Eventos
  onDiceRolled?: (diceType: string, result: any) => void;
  onPhaseChanged?: (previousPhase: string, newPhase: string, turn: number) => void;
  
  // Errores
  onServerError?: (code: string, message: string) => void;
}

/**
 * SocketClient - Cliente WebSocket no autoritativo
 * 
 * PRINCIPIOS:
 * - NO ejecuta reglas del juego
 * - NO modifica GameState
 * - Solo envía comandos
 * - Solo recibe y renderiza estado del servidor
 * 
 * RESPONSABILIDADES:
 * - Gestionar conexión WebSocket
 * - Enviar acciones de jugador
 * - Recibir actualizaciones de estado
 * - Notificar eventos a la UI
 */
export class SocketClient {
  private socket: Socket | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private callbacks: SocketClientCallbacks = {};
  private options: Required<SocketClientOptions>;
  
  // Información de sala actual
  private currentRoom: RoomInfo | null = null;

  constructor(options: SocketClientOptions = {}) {
    this.options = {
      serverUrl: options.serverUrl ?? 'http://localhost:3001',
      autoConnect: options.autoConnect ?? false,
      reconnection: options.reconnection ?? true,
      reconnectionAttempts: options.reconnectionAttempts ?? 5,
      reconnectionDelay: options.reconnectionDelay ?? 1000,
    };
  }

  // ==========================================================================
  // CONEXIÓN
  // ==========================================================================

  /**
   * Conecta al servidor
   */
  connect(): void {
    if (this.socket?.connected) {
      console.warn('[SocketClient] Already connected');
      return;
    }
    
    this.status = ConnectionStatus.CONNECTING;
    
    this.socket = io(this.options.serverUrl, {
      autoConnect: true,
      reconnection: this.options.reconnection,
      reconnectionAttempts: this.options.reconnectionAttempts,
      reconnectionDelay: this.options.reconnectionDelay,
      transports: ['websocket', 'polling'], // Intentar websocket primero, luego polling
      upgrade: false, // No intentar upgrade durante la conexión
      timeout: 20000, // 20 segundos de timeout
      forceNew: true, // Forzar nueva conexión
    });
    
    this.setupEventHandlers();
    
    console.log('[SocketClient] Connecting to', this.options.serverUrl);
  }

  /**
   * Desconecta del servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.status = ConnectionStatus.DISCONNECTED;
    this.currentRoom = null;
    
    console.log('[SocketClient] Disconnected');
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Obtiene el estado de conexión
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  // ==========================================================================
  // CONFIGURACIÓN DE EVENTOS
  // ==========================================================================

  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    // Eventos de conexión
    this.socket.on('connect', () => this.handleConnect());
    this.socket.on('disconnect', (reason) => this.handleDisconnect(reason));
    this.socket.on('connect_error', (error) => this.handleError(error));
    
    // Eventos de mensajes del servidor
    this.socket.on('message', (message: ServerMessage) => this.handleMessage(message));
  }

  private handleConnect(): void {
    this.status = ConnectionStatus.CONNECTED;
    console.log('[SocketClient] Connected');
    
    this.callbacks.onConnect?.();
  }

  private handleDisconnect(reason: string): void {
    this.status = ConnectionStatus.DISCONNECTED;
    this.currentRoom = null;
    console.log('[SocketClient] Disconnected:', reason);
    
    this.callbacks.onDisconnect?.(reason);
  }

  private handleError(error: Error): void {
    this.status = ConnectionStatus.ERROR;
    console.error('[SocketClient] Error:', error);
    
    this.callbacks.onError?.(error);
  }

  private handleMessage(message: ServerMessage): void {
    console.log('[SocketClient] Message received:', message.type);
    
    // Enrutar mensaje según tipo
    switch (message.type) {
      case 'ROOM_CREATED':
        this.handleRoomCreated(message);
        break;
        
      case 'ROOM_JOINED':
        this.handleRoomJoined(message);
        break;
        
      case 'ROOM_LEFT':
        this.handleRoomLeft(message);
        break;
        
      case 'PLAYER_JOINED':
        this.handlePlayerJoined(message);
        break;
        
      case 'PLAYER_LEFT':
        this.handlePlayerLeft(message);
        break;
        
      case 'PLAYER_ROLE_ASSIGNED':
        this.handlePlayerRoleAssigned(message);
        break;
        
      case 'GAME_STARTED':
        this.handleGameStarted(message);
        break;
        
      case 'GAME_STATE_UPDATE':
        this.handleGameStateUpdate(message);
        break;
        
      case 'GAME_STATE_SNAPSHOT':
        this.handleGameStateSnapshot(message);
        break;
        
      case 'GAME_ENDED':
        this.handleGameEnded(message);
        break;
        
      case 'ACTION_APPLIED':
        this.handleActionApplied(message);
        break;
        
      case 'ACTION_REJECTED':
        this.handleActionRejected(message);
        break;
        
      case 'DICE_ROLLED':
        this.handleDiceRolled(message);
        break;
        
      case 'PHASE_CHANGED':
        this.handlePhaseChanged(message);
        break;
        
      case 'ERROR':
        this.handleServerError(message);
        break;
        
      default:
        console.warn('[SocketClient] Unknown message type:', (message as any).type);
    }
  }

  // ==========================================================================
  // HANDLERS DE MENSAJES ESPECÍFICOS
  // ==========================================================================

  private handleRoomCreated(message: any): void {
    this.currentRoom = {
      roomId: message.roomId,
      playerId: message.playerId,
      playerName: message.playerName,
      players: [],
      gameState: null,
    };
    
    this.callbacks.onRoomCreated?.(message.roomId, message.playerId);
  }

  private handleRoomJoined(message: any): void {
    this.currentRoom = {
      roomId: message.roomId,
      playerId: message.playerId,
      playerName: message.playerName,
      players: message.players,
      gameState: message.gameState,
    };
    
    this.callbacks.onRoomJoined?.(this.currentRoom);
  }

  private handleRoomLeft(message: any): void {
    this.currentRoom = null;
    this.callbacks.onRoomLeft?.();
  }

  private handlePlayerJoined(message: any): void {
    if (this.currentRoom) {
      this.currentRoom.players.push(message.player);
    }
    
    this.callbacks.onPlayerJoined?.(message.player);
  }

  private handlePlayerLeft(message: any): void {
    if (this.currentRoom) {
      this.currentRoom.players = this.currentRoom.players.filter(
        p => p.id !== message.playerId
      );
    }
    
    this.callbacks.onPlayerLeft?.(message.playerId, message.playerName);
  }

  private handlePlayerRoleAssigned(message: any): void {
    console.log('[SocketClient] Player role assigned:', message.playerId, message.role);
    // TODO: Actualizar el rol del jugador en la UI si es necesario
    // Por ahora solo lo logueamos
  }

  private handleGameStarted(message: any): void {
    if (this.currentRoom) {
      this.currentRoom.gameState = message.gameState;
    }
    
    this.callbacks.onGameStarted?.(message.gameState);
  }

  private handleGameStateUpdate(message: any): void {
    if (this.currentRoom) {
      this.currentRoom.gameState = message.gameState;
    }
    
    this.callbacks.onGameStateUpdate?.(message.gameState, message.events);
  }

  private handleGameStateSnapshot(message: any): void {
    if (this.currentRoom) {
      this.currentRoom.gameState = message.gameState;
    }
    
    // Tratar como update
    this.callbacks.onGameStateUpdate?.(message.gameState, []);
  }

  private handleGameEnded(message: any): void {
    if (this.currentRoom) {
      this.currentRoom.gameState = message.gameState;
    }
    
    this.callbacks.onGameEnded?.(message.gameState);
  }

  private handleActionApplied(message: any): void {
    this.callbacks.onActionApplied?.(message.action, message.events);
  }

  private handleActionRejected(message: any): void {
    console.warn('[SocketClient] Action rejected:', message.reason);
    this.callbacks.onActionRejected?.(message.action, message.reason);
  }

  private handleDiceRolled(message: any): void {
    this.callbacks.onDiceRolled?.(message.diceType, message.result);
  }

  private handlePhaseChanged(message: any): void {
    this.callbacks.onPhaseChanged?.(message.previousPhase, message.newPhase, message.turn);
  }

  private handleServerError(message: any): void {
    console.error('[SocketClient] Server error:', message.code, message.message);
    this.callbacks.onServerError?.(message.code, message.message);
  }

  // ==========================================================================
  // API PÚBLICA - ENVÍO DE MENSAJES
  // ==========================================================================

  /**
   * Crea una nueva sala
   */
  createRoom(playerName: string, roomConfig?: any): void {
    console.log('[SocketClient] Creating room with player:', playerName);
    
    if (!this.socket?.connected) {
      console.error('[SocketClient] Cannot create room - not connected');
      return;
    }
    
    const message: ClientMessage = {
      type: ClientMessageType.CREATE_ROOM,
      playerName,
      roomConfig,
    } as any;
    
    console.log('[SocketClient] Sending CREATE_ROOM message:', message);
    this.send(message);
  }

  /**
   * Se une a una sala existente
   */
  joinRoom(roomId: RoomId, playerName: string): void {
    this.send({
      type: ClientMessageType.JOIN_ROOM,
      roomId,
      playerName,
    } as ClientMessage);
  }

  /**
   * Abandona la sala actual
   */
  leaveRoom(): void {
    if (!this.currentRoom) {
      console.warn('[SocketClient] Not in a room');
      return;
    }
    
    this.send({
      type: ClientMessageType.LEAVE_ROOM,
      roomId: this.currentRoom.roomId,
    } as ClientMessage);
  }

  /**
   * Inicia el juego (solo host)
   */
  startGame(): void {
    if (!this.currentRoom) {
      console.warn('[SocketClient] Not in a room');
      return;
    }
    
    console.log('[SocketClient] Requesting to start game in room:', this.currentRoom.roomId);
    
    this.send({
      type: ClientMessageType.START_GAME,
      roomId: this.currentRoom.roomId,
    } as ClientMessage);
  }

  /**
   * Envía una acción de jugador al servidor
   * CRÍTICO: El servidor validará y ejecutará la acción
   */
  sendAction(action: GameAction): void {
    if (!this.currentRoom) {
      console.warn('[SocketClient] Not in a room');
      return;
    }
    
    this.send({
      type: ClientMessageType.PLAYER_ACTION,
      roomId: this.currentRoom.roomId,
      action,
    } as ClientMessage);
  }

  /**
   * Solicita snapshot completo del estado (reconexión)
   */
  requestSnapshot(): void {
    if (!this.currentRoom) {
      console.warn('[SocketClient] Not in a room');
      return;
    }
    
    this.send({
      type: ClientMessageType.REQUEST_SNAPSHOT,
      roomId: this.currentRoom.roomId,
    } as ClientMessage);
  }

  /**
   * Envía mensaje al servidor
   */
  private send(message: ClientMessage): void {
    if (!this.socket?.connected) {
      console.error('[SocketClient] Cannot send - not connected');
      return;
    }
    
    console.log('[SocketClient] Emitting message:', message.type);
    this.socket.emit('message', message);
  }

  // ==========================================================================
  // CALLBACKS
  // ==========================================================================

  /**
   * Registra callbacks de eventos
   */
  on(callbacks: Partial<SocketClientCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Remueve todos los callbacks
   */
  clearCallbacks(): void {
    this.callbacks = {};
  }

  // ==========================================================================
  // INFORMACIÓN
  // ==========================================================================

  /**
   * Obtiene información de la sala actual
   */
  getCurrentRoom(): RoomInfo | null {
    return this.currentRoom;
  }

  /**
   * Obtiene el estado del juego actual
   */
  getCurrentGameState(): GameState | null {
    return this.currentRoom?.gameState ?? null;
  }

  /**
   * Obtiene el ID del jugador actual
   */
  getPlayerId(): string | null {
    return this.currentRoom?.playerId ?? null;
  }

  /**
   * Verifica si está en una sala
   */
  isInRoom(): boolean {
    return this.currentRoom !== null;
  }
}

/**
 * Instancia singleton del cliente (opcional)
 */
let clientInstance: SocketClient | null = null;

export function getSocketClient(options?: SocketClientOptions): SocketClient {
  if (!clientInstance) {
    clientInstance = new SocketClient(options);
  }
  return clientInstance;
}

export function createSocketClient(options?: SocketClientOptions): SocketClient {
  return new SocketClient(options);
}



