/**
 * JORUMI - Network Sync Hook (Cliente-Servidor)
 * 
 * Hook que maneja la conexión con el servidor
 * En producción, el servidor ejecuta el GameEngine (autoritativo)
 */

import { useEffect, useRef } from 'react';
import { useNetworkStore } from '@/store/network-store';

/**
 * Hook para conectar automáticamente al servidor
 * 
 * NOTA: Ya no se usa en producción porque la conexión se maneja
 * desde el StartMenu cuando el usuario crea o une una sala
 */
export function useEngineSync() {
  // Este hook ahora está vacío en producción
  // La conexión se maneja manualmente desde StartMenu
  console.log('[useEngineSync] Client-server mode: connection handled by StartMenu');
}

/**
 * Hook para auto-save periódico
 * 
 * NOTA: En cliente-servidor, el servidor maneja el guardado
 * Este hook está deshabilitado en producción
 */
export function useAutoSave(intervalMs: number = 30000) {
  const gameState = useNetworkStore((state) => state.gameState);
  
  useEffect(() => {
    if (!gameState) return;
    
    console.log('[AutoSave] Client-server mode: server handles game state persistence');
    
    // En el futuro, aquí podrías implementar un guardado local
    // del estado para reconexión, pero el estado autoritativo
    // siempre está en el servidor
  }, [gameState, intervalMs]);
}



