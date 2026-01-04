/**
 * JORUMI Server - Game Room
 * 
 * Gestiona una partida individual con su motor de reglas
 * Una sala = Una instancia de GameEngine
 */

import { GameEngine, GameState, GameAction, ActionResult, PlayerRole } from '../../../engine';
import type { RoomId, RoomPlayer, RoomConfig } from '../types/messages';
import { nanoid } from 'nanoid';

/**
 * Estados de la sala
 */
export enum RoomStatus {
  WAITING = 'WAITING',       // Esperando jugadores
  STARTING = 'STARTING',     // Iniciando partida
  IN_PROGRESS = 'IN_PROGRESS', // Partida en curso
  FINISHED = 'FINISHED',     // Partida terminada
  ABANDONED = 'ABANDONED',   // Sala abandonada
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
export class GameRoom {
  public readonly id: RoomId;
  private engine: GameEngine;
  private players: Map<string, RoomPlayer> = new Map();
  private status: RoomStatus = RoomStatus.WAITING;
  private config: Required<GameRoomOptions>;
  private createdAt: number;
  private lastActivityAt: number;

  constructor(id: RoomId, options: GameRoomOptions = {}) {
    this.id = id;
    this.config = {
      maxPlayers: options.maxPlayers ?? 2,
      isPrivate: options.isPrivate ?? false,
      gameSeed: options.gameSeed ?? Math.floor(Math.random() * 1000000),
      enableLogging: options.enableLogging ?? true,
    };
    
    // Crear motor de reglas
    this.engine = new GameEngine({
      enableLogging: this.config.enableLogging,
      enableHistory: true,
    });
    
    this.createdAt = Date.now();
    this.lastActivityAt = Date.now();
    
    this.log('Room created', { id: this.id, config: this.config });
  }

  // ==========================================================================
  // GESTIÓN DE JUGADORES
  // ==========================================================================

  /**
   * Agrega un jugador a la sala
   */
  addPlayer(playerId: string, playerName: string, connectionId: string): RoomPlayer | null {
    this.lastActivityAt = Date.now();
    
    // Verificar si la sala está llena
    if (this.players.size >= this.config.maxPlayers) {
      this.log('Cannot add player - room full', { playerId, currentPlayers: this.players.size });
      return null;
    }
    
    // Verificar si la partida ya comenzó
    if (this.status === RoomStatus.IN_PROGRESS) {
      this.log('Cannot add player - game in progress', { playerId });
      return null;
    }
    
    // Crear jugador
    const player: RoomPlayer = {
      id: playerId,
      name: playerName,
      isReady: false,
      connectionId,
      connectedAt: Date.now(),
    };
    
    this.players.set(playerId, player);
    this.log('Player added', { playerId, playerName, totalPlayers: this.players.size });
    
    // Si se alcanzó el máximo de jugadores, iniciar partida
    if (this.players.size === this.config.maxPlayers) {
      this.startGame();
    }
    
    return player;
  }

  /**
   * Remueve un jugador de la sala
   */
  removePlayer(playerId: string): boolean {
    this.lastActivityAt = Date.now();
    
    const existed = this.players.delete(playerId);
    
    if (existed) {
      this.log('Player removed', { playerId, remainingPlayers: this.players.size });
      
      // Si no quedan jugadores, marcar como abandonada
      if (this.players.size === 0) {
        this.status = RoomStatus.ABANDONED;
        this.log('Room abandoned - no players left');
      }
    }
    
    return existed;
  }

  /**
   * Obtiene un jugador por ID
   */
  getPlayer(playerId: string): RoomPlayer | undefined {
    return this.players.get(playerId);
  }

  /**
   * Obtiene todos los jugadores
   */
  getAllPlayers(): RoomPlayer[] {
    return Array.from(this.players.values());
  }

  /**
   * Verifica si un jugador está en la sala
   */
  hasPlayer(playerId: string): boolean {
    return this.players.has(playerId);
  }

  // ==========================================================================
  // GESTIÓN DE PARTIDA
  // ==========================================================================

  /**
   * Inicia la partida
   * CRÍTICO: Ejecuta el motor de reglas en el servidor
   */
  private startGame(): void {
    if (this.status !== RoomStatus.WAITING) {
      this.log('Cannot start game - invalid status', { status: this.status });
      return;
    }
    
    this.status = RoomStatus.STARTING;
    this.log('Starting game...');
    
    // Asignar roles a jugadores
    this.assignRoles();
    
    // Obtener nombres de jugadores en orden
    const playerNames = this.getAllPlayers().map(p => p.name);
    
    // Iniciar motor de reglas
    const gameState = this.engine.startGame({
      playerNames,
      seed: this.config.gameSeed,
    });
    
    this.status = RoomStatus.IN_PROGRESS;
    this.lastActivityAt = Date.now();
    
    this.log('Game started', {
      gameId: gameState.gameId,
      players: playerNames,
      seed: this.config.gameSeed,
    });
  }

  /**
   * Asigna roles a jugadores
   * En JORUMI: primer jugador = HUMAN, segundo = ALIEN
   */
  private assignRoles(): void {
    const players = this.getAllPlayers();
    
    if (players.length >= 1) {
      players[0].role = PlayerRole.HUMAN;
    }
    
    if (players.length >= 2) {
      players[1].role = PlayerRole.ALIEN;
    }
    
    this.log('Roles assigned', {
      players: players.map(p => ({ id: p.id, name: p.name, role: p.role }))
    });
  }

  /**
   * Aplica una acción de jugador
   * CRÍTICO: Ejecuta validación y reglas SOLO en el servidor
   */
  applyPlayerAction(playerId: string, action: GameAction): ActionResult {
    this.lastActivityAt = Date.now();
    
    // Verificar que la partida esté en curso
    if (this.status !== RoomStatus.IN_PROGRESS) {
      return {
        success: false,
        error: 'Game not in progress',
      };
    }
    
    // Verificar que el jugador esté en la sala
    const player = this.getPlayer(playerId);
    if (!player) {
      return {
        success: false,
        error: 'Player not in room',
      };
    }
    
    // Verificar que sea el turno del jugador
    const gameState = this.getGameState();
    if (gameState && gameState.currentPlayerId !== playerId) {
      return {
        success: false,
        error: 'Not your turn',
      };
    }
    
    // Validar acción con el motor
    const validation = this.engine.validateAction(action);
    if (!validation.valid) {
      this.log('Action rejected', { playerId, action: action.type, reason: validation.reason });
      return {
        success: false,
        error: validation.reason,
      };
    }
    
    // Aplicar acción en el motor
    const result = this.engine.applyAction(action);
    
    if (result.success) {
      this.log('Action applied', {
        playerId,
        action: action.type,
        events: result.events?.length ?? 0,
      });
      
      // Verificar si el juego terminó
      if (result.newState?.gameOver) {
        this.status = RoomStatus.FINISHED;
        this.log('Game ended', {
          winner: result.newState.winner,
          condition: result.newState.victoryCondition,
        });
      }
    }
    
    return result;
  }

  /**
   * Obtiene el estado actual del juego
   */
  getGameState(): GameState | null {
    if (!this.engine.hasActiveGame()) {
      return null;
    }
    
    return this.engine.getState();
  }

  /**
   * Obtiene el rol de un jugador
   */
  getPlayerRole(playerId: string): PlayerRole | undefined {
    return this.players.get(playerId)?.role;
  }

  // ==========================================================================
  // INFORMACIÓN DE SALA
  // ==========================================================================

  /**
   * Obtiene el estado de la sala
   */
  getStatus(): RoomStatus {
    return this.status;
  }

  /**
   * Verifica si la sala está llena
   */
  isFull(): boolean {
    return this.players.size >= this.config.maxPlayers;
  }

  /**
   * Verifica si la sala está vacía
   */
  isEmpty(): boolean {
    return this.players.size === 0;
  }

  /**
   * Verifica si la partida está en curso
   */
  isGameInProgress(): boolean {
    return this.status === RoomStatus.IN_PROGRESS;
  }

  /**
   * Verifica si la sala debe ser eliminada
   */
  shouldBeDeleted(maxIdleTime: number = 3600000): boolean {
    const idleTime = Date.now() - this.lastActivityAt;
    return this.isEmpty() || this.status === RoomStatus.ABANDONED || idleTime > maxIdleTime;
  }

  /**
   * Obtiene información de la sala
   */
  getInfo() {
    return {
      id: this.id,
      status: this.status,
      playerCount: this.players.size,
      maxPlayers: this.config.maxPlayers,
      isPrivate: this.config.isPrivate,
      createdAt: this.createdAt,
      lastActivityAt: this.lastActivityAt,
      hasActiveGame: this.engine.hasActiveGame(),
    };
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================

  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[GameRoom ${this.id}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}

/**
 * Factory para crear salas
 */
export class GameRoomFactory {
  static create(options?: GameRoomOptions): GameRoom {
    const roomId = nanoid(10);
    return new GameRoom(roomId, options);
  }
  
  static createWithId(roomId: RoomId, options?: GameRoomOptions): GameRoom {
    return new GameRoom(roomId, options);
  }
}


