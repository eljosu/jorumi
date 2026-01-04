/**
 * JORUMI Client - Multiplayer Lobby
 * 
 * Componente de lobby para crear/unirse a partidas online
 */

import React, { useState, useEffect } from 'react';
import { useNetworkStore, selectIsConnected, selectIsInRoom, selectRoomInfo, selectPlayers } from '../../store/network-store';

export const MultiplayerLobby: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  
  const isConnected = useNetworkStore(selectIsConnected);
  const isInRoom = useNetworkStore(selectIsInRoom);
  const roomInfo = useNetworkStore(selectRoomInfo);
  const players = useNetworkStore(selectPlayers);
  
  const connect = useNetworkStore((state) => state.connect);
  const disconnect = useNetworkStore((state) => state.disconnect);
  const createRoom = useNetworkStore((state) => state.createRoom);
  const joinRoom = useNetworkStore((state) => state.joinRoom);
  const leaveRoom = useNetworkStore((state) => state.leaveRoom);

  useEffect(() => {
    // Auto-conectar al montar
    if (!isConnected) {
      connect();
    }
    
    return () => {
      // Limpiar al desmontar
      if (isInRoom) {
        leaveRoom();
      }
    };
  }, []);

  const handleCreateRoom = () => {
    if (playerName.trim().length === 0) {
      alert('Please enter your name');
      return;
    }
    
    createRoom(playerName, {
      maxPlayers: 2,
      isPrivate: false,
    });
  };

  const handleJoinRoom = () => {
    if (playerName.trim().length === 0) {
      alert('Please enter your name');
      return;
    }
    
    if (roomId.trim().length === 0) {
      alert('Please enter room ID');
      return;
    }
    
    joinRoom(roomId, playerName);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setMode('menu');
  };

  // Si está en una sala, mostrar sala de espera
  if (isInRoom && roomInfo) {
    return (
      <div className="multiplayer-lobby">
        <div className="lobby-container">
          <h2>Room: {roomInfo.roomId}</h2>
          
          <div className="room-info">
            <p>Share this Room ID with your friend:</p>
            <div className="room-id-display">
              <code>{roomInfo.roomId}</code>
              <button
                onClick={() => navigator.clipboard.writeText(roomInfo.roomId)}
                className="btn-copy"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="players-list">
            <h3>Players ({players.length}/2)</h3>
            {players.map((player) => (
              <div key={player.id} className="player-item">
                <span className="player-name">{player.name}</span>
                {player.role && <span className="player-role">{player.role}</span>}
                {player.id === roomInfo.playerId && <span className="badge">You</span>}
              </div>
            ))}
          </div>
          
          {players.length === 2 && (
            <div className="game-starting">
              <p>Game starting...</p>
            </div>
          )}
          
          {players.length < 2 && (
            <div className="waiting">
              <p>Waiting for opponent...</p>
            </div>
          )}
          
          <button onClick={handleLeaveRoom} className="btn-leave">
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  // Menú principal
  if (mode === 'menu') {
    return (
      <div className="multiplayer-lobby">
        <div className="lobby-container">
          <h2>Multiplayer</h2>
          
          <div className="connection-status">
            {isConnected ? (
              <span className="status-connected">● Connected</span>
            ) : (
              <span className="status-disconnected">● Disconnected</span>
            )}
          </div>
          
          <div className="menu-options">
            <button
              onClick={() => setMode('create')}
              className="btn-primary"
              disabled={!isConnected}
            >
              Create Room
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="btn-primary"
              disabled={!isConnected}
            >
              Join Room
            </button>
          </div>
          
          {!isConnected && (
            <button onClick={connect} className="btn-reconnect">
              Reconnect
            </button>
          )}
        </div>
      </div>
    );
  }

  // Crear sala
  if (mode === 'create') {
    return (
      <div className="multiplayer-lobby">
        <div className="lobby-container">
          <h2>Create Room</h2>
          
          <div className="form-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>
          
          <div className="form-actions">
            <button onClick={handleCreateRoom} className="btn-primary">
              Create
            </button>
            <button onClick={() => setMode('menu')} className="btn-secondary">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unirse a sala
  if (mode === 'join') {
    return (
      <div className="multiplayer-lobby">
        <div className="lobby-container">
          <h2>Join Room</h2>
          
          <div className="form-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>
          
          <div className="form-group">
            <label>Room ID:</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
            />
          </div>
          
          <div className="form-actions">
            <button onClick={handleJoinRoom} className="btn-primary">
              Join
            </button>
            <button onClick={() => setMode('menu')} className="btn-secondary">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};



