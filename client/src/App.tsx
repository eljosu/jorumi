/**
 * JORUMI - Main Application Component
 * 
 * ARQUITECTURA DE INTEGRACIÓN:
 * 
 * App
 *  ├─ Engine Sync (inicialización del motor)
 *  ├─ Start Menu (si no hay juego)
 *  └─ Game (si hay juego activo)
 *      ├─ GameScene (Three.js / R3F)
 *      │   └─ GameBoard (lee GameState, renderiza 3D)
 *      └─ UI Overlay
 *          ├─ GameHUD
 *          └─ CharacterPanel
 * 
 * FLUJO DE DATOS:
 * 1. Usuario interactúa con UI o escena 3D
 * 2. Componente dispara acción al store
 * 3. Store valida y envía acción al motor
 * 4. Motor aplica reglas y retorna nuevo estado
 * 5. Store actualiza y notifica a React
 * 6. Componentes re-renderizan reactivamente
 */

import { useGameStore } from './store/game-store';
import { useEngineSync, useAutoSave } from './hooks/useEngineSync';
import { GameScene } from './components/scene/GameScene';
import { GameHUD } from './components/ui/GameHUD';
import { CharacterPanel } from './components/ui/CharacterPanel';
import { StartMenu } from './components/ui/StartMenu';

function App() {
  // Inicializar motor
  useEngineSync();
  
  // Auto-save cada 30 segundos
  useAutoSave(30000);
  
  // Estado del juego
  const gameState = useGameStore((state) => state.gameState);
  
  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {!gameState ? (
        // No hay juego activo → mostrar menú
        <StartMenu />
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



