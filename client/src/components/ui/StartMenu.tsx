/**
 * JORUMI - Start Menu
 * 
 * Menú inicial para conectar al servidor y unirse/crear partida
 */

import { useState } from 'react';
import { useNetworkStore } from '@/store/network-store';

export function StartMenu() {
  const [playerName, setPlayerName] = useState('Player 1');
  const [roomId, setRoomId] = useState('');
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  
  const connect = useNetworkStore((state) => state.connect);
  const createRoom = useNetworkStore((state) => state.createRoom);
  const joinRoom = useNetworkStore((state) => state.joinRoom);
  const isConnected = useNetworkStore((state) => state.isConnected);
  const connectionStatus = useNetworkStore((state) => state.connectionStatus);
  
  const handleCreateRoom = () => {
    if (!isConnected) {
      connect();
      setTimeout(() => createRoom(playerName), 1000);
    } else {
      createRoom(playerName);
    }
  };
  
  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    
    if (!isConnected) {
      connect();
      setTimeout(() => joinRoom(roomId, playerName), 1000);
    } else {
      joinRoom(roomId, playerName);
    }
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-jorumi-dark to-black bg-opacity-95">
      <div className="bg-jorumi-dark bg-opacity-90 text-white p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2 text-center">JORUMI</h1>
        <p className="text-gray-400 text-center mb-2">Multiplayer Strategy Game</p>
        
        {/* Connection Status */}
        <div className="text-center mb-6">
          <span className={`text-sm px-3 py-1 rounded ${
            isConnected ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {connectionStatus}
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Player name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-jorumi-primary focus:outline-none"
              placeholder="Enter your name"
            />
          </div>
          
          {/* Buttons */}
          <button
            onClick={handleCreateRoom}
            className="w-full bg-jorumi-primary hover:bg-blue-600 text-white px-6 py-3 rounded font-bold transition-colors"
          >
            Create New Room
          </button>
          
          <button
            onClick={() => setShowJoinRoom(!showJoinRoom)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded transition-colors"
          >
            Join Existing Room
          </button>
          
          {/* Join Room Form */}
          {showJoinRoom && (
            <div className="space-y-2 pt-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-jorumi-primary focus:outline-none"
                placeholder="Enter room ID"
              />
              <button
                onClick={handleJoinRoom}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors"
              >
                Join
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>Controls:</p>
          <p>Left Click: Select | Right Click: Camera | Scroll: Zoom</p>
        </div>
      </div>
    </div>
  );
}



