/**
 * JORUMI Client - Network Store
 * 
 * Store Zustand para gestión del estado de red y multiplayer
 * Integra SocketClient con la UI de React
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SocketClient, ConnectionStatus, RoomInfo, getSocketClient } from '../network/socket-client';
import type { GameState, GameAction, GameEvent } from '@/types/game-types';
import type { RoomPlayer } from '../../../server/src/types/messages';
import { config } from '../config/environment';

/**
 * Estado del store de red
 */
interface NetworkState {
  // Cliente WebSocket
  client: SocketClient;
  
  // Estado de conexión
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  
  // Información de sala
  roomInfo: RoomInfo | null;
  isInRoom: boolean;
  
  // Estado del juego (recibido del servidor)
  gameState: GameState | null;
  
  // Historial de eventos
  events: GameEvent[];
  
  // Errores y mensajes
  lastError: string | null;
  lastActionRejected: { action: GameAction; reason: string } | null;
  
  // Jugadores en la sala
  players: RoomPlayer[];
  
  // ID del jugador local
  playerId: string | null;
  playerName: string | null;
}

/**
 * Acciones del store de red
 */
interface NetworkActions {
  // Conexión
  connect: () => void;
  disconnect: () => void;
  
  // Sala
  createRoom: (playerName: string, roomConfig?: any) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;
  
  // Acciones de juego
  sendAction: (action: GameAction) => void;
  requestSnapshot: () => void;
  
  // Utilidades
  clearError: () => void;
  clearEvents: () => void;
}

/**
 * Store de red completo
 */
type NetworkStore = NetworkState & NetworkActions;

/**
 * Hook de store de red
 * 
 * IMPORTANTE:
 * - Este store recibe estado del servidor (autoritativo)
 * - NO ejecuta reglas del juego
 * - Solo refleja el estado oficial del servidor
 */
export const useNetworkStore = create<NetworkStore>()(
  devtools(
    (set, get) => {
      // Crear cliente WebSocket con configuración de entorno
      const client = getSocketClient({
        serverUrl: config.serverUrl,
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10, // Más intentos
        reconnectionDelay: 2000, // Más tiempo entre intentos
      });
      
      // Configurar callbacks
      client.on({
        // Conexión
        onConnect: () => {
          console.log('[NetworkStore] Connected');
          set({
            connectionStatus: ConnectionStatus.CONNECTED,
            isConnected: true,
            lastError: null,
          });
        },
        
        onDisconnect: (reason) => {
          console.log('[NetworkStore] Disconnected:', reason);
          set({
            connectionStatus: ConnectionStatus.DISCONNECTED,
            isConnected: false,
            roomInfo: null,
            isInRoom: false,
            gameState: null,
            players: [],
          });
        },
        
        onError: (error) => {
          console.error('[NetworkStore] Error:', error);
          set({
            connectionStatus: ConnectionStatus.ERROR,
            lastError: error.message,
          });
        },
        
        // Sala
        onRoomCreated: (roomId, playerId) => {
          console.log('[NetworkStore] Room created:', roomId);
          const playerName = get().playerName || 'Player';
          const player: RoomPlayer = {
            id: playerId,
            name: playerName,
            isReady: true,
            connectionId: playerId, // Provisional
            connectedAt: Date.now(),
          };
          set({
            roomInfo: {
              roomId,
              playerId,
              playerName,
              players: [player],
              gameState: null,
            },
            playerId,
            players: [player],
            isInRoom: true,
          });
        },
        
        onRoomJoined: (info) => {
          console.log('[NetworkStore] Room joined:', info.roomId);
          set({
            roomInfo: info,
            isInRoom: true,
            playerId: info.playerId,
            playerName: info.playerName,
            players: info.players,
            gameState: info.gameState,
          });
        },
        
        onRoomLeft: () => {
          console.log('[NetworkStore] Room left');
          set({
            roomInfo: null,
            isInRoom: false,
            gameState: null,
            players: [],
            events: [],
          });
        },
        
        onPlayerJoined: (player) => {
          console.log('[NetworkStore] Player joined:', player.name);
          set((state) => {
            const updatedPlayers = [...state.players, player];
            return {
              players: updatedPlayers,
              roomInfo: state.roomInfo ? {
                ...state.roomInfo,
                players: updatedPlayers,
              } : null,
            };
          });
        },
        
        onPlayerLeft: (playerId, playerName) => {
          console.log('[NetworkStore] Player left:', playerName);
          set((state) => {
            const updatedPlayers = state.players.filter(p => p.id !== playerId);
            return {
              players: updatedPlayers,
              roomInfo: state.roomInfo ? {
                ...state.roomInfo,
                players: updatedPlayers,
              } : null,
            };
          });
        },
        
        // Juego
        onGameStarted: (gameState) => {
          console.log('[NetworkStore] Game started');
          set({
            gameState,
            events: [],
          });
        },
        
        onGameStateUpdate: (gameState, events) => {
          console.log('[NetworkStore] Game state updated');
          set((state) => ({
            gameState,
            events: [...state.events, ...events],
          }));
        },
        
        onGameEnded: (gameState) => {
          console.log('[NetworkStore] Game ended');
          set({
            gameState,
          });
        },
        
        // Acciones
        onActionApplied: (action, events) => {
          console.log('[NetworkStore] Action applied:', action.type);
          set({
            lastActionRejected: null,
          });
        },
        
        onActionRejected: (action, reason) => {
          console.warn('[NetworkStore] Action rejected:', action.type, reason);
          set({
            lastActionRejected: { action, reason },
            lastError: `Action rejected: ${reason}`,
          });
        },
        
        // Eventos
        onDiceRolled: (diceType, result) => {
          console.log('[NetworkStore] Dice rolled:', diceType, result);
        },
        
        onPhaseChanged: (previousPhase, newPhase, turn) => {
          console.log('[NetworkStore] Phase changed:', previousPhase, '->', newPhase, 'Turn:', turn);
        },
        
        // Errores
        onServerError: (code, message) => {
          console.error('[NetworkStore] Server error:', code, message);
          set({
            lastError: `${code}: ${message}`,
          });
        },
      });
      
      return {
        // Estado inicial
        client,
        connectionStatus: ConnectionStatus.DISCONNECTED,
        isConnected: false,
        roomInfo: null,
        isInRoom: false,
        gameState: null,
        events: [],
        lastError: null,
        lastActionRejected: null,
        players: [],
        playerId: null,
        playerName: null,
        
        // Acciones
        connect: () => {
          const { client } = get();
          client.connect();
        },
        
        disconnect: () => {
          const { client } = get();
          client.disconnect();
        },
        
        createRoom: (playerName, roomConfig) => {
          const { client } = get();
          set({ playerName });
          client.createRoom(playerName, roomConfig);
        },
        
        joinRoom: (roomId, playerName) => {
          const { client } = get();
          set({ playerName });
          client.joinRoom(roomId, playerName);
        },
        
        leaveRoom: () => {
          const { client } = get();
          client.leaveRoom();
        },
        
        sendAction: (action) => {
          const { client } = get();
          client.sendAction(action);
        },
        
        requestSnapshot: () => {
          const { client } = get();
          client.requestSnapshot();
        },
        
        clearError: () => {
          set({ lastError: null, lastActionRejected: null });
        },
        
        clearEvents: () => {
          set({ events: [] });
        },
      };
    },
    {
      name: 'network-store',
    }
  )
);

/**
 * Selectores útiles
 */
export const selectIsConnected = (state: NetworkStore) => state.isConnected;
export const selectIsInRoom = (state: NetworkStore) => state.isInRoom;
export const selectGameState = (state: NetworkStore) => state.gameState;
export const selectPlayerId = (state: NetworkStore) => state.playerId;
export const selectPlayers = (state: NetworkStore) => state.players;
export const selectRoomInfo = (state: NetworkStore) => state.roomInfo;
export const selectLastError = (state: NetworkStore) => state.lastError;
export const selectEvents = (state: NetworkStore) => state.events;

/**
 * Hook para detectar si es el turno del jugador local
 */
export const useIsMyTurn = () => {
  return useNetworkStore((state) => {
    if (!state.gameState || !state.playerId) return false;
    return state.gameState.currentPlayerId === state.playerId;
  });
};

/**
 * Hook para obtener el rol del jugador local
 */
export const useMyRole = () => {
  return useNetworkStore((state) => {
    if (!state.playerId || !state.players.length) return null;
    const me = state.players.find(p => p.id === state.playerId);
    return me?.role ?? null;
  });
};



