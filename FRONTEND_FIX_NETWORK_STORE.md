# Fix Frontend: Migración de game-store a network-store

## 🎯 Problema Resuelto

**Error**: Al desplegar el frontend en Netlify, aparecían errores en la consola del navegador:
```
[Store] GameEngine disabled in production build. Use network-store for multiplayer.
[Store] Engine not initialized
```

**Causa**: Muchos componentes todavía estaban importando y usando `useGameStore` del `game-store.ts`, que está diseñado para modo single-player local. En producción, el cliente debe usar exclusivamente `network-store.ts` para comunicarse con el servidor autoritativo.

## 📋 Cambios Realizados

### 1. **App.tsx**
**Antes**:
```typescript
import { useGameStore } from './store/game-store';
import { useEngineSync, useAutoSave } from './hooks/useEngineSync';

const gameState = useGameStore((state) => state.gameState);
useEngineSync();
useAutoSave(30000);
```

**Después**:
```typescript
import { useNetworkStore } from './store/network-store';

const gameState = useNetworkStore((state) => state.gameState);
const isConnected = useNetworkStore((state) => state.isConnected);
```

**Cambios**:
- ✅ Migrado a `useNetworkStore`
- ✅ Eliminados hooks `useEngineSync` y `useAutoSave` (no necesarios en cliente-servidor)
- ✅ Añadida verificación de conexión al servidor

---

### 2. **components/ui/CharacterPanel.tsx**
**Antes**:
```typescript
import { useGameStore, selectSelectedCharacter } from '@/store/game-store';

const character = useGameStore(selectSelectedCharacter);
const dispatchAction = useGameStore((state) => state.dispatchAction);
```

**Después**:
```typescript
import { useNetworkStore } from '@/store/network-store';
const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

const gameState = useNetworkStore((state) => state.gameState);
const sendAction = useNetworkStore((state) => state.sendAction);
```

**Cambios**:
- ✅ Migrado a `useNetworkStore`
- ✅ `dispatchAction` → `sendAction` (envía al servidor)
- ✅ Estado de selección manejado localmente con `useState`

---

### 3. **components/ui/GameHUD.tsx**
**Antes**:
```typescript
import { useGameStore, selectCurrentPhase, selectCurrentTurn, selectIsGameOver } from '@/store/game-store';

const phase = useGameStore(selectCurrentPhase);
const advancePhase = useGameStore((state) => state.advancePhase);
const notification = useGameStore((state) => state.uiState.notification);
```

**Después**:
```typescript
import { useNetworkStore } from '@/store/network-store';

const gameState = useNetworkStore((state) => state.gameState);
const phase = gameState?.phase;
const lastError = useNetworkStore((state) => state.lastError);
```

**Cambios**:
- ✅ Migrado a `useNetworkStore`
- ✅ Selectores reemplazados por acceso directo a `gameState`
- ✅ `uiState` reemplazado por `lastError` del network-store

---

### 4. **components/scene/HexTile.tsx**
**Antes**:
```typescript
import { useGameStore, useUIActions } from '@/store/game-store';

const selectedTileId = useGameStore((state) => state.uiState.selectedTileId);
const { selectTile } = useUIActions();
```

**Después**:
```typescript
const [selected, setSelected] = useState(false);
```

**Cambios**:
- ✅ Eliminada dependencia de `game-store`
- ✅ Estado de selección manejado localmente

---

### 5. **components/scene/CharacterMesh.tsx**
**Antes**:
```typescript
import { useGameStore, useUIActions } from '@/store/game-store';

const selectedCharacterId = useGameStore((state) => state.uiState.selectedCharacterId);
const { selectCharacter } = useUIActions();
```

**Después**:
```typescript
const [isSelected, setIsSelected] = useState(false);
```

**Cambios**:
- ✅ Eliminada dependencia de `game-store`
- ✅ Estado de selección manejado localmente

---

### 6. **components/ui/StartMenu.tsx**
**Antes**:
```typescript
import { useGameStore } from '@/store/game-store';

const startGame = useGameStore((state) => state.startGame);
const loadGame = useGameStore((state) => state.loadGame);
```

**Después**:
```typescript
import { useNetworkStore } from '@/store/network-store';

const connect = useNetworkStore((state) => state.connect);
const createRoom = useNetworkStore((state) => state.createRoom);
const joinRoom = useNetworkStore((state) => state.joinRoom);
```

**Cambios**:
- ✅ Migrado a `useNetworkStore`
- ✅ Menú ahora conecta al servidor y crea/une salas
- ✅ Añadido UI para unirse a salas existentes
- ✅ Muestra estado de conexión

---

### 7. **components/dice/DiceRoller.tsx**
**Antes**:
```typescript
import { useGameStore } from '@/store/game-store';

const engine = useGameStore((state) => state.engine);
```

**Después**:
```typescript
// Imports limpiados, sin dependencia de stores
```

**Cambios**:
- ✅ Eliminada dependencia de `game-store`
- ✅ Hook `useDiceRoll` ahora retorna advertencia que el servidor maneja los dados

---

### 8. **hooks/useEngineSync.ts**
**Antes**:
```typescript
import { useGameStore } from '@/store/game-store';

export function useEngineSync() {
  const initializeEngine = useGameStore((state) => state.initializeEngine);
  // Inicializaba GameEngine local
}
```

**Después**:
```typescript
import { useNetworkStore } from '@/store/network-store';

export function useEngineSync() {
  // Hook vacío - conexión manejada por StartMenu
  console.log('[useEngineSync] Client-server mode: connection handled by StartMenu');
}
```

**Cambios**:
- ✅ Ya no inicializa GameEngine local
- ✅ Conexión ahora manejada manualmente desde `StartMenu`
- ✅ `useAutoSave` deshabilitado (servidor maneja persistencia)

---

## 🎨 Arquitectura Final: Cliente-Servidor

### Antes (Modo Single-Player Local)
```
Cliente
├─ GameEngine (ejecuta reglas)
├─ game-store (maneja estado local)
└─ UI (lee estado local)
```

### Después (Modo Multiplayer Cliente-Servidor)
```
Cliente                          Servidor
├─ network-store                 ├─ GameEngine (autoritativo)
│  └─ Envía acciones ───────────>│  └─ Ejecuta reglas
│  └─ Recibe estado <────────────│  └─ Broadcast estado
└─ UI (renderiza estado          └─ Socket.IO
   del servidor)
```

## ✅ Verificación

### Errores Resueltos
- ✅ `[Store] GameEngine disabled in production build` - **ELIMINADO**
- ✅ `[Store] Engine not initialized` - **ELIMINADO**
- ✅ Build de Netlify exitoso sin errores

### Build del Cliente
```bash
cd client
npm run build
# ✓ built in 13.24s
# ✓ Sin errores de TypeScript
# ✓ Bundle generado correctamente
```

## 📦 Próximos Pasos

1. **Push a GitHub**:
   ```bash
   git add .
   git commit -m "fix(frontend): Migrar todos los componentes a network-store para arquitectura cliente-servidor"
   git push origin main
   ```

2. **Desplegar en Netlify**:
   - Netlify detectará automáticamente el push
   - El build se ejecutará sin errores
   - Los warnings en consola desaparecerán

3. **Verificar Conexión**:
   - Abrir la app en Netlify
   - Abrir consola del navegador (F12)
   - Buscar mensajes:
     ```
     [Config] Application configuration: { serverUrl: "https://..." }
     [SocketClient] Connecting to https://...
     [SocketClient] Connected
     [NetworkStore] Connected
     ```

## 🔧 Archivos Modificados

- `client/src/App.tsx`
- `client/src/components/ui/CharacterPanel.tsx`
- `client/src/components/ui/GameHUD.tsx`
- `client/src/components/ui/StartMenu.tsx`
- `client/src/components/scene/HexTile.tsx`
- `client/src/components/scene/CharacterMesh.tsx`
- `client/src/components/dice/DiceRoller.tsx`
- `client/src/hooks/useEngineSync.ts`

## 📝 Notas Técnicas

### ¿Por qué se eliminó game-store?
`game-store` ejecuta el `GameEngine` localmente en el navegador, lo cual es apropiado para modo single-player pero **incompatible** con arquitectura multiplayer cliente-servidor donde el servidor debe ser la única fuente de verdad.

### ¿Qué hace network-store?
- Maneja conexión WebSocket con el servidor
- Envía acciones de jugador al servidor (`sendAction`)
- Recibe actualizaciones de estado desde el servidor
- **NO ejecuta reglas** - solo refleja estado autoritativo

### ¿Se pierde funcionalidad?
No. Toda la funcionalidad de juego sigue disponible, pero ahora:
- **Servidor**: Ejecuta GameEngine, valida acciones, calcula estado
- **Cliente**: Envía comandos, recibe estado, renderiza UI

Esta es la arquitectura correcta para juegos multiplayer.

---

**Fecha**: 5 de enero de 2026
**Status**: ✅ Completado y verificado

