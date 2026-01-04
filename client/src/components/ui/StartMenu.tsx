/**
 * JORUMI - Start Menu
 * 
 * Menú inicial para configurar y empezar partida
 */

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';

export function StartMenu() {
  const [playerName, setPlayerName] = useState('Player 1');
  const startGame = useGameStore((state) => state.startGame);
  const loadGame = useGameStore((state) => state.loadGame);
  
  const handleStartGame = () => {
    startGame([playerName, 'Alien'], Date.now());
  };
  
  const handleLoadGame = () => {
    const saved = localStorage.getItem('jorumi-autosave');
    if (saved) {
      loadGame(saved);
    } else {
      alert('No saved game found');
    }
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-jorumi-dark to-black bg-opacity-95">
      <div className="bg-jorumi-dark bg-opacity-90 text-white p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2 text-center">JORUMI</h1>
        <p className="text-gray-400 text-center mb-8">Survival Strategy Game</p>
        
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
            onClick={handleStartGame}
            className="w-full bg-jorumi-primary hover:bg-blue-600 text-white px-6 py-3 rounded font-bold transition-colors"
          >
            New Game
          </button>
          
          <button
            onClick={handleLoadGame}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded transition-colors"
          >
            Load Game
          </button>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>Controls:</p>
          <p>Left Click: Select | Right Click: Camera | Scroll: Zoom</p>
        </div>
      </div>
    </div>
  );
}



