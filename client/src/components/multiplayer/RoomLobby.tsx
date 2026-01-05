/**
 * JORUMI - Room Lobby
 * 
 * Sala de espera antes de iniciar el juego
 * Muestra jugadores conectados y permite iniciar partida
 */

import { useState } from 'react';
import { useNetworkStore } from '@/store/network-store';

export function RoomLobby() {
  const [copied, setCopied] = useState(false);
  
  const roomInfo = useNetworkStore((state) => state.roomInfo);
  const players = useNetworkStore((state) => state.players);
  const playerId = useNetworkStore((state) => state.playerId);
  const leaveRoom = useNetworkStore((state) => state.leaveRoom);
  const startGame = useNetworkStore((state) => state.startGame);
  const gameState = useNetworkStore((state) => state.gameState);
  
  if (!roomInfo) {
    return null;
  }
  
  // Si el juego ya empezó, no mostrar lobby
  if (gameState) {
    return null;
  }
  
  const isHost = players.length > 0 && players[0].id === playerId;
  const canStartGame = players.length >= 2; // Mínimo 2 jugadores
  
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomInfo.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleStartGame = () => {
    console.log('[RoomLobby] Start game button clicked');
    startGame();
  };
  
  const handleLeaveRoom = () => {
    if (confirm('Are you sure you want to leave the room?')) {
      leaveRoom();
    }
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-jorumi-dark to-black bg-opacity-95">
      <div className="bg-jorumi-dark bg-opacity-90 text-white p-8 rounded-lg shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🎮 Game Lobby</h1>
          <p className="text-gray-400">Waiting for players...</p>
        </div>
        
        {/* Room ID */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Room ID</p>
              <p className="text-2xl font-mono font-bold">{roomInfo.roomId}</p>
            </div>
            <button
              onClick={handleCopyRoomId}
              className={`px-4 py-2 rounded transition-colors ${
                copied 
                  ? 'bg-green-600 cursor-default' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy ID'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Share this ID with friends so they can join your game!
          </p>
        </div>
        
        {/* Players List */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            Players ({players.length}/4)
          </h2>
          
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="bg-gray-800 p-3 rounded flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* Player Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    player.id === playerId 
                      ? 'bg-blue-600' 
                      : 'bg-gray-600'
                  }`}>
                    {index === 0 ? '👑' : '👤'}
                  </div>
                  
                  {/* Player Info */}
                  <div>
                    <p className="font-bold">
                      {player.name}
                      {player.id === playerId && (
                        <span className="text-blue-400 ml-2">(You)</span>
                      )}
                      {index === 0 && (
                        <span className="text-yellow-400 ml-2">(Host)</span>
                      )}
                    </p>
                    {player.role && (
                      <p className="text-xs text-gray-400">
                        Role: {player.role}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-400">Ready</span>
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 4 - players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-gray-800 bg-opacity-50 p-3 rounded flex items-center gap-3 border-2 border-dashed border-gray-600"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">
                  ⏳
                </div>
                <p className="text-gray-500">Waiting for player...</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Game Info */}
        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">📖 How to Play</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Minimum 2 players to start</li>
            <li>• One player will be HUMAN, the other ALIEN</li>
            <li>• Work together to survive and escape!</li>
            <li>• Use the Room ID above to invite friends</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleLeaveRoom}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold transition-colors"
          >
            Leave Room
          </button>
          
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className={`flex-1 px-6 py-3 rounded font-bold transition-colors ${
                canStartGame
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canStartGame ? '🎮 Start Game' : 'Waiting for players...'}
            </button>
          )}
          
          {!isHost && (
            <div className="flex-1 bg-gray-700 px-6 py-3 rounded text-center">
              <p className="font-bold text-gray-300">Waiting for host to start...</p>
            </div>
          )}
        </div>
        
        {/* Player count warning */}
        {!canStartGame && (
          <p className="text-center text-yellow-400 text-sm mt-4">
            ⚠️ Need at least {2 - players.length} more player(s) to start
          </p>
        )}
      </div>
    </div>
  );
}

