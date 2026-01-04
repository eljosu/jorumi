# JORUMI - Cliente Web 3D

> Integración completa del motor de reglas con interfaz gráfica 3D usando React Three Fiber

---

## 🎮 Stack Tecnológico

- **React 18** - Framework de UI
- **TypeScript** - Type safety
- **Vite** - Build tool y dev server
- **Zustand** - State management (adaptador motor ↔ UI)
- **React Three Fiber** - Three.js en React
- **Drei** - Helpers para R3F
- **TailwindCSS** - Estilos
- **Motor JORUMI** - Lógica de reglas (importado como módulo)

---

## 📁 Arquitectura

```
┌─────────────────────────────────────────┐
│           UI Layer                      │
│  ┌──────────┐  ┌──────────┐            │
│  │ React UI │  │ Three.js │            │
│  └─────┬────┘  └────┬─────┘            │
│        │            │                   │
│        └────────┬───┘                   │
└─────────────────┼─────────────────────────┘
                  │
                  │ Actions
                  ▼
┌─────────────────────────────────────────┐
│      Zustand Store (Adapter)            │
│  • GameState del motor                  │
│  • UI State                             │
│  • History                              │
└─────────────────┼─────────────────────────┘
                  │
                  │ Actions → New State
                  ▼
┌─────────────────────────────────────────┐
│        Game Engine (Motor)              │
│  • Reglas puras                         │
│  • Determinismo                         │
│  • Sin dependencias de UI               │
└─────────────────────────────────────────┘
```

**Principio clave:** El motor es la ÚNICA fuente de verdad. La UI solo lee estado y dispara acciones.

Ver [INTEGRATION_ARCHITECTURE.md](./INTEGRATION_ARCHITECTURE.md) para detalles completos.

---

## 🚀 Setup

### Prerrequisitos

- Node.js >= 18
- npm >= 9

### Instalación

```bash
cd client
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

### Build para producción

```bash
npm run build
npm run preview
```

---

## 🎯 Uso

### Iniciar Juego

1. Al abrir la aplicación, verás el menú de inicio
2. Ingresa tu nombre
3. Click en "New Game"
4. El motor inicializa el estado del juego
5. La escena 3D renderiza el tablero basándose en `GameState`

### Controles

- **Left Click**: Seleccionar personaje/loseta
- **Right Click + Drag**: Rotar cámara
- **Scroll**: Zoom
- **Middle Click + Drag**: Pan

### Gameplay

1. **Seleccionar Personaje**: Click en una esfera (personaje)
2. **Mover**: Click en una loseta adyacente
3. **Acciones**: Usa el panel lateral para recolectar recursos, construir, etc.
4. **Avanzar Fase**: Click en "Advance Phase" cuando termines las acciones

---

## 📦 Estructura de Componentes

### Escena 3D (`/components/scene`)

#### `GameScene.tsx`
Canvas principal con cámara, luces y controles.

#### `GameBoard.tsx`
Lee `GameState` y renderiza todos los elementos:
- Losetas hexagonales
- Personajes
- Nave nodriza
- Edificios y recursos

#### `HexTile.tsx`
Loseta hexagonal individual. Mapea `Tile` del motor a mesh 3D.

**Mapeo Estado → Visual:**
- `tile.type` → Color
- `tile.destroyed` → Opacidad
- `tile.building` → Modelo de edificio
- `tile.coordinates` → Posición en mundo 3D

#### `CharacterMesh.tsx`
Personaje en el tablero 3D. Incluye animación de movimiento.

**Mapeo Estado → Visual:**
- `character.type` → Modelo GLB específico
- `character.isWounded` → Material rojo
- `character.canAct` → Brillo
- `character.tileId` → Posición (con animación al cambiar)

**IMPORTANTE:** La animación es REACTIVA al cambio de `tileId` en el estado. NO se modifica la posición directamente.

#### `Mothership.tsx`
Nave alienígena con efectos de hover, rotación y escudo.

---

### UI Components (`/components/ui`)

#### `GameHUD.tsx`
HUD principal con información de turno, fase y botones de control.

#### `CharacterPanel.tsx`
Panel lateral que muestra detalles del personaje seleccionado y acciones disponibles.

#### `StartMenu.tsx`
Menú inicial para configurar y empezar partida.

---

### Dados (`/components/dice`)

#### `DiceRoller.tsx`

**⚠️ INTEGRACIÓN CRÍTICA:**

```typescript
// ❌ NUNCA hacer esto:
const roll = () => {
  const result = Math.random() * 6 + 1; // Rompe determinismo
  applyDamage(result);
};

// ✅ Hacer esto:
const roll = () => {
  // 1. Motor genera resultado
  const result = dispatchAction({ type: ActionType.ATTACK_ALIEN });
  
  // 2. Resultado viene en evento
  const diceValue = result.events[0].data.diceResult;
  
  // 3. UI solo anima para revelar ese valor
  animateDice(diceValue);
};
```

El motor usa RNG seedeado → determinismo garantizado.

---

## 🔌 Integración con el Motor

### Store (`/store/game-store.ts`)

El store actúa como ADAPTADOR entre el motor y React.

```typescript
import { useGameStore } from '@/store/game-store';

// Leer estado
const gameState = useGameStore(state => state.gameState);
const phase = useGameStore(state => state.gameState?.phase);

// Dispatch acción
const dispatchAction = useGameStore(state => state.dispatchAction);

dispatchAction({
  type: ActionType.MOVE_CHARACTER,
  characterId: 'char_123',
  targetTileId: 'tile_456',
  playerId: gameState.currentPlayerId,
  timestamp: Date.now(),
});

// Validar antes de enviar (opcional)
const validateAction = useGameStore(state => state.validateAction);
const validation = validateAction(action);

if (validation.valid) {
  dispatchAction(action);
} else {
  alert(validation.reason);
}
```

### Flujo de Acción

```
1. UI: Click en botón
   ↓
2. Handler crea acción
   ↓
3. Store.dispatchAction(action)
   ↓
4. Store → Engine.applyAction(action)
   ↓
5. Engine: Valida + Aplica reglas
   ↓
6. Engine: Retorna { newState, events }
   ↓
7. Store: Actualiza gameState
   ↓
8. Store: Procesa eventos (animaciones)
   ↓
9. React: Re-renderiza componentes
   ↓
10. UI: Muestra cambios + animaciones
```

---

## 🎨 Mapeo Estado → Visual

### Coordenadas

El motor usa coordenadas hexagonales axiales `(q, r, s)`.
Three.js usa coordenadas cartesianas `(x, y, z)`.

```typescript
import { hexToWorld } from '@/utils/coordinate-converter';

// Convertir coordenadas del motor a posición 3D
const tile = gameState.tiles.get(tileId);
const worldPos = hexToWorld(tile.coordinates, 0);

<mesh position={[worldPos.x, worldPos.y, worldPos.z]}>
  {/* ... */}
</mesh>
```

### Assets 3D

Los modelos GLB se cargan mediante `assetManager`:

```typescript
import { assetManager, ASSET_PATHS } from '@/utils/asset-loader';

// Preload
await assetManager.preloadAll(Object.values(ASSET_PATHS.characters));

// Uso
const model = assetManager.getClone(ASSET_PATHS.characters[CharacterType.DOCTOR]);
```

---

## 🚫 Reglas de Oro

### ✅ HACER

1. Leer `GameState` del store
2. Disparar acciones al store
3. Animar cambios de estado
4. Validar con el motor antes de enviar acciones
5. Usar el RNG del motor para aleatoriedad de reglas

### ❌ NO HACER

1. **NUNCA** modificar `GameState` directamente desde UI
2. **NUNCA** duplicar lógica de reglas en componentes
3. **NUNCA** usar `Math.random()` para mecánicas de juego
4. **NUNCA** acoplar el motor a React
5. **NUNCA** introducir efectos colaterales en el motor

---

## 🧪 Testing

```bash
# Tests del motor (independientes)
cd ../engine
npm test

# Tests de integración (TODO)
cd ../client
npm test
```

---

## 🔧 Configuración

### Paths de Assets

Editar en `src/utils/asset-loader.ts`:

```typescript
export const ASSET_PATHS = {
  characters: {
    DOCTOR: '/assets/3d/characters/doctor/char_doctor_01.glb',
    // ...
  },
  // ...
};
```

### Constantes de Juego

Las constantes vienen del motor:

```typescript
import { BUILDING_COSTS, CHARACTER_GATHERING_CAPACITY } from '@engine/index';
```

**NO** duplicar constantes en el cliente.

---

## 📚 Documentación Adicional

- [INTEGRATION_ARCHITECTURE.md](./INTEGRATION_ARCHITECTURE.md) - Arquitectura completa
- [../engine/ARCHITECTURE.md](../engine/ARCHITECTURE.md) - Arquitectura del motor
- [assets/3d/INTEGRATION_GUIDE.md](./assets/3d/INTEGRATION_GUIDE.md) - Guía de assets 3D

---

## 🐛 Troubleshooting

### El juego no inicia

```bash
# Verificar que el motor está compilado
cd ../engine
npm run build

# Reinstalar dependencias
cd ../client
rm -rf node_modules
npm install
```

### Los modelos 3D no se ven

1. Verificar que los archivos GLB existen en `/public/assets/3d/`
2. Abrir DevTools → Network → verificar que los modelos se cargan
3. Verificar la escala en el componente: `scale={1}`

### Performance bajo

1. Reducir `shadow-mapSize` en `Lighting.tsx`
2. Implementar LOD (Level of Detail) para objetos lejanos
3. Usar instanced meshes para objetos repetidos

### Estado desincronizado

Si el estado de la UI no coincide con el motor:

```typescript
// Forzar re-sync
const engine = useGameStore(state => state.engine);
const saved = engine?.saveGame();
if (saved) {
  loadGame(saved);
}
```

---

## 🚀 Próximos Pasos

### Fase 1: Completar Acciones Básicas ✅
- [x] Movimiento de personajes
- [x] Recolección de recursos básica
- [ ] Construcción de edificios
- [ ] Curación de heridos
- [ ] Ataque al alienígena

### Fase 2: Assets 3D
- [ ] Cargar modelos GLB reales
- [ ] Animaciones de personajes
- [ ] Efectos visuales (partículas)

### Fase 3: Polish
- [ ] Sonidos
- [ ] Tutorial interactivo
- [ ] Efectos de post-procesado

### Fase 4: Multiplayer (opcional)
- [ ] WebSocket server
- [ ] Sincronización de acciones
- [ ] Lobbies

---

## 📄 Licencia

(Definir según proyecto)

---

## 👥 Contribuir

Ver guía de integración para mantener la arquitectura limpia.

**Regla principal:** El motor es la única fuente de verdad. La UI es una proyección reactiva.



