# 🏛️ JORUMI Game Engine - Arquitectura

## Visión General

El motor de JORUMI sigue los principios de **Arquitectura Limpia** y **Domain-Driven Design (DDD)**, creando un sistema altamente testeable, mantenible y desacoplado.

## Principios de Diseño

### 1. Inmutabilidad

**Todo el estado es inmutable**. Cada operación retorna un nuevo estado:

```typescript
// ❌ MAL: Mutación directa
state.turn += 1;

// ✅ BIEN: Nuevo estado
const newState = { ...state, turn: state.turn + 1 };
```

**Beneficios:**
- Debugging más fácil (no hay efectos secundarios)
- Time-travel debugging
- Undo/Redo trivial
- Thread-safe (si se usa en worker)

### 2. Determinismo

**El motor es completamente determinista** mediante RNG seedeado:

```typescript
// Misma semilla + mismas acciones = mismo resultado
const engine1 = new GameEngine();
engine1.startGame({ playerNames: ['Alice'], seed: 12345 });

const engine2 = new GameEngine();
engine2.startGame({ playerNames: ['Alice'], seed: 12345 });

// Ambos producen exactamente los mismos resultados
```

**Beneficios:**
- Replay de partidas
- Testing exhaustivo
- Detección de bugs
- Multiplayer determinístico

### 3. Desacoplamiento Total

**Cero dependencias de UI, gráficos o framework:**

```
┌─────────────────────────────────────────┐
│           UI Layer (React)              │
│  ┌────────────────────────────────────┐ │
│  │  Three.js Rendering                │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │ (solo lectura de estado)
               ▼
┌─────────────────────────────────────────┐
│         GAME ENGINE (este)              │
│  • Estado puro                          │
│  • Lógica de negocio                    │
│  • Reglas del manual                    │
└─────────────────────────────────────────┘
```

**Beneficios:**
- Testeable sin UI
- Portabilidad (web, desktop, mobile)
- Cambio de framework sin reescribir lógica
- Multiplayer más fácil

### 4. Command Pattern

**Todas las mutaciones mediante comandos validados:**

```typescript
// Acción = Comando
const action: MoveCharacterAction = {
  type: ActionType.MOVE_CHARACTER,
  playerId: 'player_123',
  characterId: 'char_456',
  targetTileId: 'tile_789',
  timestamp: Date.now(),
};

// Validación
const validation = validateAction(state, action);

// Aplicación (reducer)
if (validation.valid) {
  const newState = reduceAction(state, action);
}
```

**Beneficios:**
- Validación centralizada
- Log de acciones (replay)
- Undo/Redo
- Networking (enviar acciones)

## Capas de la Arquitectura

### Capa 1: Domain (Dominio)

**Propósito:** Modelo conceptual del juego

```
domain/
├── types.ts       # Tipos e interfaces del dominio
└── constants.ts   # Constantes del juego
```

**Características:**
- Sin dependencias externas
- Solo tipos y constantes
- Refleja el manual del juego
- Vocabulario ubicuo (DDD)

**Ejemplo:**

```typescript
export interface Character {
  id: CharacterId;
  type: CharacterType;
  name: string;
  ghettoId: GhettoId;
  isWounded: boolean;
  canAct: boolean;
}

export enum CharacterType {
  DOCTOR = 'DOCTOR',
  SOLDIER = 'SOLDIER',
  PEASANT = 'PEASANT',
  CONSTRUCTOR = 'CONSTRUCTOR',
  MINER = 'MINER',
}
```

### Capa 2: Rules (Reglas)

**Propósito:** Implementación de las reglas del manual

```
rules/
├── phase-machine.ts  # Máquina de estados de fases
└── game-rules.ts     # Reglas del juego
```

**Características:**
- Funciones puras
- Sin efectos secundarios
- Cada función = una regla del manual
- Comentarios referencian el manual

**Ejemplo:**

```typescript
/**
 * Manual: Los humanos consumen comida cada turno
 * Si no hay suficiente comida, mueren humanos
 */
export function applyFoodConsumption(ghetto: Ghetto): {
  ghetto: Ghetto;
  deaths: number;
  event: string;
} {
  const totalHumans = ghetto.population + ghetto.wounded;
  const foodNeeded = totalHumans * FOOD_CONSUMPTION_PER_HUMAN;
  
  if (foodAvailable >= foodNeeded) {
    // Lógica cuando hay comida suficiente
  } else {
    // Lógica de hambruna
  }
}
```

### Capa 3: Actions (Acciones)

**Propósito:** Sistema de comandos y validaciones

```
actions/
├── types.ts        # Definición de acciones
└── validators.ts   # Validación de acciones
```

**Características:**
- Una acción = un cambio en el estado
- Validación antes de aplicar
- Acciones serializables (JSON)

**Flujo:**

```
1. UI crea acción
   ↓
2. Validador verifica (sin mutar)
   ↓
3. Reducer aplica (inmutablemente)
   ↓
4. Nuevo estado retornado
```

### Capa 4: Core (Núcleo)

**Propósito:** Orquestación del motor

```
core/
├── game-engine.ts     # API pública del motor
├── state-factory.ts   # Creación de estados
└── action-reducer.ts  # Aplicación de acciones
```

**Características:**
- Punto de entrada único
- Gestión del ciclo de vida
- Coordinación de subsistemas

**Ejemplo:**

```typescript
export class GameEngine {
  private state: GameState;
  private rng: RandomGenerator;
  
  startGame(config: GameConfig): GameState {
    this.state = createInitialGameState(config);
    return this.getState();
  }
  
  applyAction(action: GameAction): ActionResult {
    const validation = validateAction(this.state, action);
    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }
    
    const result = reduceAction(this.state, action);
    this.state = result.newState;
    return result;
  }
}
```

### Capa 5: Subsistemas

**Dice System:**

```
dice/
├── rng.ts    # Generador de números aleatorios
└── dice.ts   # Dados personalizados
```

**Utilidades:**

```
utils/
├── hex.ts       # Coordenadas hexagonales
└── helpers.ts   # Funciones auxiliares
```

## Flujo de Datos

### Flujo Normal de Acción

```
┌──────────────┐
│   UI Event   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Create Action   │  (types.ts)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Validate Action  │  (validators.ts)
└──────┬───────────┘
       │ valid?
       ▼
┌──────────────────┐
│  Reduce Action   │  (action-reducer.ts)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Apply Rules     │  (game-rules.ts)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   New State      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Update UI      │
└──────────────────┘
```

### Flujo de Fase Automática

```
┌──────────────────┐
│  Advance Phase   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Phase Machine   │  (phase-machine.ts)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Check Hooks     │  (enter/exit phase)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Auto Actions    │  (e.g., food consumption)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   New Phase      │
└──────────────────┘
```

## Patrones de Diseño Aplicados

### 1. State Pattern (Máquina de Estados)

La clase `PhaseMachine` gestiona las transiciones entre fases:

```typescript
const nextPhase = PhaseMachine.advance(state);
const canAdvance = PhaseMachine.canAdvance(state);
```

### 2. Command Pattern (Acciones)

Cada acción encapsula un comando:

```typescript
interface GameAction {
  type: ActionType;
  playerId: PlayerId;
  timestamp: number;
}
```

### 3. Strategy Pattern (Validadores)

Diferentes estrategias de validación por tipo de acción:

```typescript
switch (action.type) {
  case ActionType.MOVE_CHARACTER:
    return validateMoveCharacter(state, action);
  case ActionType.GATHER_RESOURCES:
    return validateGatherResources(state, action);
}
```

### 4. Factory Pattern (Creación de Estado)

```typescript
export function createInitialGameState(config: GameConfig): GameState {
  // Construcción compleja del estado inicial
}
```

### 5. Observer Pattern (Eventos)

```typescript
interface ActionResult {
  success: boolean;
  newState?: GameState;
  events?: GameEvent[];  // Observable events
}
```

## Decisiones de Diseño Clave

### ¿Por qué Maps en lugar de Arrays?

```typescript
// ✅ BIEN: Búsqueda O(1)
characters: Map<CharacterId, Character>

// ❌ Evitado: Búsqueda O(n)
characters: Character[]
```

**Razón:** Acceso constante para operaciones frecuentes.

### ¿Por qué RNG Inyectable?

```typescript
interface RandomGenerator {
  next(): number;
  getState(): number;
  setState(state: number): void;
}
```

**Razón:**
- Testing con valores fijos
- Determinismo garantizado
- Serialización del estado RNG

### ¿Por qué Validación Separada?

```typescript
// Paso 1: Validar (sin efectos)
const validation = validateAction(state, action);

// Paso 2: Aplicar (si válida)
if (validation.valid) {
  const newState = reduceAction(state, action);
}
```

**Razón:**
- UI puede pre-validar antes de enviar
- Testing de validación separado
- Mensajes de error claros

### ¿Por qué No Clases para Entidades?

```typescript
// ✅ Usado: Plain objects
interface Character {
  id: string;
  type: CharacterType;
}

// ❌ Evitado: Clases con métodos
class Character {
  move() { /* ... */ }
}
```

**Razón:**
- Serialización trivial (JSON.stringify)
- No hay pérdida de métodos al deserializar
- Funciones puras externas más testables

## Testing Strategy

### Niveles de Testing

**1. Unit Tests (Reglas individuales):**

```typescript
test_FoodConsumption_EnoughFood();
test_AlienControl_DisablesCharacters();
```

**2. Integration Tests (Flujo completo):**

```typescript
test_CompleteTurn();
test_VictoryCondition();
```

**3. Property-Based Tests (Invariantes):**

```typescript
// Todo estado debe ser serializable
assert(JSON.parse(JSON.stringify(state)));

// La suma de humanos nunca puede ser negativa
assert(getTotalHumans(state) >= 0);
```

**4. Replay Tests (Determinismo):**

```typescript
const finalState1 = replay(actions, seed);
const finalState2 = replay(actions, seed);
assert(isEqual(finalState1, finalState2));
```

## Extensibilidad

### Agregar Nueva Acción

1. Definir tipo en `actions/types.ts`:

```typescript
export interface NewAction extends BaseAction {
  type: ActionType.NEW_ACTION;
  customData: string;
}
```

2. Agregar validador en `actions/validators.ts`:

```typescript
function validateNewAction(state: GameState, action: NewAction) {
  // Validación
}
```

3. Agregar reducer en `core/action-reducer.ts`:

```typescript
case ActionType.NEW_ACTION:
  return reduceNewAction(state, action, events);
```

### Agregar Nueva Regla

1. Implementar en `rules/game-rules.ts`:

```typescript
/**
 * Manual: Nueva regla del juego
 */
export function applyNewRule(state: GameState): GameState {
  // Implementación
}
```

2. Integrar en fase correspondiente (reducer o phase machine)

## Performance Considerations

### Operaciones Costosas

**Clonación de Estado:**
- Solo clonar lo necesario
- Maps y Sets son eficientes en clonación

**Búsquedas:**
- Usar Maps para O(1) lookup
- Evitar iteraciones innecesarias

**Serialización:**
- JSON.stringify es rápido para objetos planos
- Evitar referencias circulares

### Optimizaciones Aplicadas

1. **Structural Sharing:**
   ```typescript
   // Solo clonar lo que cambia
   const newState = {
     ...state,
     characters: new Map(state.characters), // Nueva Map
     // tiles, ghettos no cambiaron -> reutilizar
   };
   ```

2. **Lazy Evaluation:**
   ```typescript
   // Solo calcular cuando sea necesario
   const stats = engine.getStats(); // Calcula bajo demanda
   ```

## Multiplayer Architecture

### Deterministic Lockstep

```
Cliente A              Servidor              Cliente B
   │                      │                      │
   │── Action ───────────▶│                      │
   │                      │────── Action ───────▶│
   │                      │                      │
   │   Aplica localmente  │   Valida + Broadcast │   Aplica remotamente
   │                      │                      │
   ▼                      ▼                      ▼
 Estado A              Validado              Estado B
(idéntico)                                  (idéntico)
```

### Sincronización

```typescript
// Cliente
socket.on('game-action', (action: GameAction) => {
  const result = engine.applyAction(action);
  if (!result.success) {
    // Desync detectado - solicitar estado completo
    socket.emit('request-sync');
  }
});

// Servidor valida y difunde
socket.on('game-action', (action: GameAction) => {
  const validation = engine.validateAction(action);
  if (validation.valid) {
    engine.applyAction(action);
    broadcast('game-action', action);
  }
});
```

## Conclusión

Esta arquitectura proporciona:

✅ **Mantenibilidad**: Código organizado y desacoplado  
✅ **Testabilidad**: 100% de cobertura posible  
✅ **Portabilidad**: Funciona en cualquier plataforma JavaScript  
✅ **Escalabilidad**: Fácil agregar nuevas reglas y acciones  
✅ **Confiabilidad**: Determinismo garantizado  
✅ **Colaboración**: Multiplayer sin complicaciones

El motor está listo para soportar el juego completo de JORUMI y evolucionar con futuras expansiones.



