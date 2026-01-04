/**
 * JORUMI - Engine Sync Hook
 * 
 * Hook que sincroniza el motor de reglas con React
 * Maneja el ciclo de vida del motor y la sincronización de estado
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/game-store';

/**
 * Hook principal para inicializar y sincronizar el motor
 * 
 * Uso:
 * ```tsx
 * function App() {
 *   useEngineSync();
 *   // ... resto del componente
 * }
 * ```
 */
export function useEngineSync() {
  const initializeEngine = useGameStore((state) => state.initializeEngine);
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!initialized.current) {
      initializeEngine({
        enableLogging: true,
      });
      initialized.current = true;
    }
  }, [initializeEngine]);
}

/**
 * Hook para auto-save periódico
 */
export function useAutoSave(intervalMs: number = 30000) {
  const saveGame = useGameStore((state) => state.saveGame);
  const gameState = useGameStore((state) => state.gameState);
  
  useEffect(() => {
    if (!gameState) return;
    
    const interval = setInterval(() => {
      const saved = saveGame();
      if (saved) {
        localStorage.setItem('jorumi-autosave', saved);
        console.log('[AutoSave] Game saved');
      }
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [gameState, saveGame, intervalMs]);
}


