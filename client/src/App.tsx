/**
 * JORUMI - Main Application Component
 * 
 * ARQUITECTURA DE INTEGRACIÓN (MULTIPLAYER):
 * 
 * App
 *  ├─ Network Connection (conecta al servidor)
 *  ├─ Start Menu (si no hay juego)
 *  └─ Game (si hay juego activo)
 *      ├─ GameScene (Three.js / R3F)
 *      │   └─ GameBoard (lee GameState del servidor)
 *      └─ UI Overlay
 *          ├─ GameHUD
 *          └─ CharacterPanel
 * 
 * FLUJO DE DATOS (Cliente-Servidor):
 * 1. Usuario interactúa con UI o escena 3D
 * 2. Componente dispara acción al network-store
 * 3. Network-store envía acción al servidor
 * 4. Servidor ejecuta GameEngine y valida
 * 5. Servidor retorna nuevo estado a todos los clientes
 * 6. Componentes re-renderizan con estado del servidor
 */

import { useNetworkStore } from './store/network-store';
import { GameScene } from './components/scene/GameScene';
import { GameHUD } from './components/ui/GameHUD';
import { CharacterPanel } from './components/ui/CharacterPanel';
import { StartMenu } from './components/ui/StartMenu';
import { RoomLobby } from './components/multiplayer/RoomLobby';

function App() {
  // Estado del juego (del servidor)
  const gameState = useNetworkStore((state) => state.gameState);
  const isConnected = useNetworkStore((state) => state.isConnected);
  const isInRoom = useNetworkStore((state) => state.isInRoom);
  
  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {!isConnected || !isInRoom ? (
        // No conectado o no en sala → mostrar menú
        <StartMenu />
      ) : !gameState ? (
        // En sala pero juego no iniciado → mostrar lobby
        <RoomLobby />
      ) : (
        // Juego activo → mostrar escena + UI
        <>
          {/* Escena 3D (fullscreen) */}
          <GameScene />
          
          {/* UI Overlay (sobre la escena) */}
          <GameHUD />
          <CharacterPanel />
        </>
      )}
    </div>
  );
}

export default App;



