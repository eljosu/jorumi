# JORUMI - Arquitectura de Integración Motor ↔ UI ↔ 3D

## 📐 Principios Fundamentales

### 1. Separación Estricta de Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│                    UI / VISUAL LAYER                        │
│  • React Components                                         │
│  • Three.js Scene                                           │
│  • Animaciones                                              │
│  • Feedback visual                                          │
│  → SOLO LEE estado                                          │
│  → SOLO DISPARA acciones                                    │
│  → NUNCA modifica GameState                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Actions (commands)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   STATE ADAPTER (Zustand)                   │
│  • Envuelve GameEngine                                      │
│  • Maneja historial (undo/redo)                             │
│  • Gestiona UI state (selections, hover)                    │
│  • Procesa eventos del motor                                │
│  → Valida acciones                                          │
│  → Actualiza store                                          │
│  → Notifica a React                                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Actions → New State + Events
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    GAME ENGINE (Motor)                      │
│  • Lógica de reglas pura                                    │
│  • Funciones inmutables                                     │
│  • Determinismo (RNG seedeado)                              │
│  • Sin dependencias de UI                                   │
│  → ÚNICA fuente de verdad                                   │
│  → Aplica reglas del manual                                 │
│  → Retorna nuevo estado                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Completo de Interacción

### Ejemplo: Mover un Personaje

```
1. USUARIO HACE CLICK EN EL TABLERO
   ↓
2. HexTile.onClick() → selectTile(tileId)
   ↓
3. STORE: Actualiza uiState.selectedTileId
   ↓
4. COMPONENTE DETECTA: "Hay personaje seleccionado + tile clickeado"
   ↓
5. COMPONENTE DISPARA ACCIÓN AL STORE:
   dispatchAction({
     type: ActionType.MOVE_CHARACTER,
     characterId: selectedCharacterId,
     targetTileId: clickedTileId,
     ...
   })
   ↓
6. STORE: Valida acción (opcional, para feedback inmediato)
   ↓
7. STORE → ENGINE: engine.applyAction(action)
   ↓
8. ENGINE: Valida según reglas
   - ¿Está en la fase correcta?
   - ¿El personaje puede moverse?
   - ¿La loseta es adyacente?
   - ¿No hay obstáculos?
   ↓
9. ENGINE: Aplica transformación inmutable
   newState = {
     ...state,
     characters: new Map(state.characters).set(characterId, {
       ...character,
       tileId: targetTileId,
       isUsed: true
     })
   }
   ↓
10. ENGINE: Retorna resultado
    {
      success: true,
      newState: newState,
      events: [
        { type: 'CHARACTER_MOVED', data: {...} }
      ]
    }
   ↓
11. STORE: Actualiza gameState
   ↓
12. STORE: Procesa eventos (animaciones, notificaciones)
   ↓
13. REACT: Re-renderiza componentes que usan ese estado
   ↓
14. CharacterMesh: Detecta cambio en character.tileId
   ↓
15. CharacterMesh: Inicia animación de movimiento
    - Interpola posición de oldTile → newTile
    - Efecto de "salto"
    - Duración 500ms
   ↓
16. ANIMACIÓN COMPLETA
```

---

## 🎲 Integración de Dados (CRÍTICO)

### ⚠️ NUNCA HACER ESTO:

```typescript
// ❌ MAL: UI genera resultado de dado
const roll = () => {
  const result = Math.floor(Math.random() * 6) + 1;
  applyDamage(result); // Esto rompe el determinismo
};
```

### ✅ HACER ESTO:

```typescript
// ✅ BIEN: Motor genera resultado
const roll = () => {
  // 1. Disparar acción al motor
  const action = {
    type: ActionType.ATTACK_ALIEN,
    characterId: selectedCharacter.id,
    // NO incluir resultado aquí
  };
  
  // 2. Motor calcula resultado usando su RNG determinista
  const result = engine.applyAction(action);
  
  // 3. Resultado viene en el evento
  // result.events[0].data.diceResult = 4 (calculado por motor)
  
  // 4. UI solo anima el dado para mostrar ese resultado
  animateDice(result.events[0].data.diceResult);
};
```

### Flujo Correcto de Dados:

```
Usuario: "Roll dice"
   ↓
UI: Dispara acción ATTACK_ALIEN al motor
   ↓
Motor: 
  - Usa su RNG seedeado: dice.roll()
  - Calcula damage = diceResult * multiplier
  - Aplica damage al alien
  - Retorna nuevo estado + evento con diceResult
   ↓
Store: Recibe evento { type: 'DICE_ROLLED', data: { result: 4 } }
   ↓
UI: 
  - Inicia animación de dado (visual)
  - Al finalizar animación, muestra resultado: 4
  - El resultado YA fue aplicado por el motor
```

---

## 📦 Estructura de Carpetas

```
client/
├── src/
│   ├── store/
│   │   └── game-store.ts          ← ADAPTADOR: Motor ↔ React
│   │
│   ├── hooks/
│   │   └── useEngineSync.ts       ← Inicialización del motor
│   │
│   ├── components/
│   │   ├── scene/                 ← Componentes 3D (Three.js)
│   │   │   ├── GameScene.tsx      ← Canvas principal
│   │   │   ├── GameBoard.tsx      ← Lee GameState, renderiza todo
│   │   │   ├── HexTile.tsx        ← Loseta individual
│   │   │   ├── CharacterMesh.tsx  ← Personaje 3D (con animación)
│   │   │   ├── Mothership.tsx     ← Nave alienígena
│   │   │   └── Lighting.tsx       ← Setup de luces
│   │   │
│   │   ├── ui/                    ← Componentes UI (React)
│   │   │   ├── GameHUD.tsx        ← Info de turno, fase, botones
│   │   │   ├── CharacterPanel.tsx ← Panel de personaje seleccionado
│   │   │   ├── StartMenu.tsx      ← Menú inicial
│   │   │   └── LoadingScreen.tsx  ← Carga de assets
│   │   │
│   │   └── dice/
│   │       └── DiceRoller.tsx     ← Dado 3D con integración correcta
│   │
│   ├── utils/
│   │   ├── coordinate-converter.ts ← Hex ↔ Cartesian
│   │   └── asset-loader.ts         ← Carga de modelos GLB
│   │
│   ├── App.tsx                     ← Componente raíz
│   ├── main.tsx                    ← Entry point
│   └── index.css                   ← Estilos globales
│
├── assets/
│   └── 3d/                         ← Modelos GLB
│       ├── characters/
│       ├── resources/
│       ├── vehicles/
│       └── dice/
│
└── package.json
```

---

## 🔌 Puntos de Conexión Motor ↔ UI

### 1. Inicialización

```typescript
// hooks/useEngineSync.ts
export function useEngineSync() {
  const initializeEngine = useGameStore((state) => state.initializeEngine);
  
  useEffect(() => {
    initializeEngine({ enableLogging: true });
  }, []);
}

// En App.tsx
function App() {
  useEngineSync(); // Inicializa el motor
  // ...
}
```

### 2. Lectura de Estado

```typescript
// Componente lee estado del motor (a través del store)
const gameState = useGameStore((state) => state.gameState);

// GameState contiene:
// - tiles: Map<TileId, Tile>
// - characters: Map<CharacterId, Character>
// - ghettos: Map<GhettoId, Ghetto>
// - alien: AlienState
// - phase: GamePhase
// - turn: number
// etc.
```

### 3. Dispatch de Acciones

```typescript
const dispatchAction = useGameStore((state) => state.dispatchAction);

// Ejemplo: Recolectar recursos
const gatherFood = () => {
  dispatchAction({
    type: ActionType.GATHER_RESOURCES,
    playerId: gameState.currentPlayerId,
    characterId: selectedCharacter.id,
    resourceType: ResourceType.FOOD,
    amount: 3,
    timestamp: Date.now(),
  });
};
```

### 4. Validación Pre-Acción (opcional)

```typescript
const validateAction = useGameStore((state) => state.validateAction);

// Validar antes de enviar (para deshabilitar botones)
const isValid = validateAction({
  type: ActionType.MOVE_CHARACTER,
  characterId: character.id,
  targetTileId: tile.id,
  ...
});

if (!isValid.valid) {
  console.log('Cannot perform action:', isValid.reason);
}
```

### 5. Procesamiento de Eventos

```typescript
// En game-store.ts
_handleEvents: (events) => {
  events.forEach((event) => {
    switch (event.type) {
      case GameEventType.CHARACTER_MOVED:
        // Disparar animación
        // Mostrar notificación
        break;
      
      case GameEventType.RESOURCES_GATHERED:
        showNotification(`+${event.data.amount} ${event.data.resourceType}`);
        break;
      
      case GameEventType.GAME_WON:
        // Mostrar pantalla de victoria
        break;
    }
  });
}
```

---

## 🎨 Mapeo Estado → Visual

### GameState.tiles → HexTile Components

```typescript
// GameBoard.tsx
const tiles = Array.from(gameState.tiles.values());

return (
  <group>
    {tiles.map(tile => (
      <HexTile key={tile.id} tile={tile} />
    ))}
  </group>
);
```

### Tile → Representación Visual

```typescript
// HexTile.tsx
const TILE_COLORS: Record<TileType, string> = {
  GHETTO: '#8B4513',
  FOREST: '#228B22',
  MINE: '#696969',
  // ...
};

const color = tile.destroyed ? '#333' : TILE_COLORS[tile.type];
const position = hexToWorld(tile.coordinates, 0);

return (
  <mesh position={position}>
    <cylinderGeometry args={[1, 1, 0.2, 6]} />
    <meshStandardMaterial color={color} opacity={tile.destroyed ? 0.3 : 1} />
  </mesh>
);
```

### Character → CharacterMesh con Animación

```typescript
// CharacterMesh.tsx

// Detectar cambio de posición
useEffect(() => {
  if (character.tileId !== previousTileId) {
    // Iniciar animación de movimiento
    animateMovement(previousTile, currentTile);
  }
}, [character.tileId]);

// Animación reactiva
useFrame((state, delta) => {
  if (animating) {
    // Interpolar posición
    meshRef.current.position.lerpVectors(startPos, targetPos, progress);
    progress += delta * 2;
  }
});
```

---

## 🚫 QUÉ NO HACER

### ❌ NO: Modificar GameState directamente desde UI

```typescript
// ❌ MAL
const moveCharacter = () => {
  character.tileId = newTileId; // ¡NUNCA!
  character.isUsed = true;      // ¡NUNCA!
};
```

### ✅ SÍ: Enviar acción al motor

```typescript
// ✅ BIEN
const moveCharacter = () => {
  dispatchAction({
    type: ActionType.MOVE_CHARACTER,
    characterId: character.id,
    targetTileId: newTileId,
    ...
  });
};
```

---

### ❌ NO: Duplicar lógica de reglas en UI

```typescript
// ❌ MAL
const canMove = (character: Character, tile: Tile) => {
  // Duplicar validación del motor aquí
  if (character.isUsed) return false;
  if (distance(character.tile, tile) > 2) return false;
  // ...
};
```

### ✅ SÍ: Consultar al motor

```typescript
// ✅ BIEN
const canMove = (character: Character, tile: Tile) => {
  const action = createMoveAction(character, tile);
  const validation = engine.validateAction(action);
  return validation.valid;
};
```

---

### ❌ NO: Usar Math.random() para reglas

```typescript
// ❌ MAL
const rollDice = () => {
  const result = Math.random() * 6 + 1; // Rompe determinismo
  applyDamage(result);
};
```

### ✅ SÍ: Motor genera aleatoriedad

```typescript
// ✅ BIEN
const rollDice = () => {
  // Motor usa RNG seedeado
  const result = engine.applyAction({ type: ActionType.ROLL_DICE });
  // result.events contiene el valor calculado por el motor
};
```

---

### ❌ NO: Acoplar motor a React

```typescript
// ❌ MAL - en el motor
import { useState } from 'react';

export class GameEngine {
  private [state, setState] = useState(...); // ¡NO!
}
```

### ✅ SÍ: Motor independiente

```typescript
// ✅ BIEN - motor puro
export class GameEngine {
  private state: GameState;
  
  applyAction(action: GameAction): ActionResult {
    const newState = this.reducer(this.state, action);
    this.state = newState;
    return { success: true, newState };
  }
}
```

---

## 🎯 Ejemplo Completo: Ciclo de Acción

```typescript
// 1. Usuario clickea en "Gather Food"
<button onClick={handleGatherFood}>Gather Food</button>

// 2. Handler crea acción
const handleGatherFood = () => {
  const action: GatherResourcesAction = {
    type: ActionType.GATHER_RESOURCES,
    playerId: gameState.currentPlayerId,
    characterId: selectedCharacter.id,
    resourceType: ResourceType.FOOD,
    amount: 3,
    timestamp: Date.now(),
  };
  
  // 3. Enviar al store
  dispatchAction(action);
};

// 4. Store valida (opcional)
const validation = engine.validateAction(action);
if (!validation.valid) {
  showError(validation.reason);
  return { success: false, error: validation.reason };
}

// 5. Store aplica al motor
const result = engine.applyAction(action);

// 6. Motor valida según reglas
if (state.phase !== GamePhase.RESOURCE_GATHERING) {
  return { success: false, error: 'Wrong phase' };
}
if (character.isUsed) {
  return { success: false, error: 'Character already used' };
}

// 7. Motor aplica transformación
const newState = {
  ...state,
  characters: new Map(state.characters).set(characterId, {
    ...character,
    isUsed: true,
  }),
  ghettos: new Map(state.ghettos).set(ghettoId, {
    ...ghetto,
    resources: {
      ...ghetto.resources,
      [ResourceType.FOOD]: ghetto.resources[ResourceType.FOOD] + 3,
    },
  }),
};

// 8. Motor retorna resultado
return {
  success: true,
  newState,
  events: [
    {
      type: GameEventType.RESOURCES_GATHERED,
      data: { characterId, resourceType: ResourceType.FOOD, amount: 3 },
      timestamp: Date.now(),
    },
  ],
};

// 9. Store actualiza
_updateGameState(result.newState);

// 10. Store procesa eventos
_handleEvents(result.events);
// → Muestra notificación: "+3 FOOD"
// → Dispara animación de recolección

// 11. React re-renderiza
// - GameHUD muestra recursos actualizados
// - CharacterMesh muestra personaje "usado"
// - Notificación aparece en pantalla

// 12. Animación de recolección
// - Personaje hace gesto de recolectar
// - Icono de comida flota hacia el HUD
// - Contador de comida aumenta con animación
```

---

## 📚 Resumen de Responsabilidades

### Motor de Reglas
- ✅ Validar acciones
- ✅ Aplicar reglas del manual
- ✅ Calcular resultados de dados
- ✅ Determinar condiciones de victoria
- ✅ Gestionar turnos y fases
- ❌ Nunca: Renderizar, animar, mostrar UI

### Store (Zustand)
- ✅ Envolver el motor
- ✅ Gestionar GameState + UI State
- ✅ Procesar eventos
- ✅ Historial (undo/redo)
- ❌ Nunca: Duplicar lógica de reglas

### Componentes UI/3D
- ✅ Leer estado
- ✅ Disparar acciones
- ✅ Animar cambios
- ✅ Mostrar feedback
- ❌ Nunca: Modificar GameState
- ❌ Nunca: Implementar reglas

---

## 🚀 Iniciar el Proyecto

```bash
cd client
npm install
npm run dev
```

Abre http://localhost:3000 y verás el juego funcionando con la arquitectura de integración completa.

---

## 📖 Próximos Pasos

1. **Cargar Modelos GLB Reales**
   - Reemplazar geometrías placeholder por assets 3D
   - Usar `assetManager.load()` en componentes

2. **Implementar Acciones Restantes**
   - Construir edificios
   - Curar heridos
   - Atacar alienígena
   - etc.

3. **Mejorar Animaciones**
   - Transiciones suaves entre fases
   - Efectos de partículas
   - Sonidos (opcional)

4. **Multiplayer (opcional)**
   - WebSocket server
   - Sincronización de acciones
   - Lockstep determinístico

---

**Recuerda siempre:**
> El motor es la ÚNICA fuente de verdad.  
> La UI es una PROYECCIÓN reactiva del estado.  
> Las animaciones son CONSECUENCIAS, nunca causas.




