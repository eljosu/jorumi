# JORUMI - Resumen de Integración Motor ↔ UI ↔ 3D

**Lead Engineer:** Documentación de integración completa  
**Fecha:** 2026-01-03  
**Estado:** ✅ Arquitectura base implementada

---

## 📋 Entregables

### 1. ✅ Arquitectura de Integración

**Ubicación:** `client/INTEGRATION_ARCHITECTURE.md`

**Características:**
- Separación estricta: Motor / Store / UI
- Flujo unidireccional de datos
- Patrón Command para acciones
- Motor como única fuente de verdad
- Ejemplos detallados de cada patrón

### 2. ✅ Store Adapter (Zustand)

**Ubicación:** `client/src/store/game-store.ts`

**Funcionalidad:**
- Envuelve `GameEngine` del motor
- Gestiona `GameState` + `UI State`
- Sistema de historial (undo/redo)
- Procesamiento de eventos
- Validación de acciones
- Notificaciones y feedback

**API Principal:**
```typescript
// Inicialización
initializeEngine(options)
startGame(playerNames, seed?)

// Acciones
dispatchAction(action) → ActionResult
validateAction(action) → ValidationResult
advancePhase()

// UI State
selectCharacter(id)
selectTile(id)
setInteractionMode(mode)

// Historial
undo()
redo()
canUndo()
canRedo()
```

### 3. ✅ Componentes de Escena 3D

**Ubicación:** `client/src/components/scene/`

#### `GameScene.tsx`
- Canvas principal con R3F
- Configuración de cámara
- OrbitControls
- Sistema de iluminación
- Suspense para carga de assets

#### `GameBoard.tsx`
- Lee `GameState` del store
- Renderiza todos los elementos del juego
- Mapeo directo: Estado → Visual

#### `HexTile.tsx`
- Loseta hexagonal 3D
- Mapeo de tipos a colores
- Interacción (click, hover)
- Estados visuales (seleccionado, válido, destruido)

#### `CharacterMesh.tsx`
- Personaje 3D con animación
- Movimiento animado reactivo a cambios de estado
- Estados visuales (herido, usado, deshabilitado)
- Sistema de selección

#### `Mothership.tsx`
- Nave alienígena
- Animaciones de hover y rotación
- Escudo visual reactivo
- Efectos de daño

### 4. ✅ Componentes de UI

**Ubicación:** `client/src/components/ui/`

#### `GameHUD.tsx`
- Información de turno y fase
- Botones de control
- Sistema de notificaciones
- Mensajes de error

#### `CharacterPanel.tsx`
- Detalles del personaje seleccionado
- Acciones disponibles
- Estados del personaje

#### `StartMenu.tsx`
- Menú inicial
- Configuración de partida
- Carga de partidas guardadas

### 5. ✅ Sistema de Dados

**Ubicación:** `client/src/components/dice/DiceRoller.tsx`

**INTEGRACIÓN CRÍTICA:**
- Motor genera resultado (RNG seedeado)
- UI solo anima
- NUNCA `Math.random()` para reglas
- Flujo: Acción → Motor calcula → Evento con resultado → Animación

### 6. ✅ Utilidades

#### `coordinate-converter.ts`
- Conversión Hex ↔ Cartesiano
- `hexToWorld()`, `worldToHex()`
- Helpers de geometría hexagonal

#### `asset-loader.ts`
- Carga centralizada de modelos GLB
- Sistema de cache
- Preload de assets críticos
- Paths configurables

### 7. ✅ Hooks

#### `useEngineSync.ts`
- Inicialización del motor
- Auto-save periódico
- Sincronización React ↔ Engine

### 8. ✅ Configuración del Proyecto

- `package.json` con todas las dependencias
- `vite.config.ts` con aliases
- `tsconfig.json` con paths
- `tailwind.config.js` para estilos
- `.gitignore`

---

## 🎯 Ejemplo Funcional Completo

### Caso de Uso: Mover Personaje y Recolectar Recursos

```typescript
// ============================================================================
// 1. USUARIO INICIA JUEGO
// ============================================================================

// App.tsx inicializa automáticamente
useEngineSync(); // → Crea GameEngine instance

// Usuario hace click en "New Game"
startGame(['Player 1', 'Alien'], 12345);

// Motor crea estado inicial:
// - 1 guetto con personajes
// - Losetas iniciales
// - Recursos básicos
// - Fase: PREPARATION

// ============================================================================
// 2. RENDERIZADO INICIAL
// ============================================================================

// GameBoard lee GameState
const gameState = useGameStore(state => state.gameState);

// Renderiza:
tiles.map(tile => <HexTile tile={tile} />)
  // → 7 hexágonos visibles (guetto + adyacentes)

characters.map(char => <CharacterMesh character={char} />)
  // → 5 personajes en el guetto (Doctor, Soldier, Peasant, Constructor, Miner)

// ============================================================================
// 3. FASE: MOVEMENT - USUARIO MUEVE PERSONAJE
// ============================================================================

// Usuario hace click en Peasant
<CharacterMesh onClick={(e) => {
  e.stopPropagation();
  selectCharacter('char_peasant_001');
}} />

// Store actualiza UI state (NO gameState)
uiState.selectedCharacterId = 'char_peasant_001'
uiState.interactionMode = 'move'

// CharacterMesh detecta selección
const isSelected = selectedCharacterId === character.id;
// → Muestra ring amarillo debajo
// → Anima bob up/down

// Usuario hace click en loseta FOREST
<HexTile onClick={(e) => {
  e.stopPropagation();
  
  // Hay personaje seleccionado + tile clickeado → mover
  if (selectedCharacterId && uiState.interactionMode === 'move') {
    dispatchAction({
      type: ActionType.MOVE_CHARACTER,
      playerId: gameState.currentPlayerId,
      characterId: selectedCharacterId,
      targetTileId: tile.id,
      timestamp: Date.now(),
    });
  }
}} />

// ============================================================================
// 4. STORE PROCESA ACCIÓN
// ============================================================================

dispatchAction: (action) => {
  // Aplicar al motor
  const result = engine.applyAction(action);
  
  if (result.success) {
    // Actualizar estado
    _updateGameState(result.newState);
    
    // Procesar eventos
    _handleEvents(result.events);
  }
}

// ============================================================================
// 5. MOTOR VALIDA Y APLICA
// ============================================================================

// En el motor (engine/core/action-reducer.ts)
case ActionType.MOVE_CHARACTER: {
  // Validar
  const character = state.characters.get(action.characterId);
  if (!character) return error('Character not found');
  if (character.isUsed) return error('Character already moved');
  if (state.phase !== GamePhase.MOVEMENT) return error('Wrong phase');
  
  const targetTile = state.tiles.get(action.targetTileId);
  if (!targetTile) return error('Invalid tile');
  
  const distance = hexDistance(currentTile.coordinates, targetTile.coordinates);
  if (distance > MOVEMENT_RULES.MAX_DISTANCE) return error('Too far');
  
  // Aplicar (inmutable)
  const newState = {
    ...state,
    characters: new Map(state.characters).set(action.characterId, {
      ...character,
      tileId: action.targetTileId,
      isUsed: true,
    }),
  };
  
  // Retornar
  return {
    success: true,
    newState,
    events: [
      {
        type: GameEventType.CHARACTER_MOVED,
        data: {
          characterId: action.characterId,
          fromTileId: character.tileId,
          toTileId: action.targetTileId,
        },
        timestamp: Date.now(),
      },
    ],
  };
}

// ============================================================================
// 6. STORE ACTUALIZA Y PROCESA EVENTOS
// ============================================================================

_updateGameState(newState);
// → gameState = newState
// → history.push(newState)
// → historyIndex++

_handleEvents([
  { type: 'CHARACTER_MOVED', data: {...} }
]);
// → showNotification('Character moved')

// ============================================================================
// 7. REACT RE-RENDERIZA
// ============================================================================

// CharacterMesh detecta cambio en character.tileId
useEffect(() => {
  const currentTile = tiles.get(character.tileId);
  const newWorldPos = hexToWorld(currentTile.coordinates, 0.5);
  
  if (newWorldPos !== previousPos) {
    // Iniciar animación
    setStartPos(previousPos);
    setTargetPos(newWorldPos);
    setAnimating(true);
  }
}, [character.tileId]);

// ============================================================================
// 8. ANIMACIÓN DE MOVIMIENTO (500ms)
// ============================================================================

useFrame((state, delta) => {
  if (animating) {
    progress += delta * 2; // Duración: 0.5s
    
    // Interpolación suave
    const t = progress * progress * (3 - 2 * progress); // Smoothstep
    meshRef.current.position.lerpVectors(startPos, targetPos, t);
    
    // Efecto de salto
    meshRef.current.position.y += Math.sin(t * Math.PI) * 0.5;
    
    if (progress >= 1) {
      setAnimating(false);
    }
  }
});

// Usuario ve:
// - Personaje se mueve suavemente de hexágono a hexágono
// - Efecto de salto durante el movimiento
// - Notificación "Character moved"
// - Personaje cambia a estado "usado" (color gris)

// ============================================================================
// 9. FASE: RESOURCE_GATHERING - RECOLECTAR
// ============================================================================

// Usuario avanza fase
<button onClick={advancePhase}>Advance Phase</button>

// Motor cambia fase automáticamente
state.phase = GamePhase.RESOURCE_GATHERING

// Usuario hace click en panel de acciones
<button onClick={() => {
  dispatchAction({
    type: ActionType.GATHER_RESOURCES,
    playerId: gameState.currentPlayerId,
    characterId: 'char_peasant_001',
    resourceType: ResourceType.FOOD,
    amount: 3, // Peasant capability
    timestamp: Date.now(),
  });
}}>
  Gather Food
</button>

// ============================================================================
// 10. MOTOR APLICA RECOLECCIÓN
// ============================================================================

// Validar
if (state.phase !== GamePhase.RESOURCE_GATHERING) return error('Wrong phase');
if (character.type !== CharacterType.PEASANT) return error('Only peasants can gather food');
if (character.isUsed) return error('Already gathered');

const currentTile = state.tiles.get(character.tileId);
if (currentTile.type !== TileType.FOREST) return error('Not in forest');

// Aplicar
const ghetto = getCharacterGhetto(character);
const newState = {
  ...state,
  characters: new Map(state.characters).set(character.id, {
    ...character,
    isUsed: true,
  }),
  ghettos: new Map(state.ghettos).set(ghetto.id, {
    ...ghetto,
    resources: {
      ...ghetto.resources,
      [ResourceType.FOOD]: ghetto.resources[ResourceType.FOOD] + 3,
    },
  }),
};

// Evento
events.push({
  type: GameEventType.RESOURCES_GATHERED,
  data: {
    characterId: character.id,
    resourceType: ResourceType.FOOD,
    amount: 3,
  },
});

// ============================================================================
// 11. UI MUESTRA RESULTADO
// ============================================================================

// GameHUD actualiza contador de comida
<div>Food: {ghetto.resources.FOOD}</div>
// 0 → 3 (con animación de contador)

// Notificación
showNotification('+3 FOOD');

// CharacterMesh muestra personaje "usado"
const color = character.isUsed ? '#666666' : CHARACTER_COLORS[character.type];

// ============================================================================
// CICLO COMPLETO: 
// Click → Action → Engine → State → React → Animation → Feedback
// ============================================================================
```

---

## 🔍 Puntos Críticos de Integración

### 1. Motor como Fuente de Verdad

```typescript
// ✅ CORRECTO
const gameState = useGameStore(state => state.gameState);
const character = gameState.characters.get(characterId);

// ❌ INCORRECTO
const [characterPos, setCharacterPos] = useState(initialPos);
character.position = newPos; // ¡NO!
```

### 2. Acciones, No Mutaciones

```typescript
// ✅ CORRECTO
dispatchAction({ type: ActionType.MOVE_CHARACTER, ... });

// ❌ INCORRECTO
character.tileId = newTileId; // ¡NO!
gameState.phase = GamePhase.TRADING; // ¡NO!
```

### 3. Validación en el Motor

```typescript
// ✅ CORRECTO
const validation = validateAction(action);
if (!validation.valid) {
  showError(validation.reason);
  return;
}

// ❌ INCORRECTO
if (distance(char, tile) > 2) { // Duplicar regla del motor
  alert('Too far');
  return;
}
```

### 4. Dados Deterministas

```typescript
// ✅ CORRECTO
const action = { type: ActionType.ATTACK_ALIEN };
const result = dispatchAction(action);
const diceValue = result.events[0].data.diceResult; // Motor calculó

// ❌ INCORRECTO
const diceValue = Math.floor(Math.random() * 6) + 1; // ¡NO!
```

### 5. Animaciones Reactivas

```typescript
// ✅ CORRECTO
useEffect(() => {
  if (character.tileId !== previousTileId) {
    animateMovement(); // Reaccionar a cambio de estado
  }
}, [character.tileId]);

// ❌ INCORRECTO
const moveCharacter = async () => {
  await animateMovement(); // Animar ANTES de cambiar estado
  character.tileId = newTileId;
};
```

---

## 📊 Separación de Responsabilidades

| Capa | Responsabilidades | NO Debe Hacer |
|------|-------------------|---------------|
| **Motor** | • Validar acciones<br>• Aplicar reglas<br>• Calcular resultados<br>• Generar aleatoriedad (RNG)<br>• Determinar condiciones de victoria | • Renderizar<br>• Animar<br>• Mostrar UI<br>• Depender de React |
| **Store** | • Envolver motor<br>• Gestionar estado UI<br>• Procesar eventos<br>• Historial | • Duplicar reglas<br>• Modificar GameState directamente |
| **UI/3D** | • Leer estado<br>• Disparar acciones<br>• Animar cambios<br>• Mostrar feedback | • Modificar GameState<br>• Implementar reglas<br>• Generar aleatoriedad de reglas |

---

## 🚀 Próximos Pasos

### Inmediato
1. ✅ **Instalar dependencias**: `cd client && npm install`
2. ✅ **Iniciar dev server**: `npm run dev`
3. ⏳ **Cargar modelos GLB reales** (actualmente usa geometrías placeholder)
4. ⏳ **Implementar acciones restantes** (construir, curar, atacar)

### Corto Plazo
- [ ] Sistema completo de recursos
- [ ] Construcción de edificios
- [ ] Turno del alienígena con dados especiales
- [ ] Condiciones de victoria/derrota
- [ ] Tutorial interactivo

### Medio Plazo
- [ ] Efectos visuales (partículas, shaders)
- [ ] Sistema de sonido
- [ ] Optimización (LOD, instancing)
- [ ] Mobile responsive

### Largo Plazo (Opcional)
- [ ] Multiplayer con WebSockets
- [ ] Replay system
- [ ] AI oponente
- [ ] Editor de mapas

---

## 📚 Documentación Completa

1. **`client/INTEGRATION_ARCHITECTURE.md`** - Arquitectura detallada con ejemplos
2. **`client/README.md`** - Setup, uso y troubleshooting
3. **`engine/ARCHITECTURE.md`** - Arquitectura del motor
4. **`client/assets/3d/INTEGRATION_GUIDE.md`** - Guía de assets 3D

---

## ✅ Checklist de Integración

### Arquitectura
- [x] Separación estricta Motor / Store / UI
- [x] Flujo unidireccional de datos
- [x] Motor sin dependencias de UI
- [x] Store como adaptador
- [x] Estado inmutable

### Store (Zustand)
- [x] Envuelve GameEngine
- [x] GameState + UI State separados
- [x] Sistema de historial
- [x] Procesamiento de eventos
- [x] Validación de acciones
- [x] Notificaciones

### Escena 3D
- [x] Canvas con R3F
- [x] GameBoard lee GameState
- [x] HexTile con interacción
- [x] CharacterMesh con animación
- [x] Mothership con efectos
- [x] Sistema de iluminación

### UI
- [x] GameHUD con info de turno
- [x] CharacterPanel con acciones
- [x] StartMenu funcional
- [x] Sistema de notificaciones

### Integración Crítica
- [x] Coordenadas Hex ↔ Cartesian
- [x] Asset loader centralizado
- [x] Dados con motor (sin Math.random)
- [x] Animaciones reactivas
- [x] Validación pre-acción

### Documentación
- [x] README con setup
- [x] Arquitectura detallada
- [x] Ejemplo funcional completo
- [x] Guía de troubleshooting
- [x] Comentarios en código explicando conexiones

---

## 🎓 Conceptos Clave para el Equipo

### 1. "Motor es la Verdad"
El motor es la ÚNICA fuente de verdad del estado del juego. La UI es una proyección reactiva.

### 2. "Acciones, no Mutaciones"
Los cambios se expresan como acciones (comandos) que el motor valida y aplica.

### 3. "Animaciones son Consecuencias"
Las animaciones son reacciones visuales a cambios de estado, nunca causas de cambios.

### 4. "Determinismo Siempre"
El motor usa RNG seedeado. Nunca usar `Math.random()` para mecánicas de juego.

### 5. "Separación Estricta"
Cada capa tiene responsabilidades claras y no invade otras capas.

---

## 🎉 Estado Final

**✅ Arquitectura de integración completamente implementada y documentada**

El proyecto ahora tiene:
- ✅ Motor de reglas desacoplado y robusto
- ✅ Assets 3D optimizados para Three.js
- ✅ Arquitectura de integración limpia y escalable
- ✅ Store adapter con Zustand
- ✅ Componentes 3D reactivos al estado
- ✅ UI funcional con feedback
- ✅ Sistema de dados integrado correctamente
- ✅ Documentación completa y ejemplos

**Listo para desarrollo de features completas.**

---

**Arquitectura diseñada por:** Lead Engineer  
**Stack:** React + TypeScript + R3F + Zustand + Motor JORUMI  
**Principio:** Separación estricta, flujo unidireccional, motor como verdad única




