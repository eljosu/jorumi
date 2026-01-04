# 🚀 JORUMI Game Engine - Quick Start Guide

## Instalación Rápida

```bash
cd engine
npm install
```

## Primer Uso (5 minutos)

### 1. Importar el Motor

```typescript
import { GameEngine } from './engine';
```

### 2. Crear y Empezar Partida

```typescript
const engine = new GameEngine({ enableLogging: true });

const state = engine.startGame({
  playerNames: ['Alice', 'Bob'],
  seed: 12345, // Opcional: para reproducibilidad
});

console.log('Game started!', state.gameId);
```

### 3. Ver Estado Actual

```typescript
const currentState = engine.getState();

console.log('Turn:', currentState.turn);
console.log('Phase:', currentState.phase);
console.log('Ghettos:', currentState.ghettos.size);
console.log('Characters:', currentState.characters.size);

// Estadísticas rápidas
const stats = engine.getStats();
console.log('Stats:', stats);
```

### 4. Aplicar una Acción

```typescript
import { ActionType } from './engine';

// Obtener primer personaje
const character = Array.from(currentState.characters.values())[0];
const targetTile = Array.from(currentState.tiles.values())[1];

// Crear acción
const action = {
  type: ActionType.MOVE_CHARACTER,
  playerId: currentState.currentPlayerId,
  characterId: character.id,
  targetTileId: targetTile.id,
  timestamp: Date.now(),
};

// Aplicar
const result = engine.applyAction(action);

if (result.success) {
  console.log('✓ Action applied!');
  console.log('Events:', result.events);
} else {
  console.log('✗ Failed:', result.error);
}
```

### 5. Avanzar Fase

```typescript
const phaseResult = engine.advancePhase();

if (phaseResult.success) {
  const newState = engine.getState();
  console.log('New phase:', newState.phase);
}
```

## Ejemplos Incluidos

### Ejecutar Todos los Ejemplos

```bash
npm run examples
```

Esto ejecutará 7 ejemplos completos:
1. Crear partida
2. Mover personaje
3. Recolectar recursos
4. Construir edificio
5. Turno completo
6. Guardar/cargar
7. Sistema de dados

### Ejecutar Tests

```bash
npm test
```

Ejecuta 11 tests unitarios de reglas complejas.

## Casos de Uso Comunes

### Caso 1: Recolectar Recursos

```typescript
// Avanzar a fase de recolección
while (engine.getState().phase !== 'RESOURCE_GATHERING') {
  engine.advancePhase();
}

// Buscar campesino
const peasant = Array.from(engine.getState().characters.values())
  .find(c => c.type === 'PEASANT');

// Recolectar comida
const gatherAction = {
  type: ActionType.GATHER_RESOURCES,
  playerId: engine.getState().currentPlayerId,
  characterId: peasant.id,
  resourceType: 'FOOD',
  amount: 3,
  timestamp: Date.now(),
};

engine.applyAction(gatherAction);
```

### Caso 2: Construir Edificio

```typescript
// Avanzar a fase de comercio
while (engine.getState().phase !== 'TRADING') {
  engine.advancePhase();
}

// Buscar constructor
const constructor = Array.from(engine.getState().characters.values())
  .find(c => c.type === 'CONSTRUCTOR');

const ghetto = engine.getState().ghettos.get(constructor.ghettoId);

// Construir bunker (requiere 3 metal)
const buildAction = {
  type: ActionType.BUILD_STRUCTURE,
  playerId: engine.getState().currentPlayerId,
  characterId: constructor.id,
  ghettoId: ghetto.id,
  buildingType: 'BUNKER',
  timestamp: Date.now(),
};

engine.applyAction(buildAction);
```

### Caso 3: Guardar y Cargar

```typescript
// Guardar
const savedGame = engine.saveGame();
localStorage.setItem('jorumi-save', savedGame);

// Cargar
const loadedGame = localStorage.getItem('jorumi-save');
if (loadedGame) {
  engine.loadGame(loadedGame);
}
```

### Caso 4: Validar Antes de Aplicar

```typescript
const action = { /* ... */ };

// Validar primero
const validation = engine.validateAction(action);

if (validation.valid) {
  // Aplicar si es válida
  engine.applyAction(action);
} else {
  // Mostrar error al usuario
  console.log('Invalid:', validation.reason);
}
```

## Integración con React

### Hook Básico

```typescript
import { useState } from 'react';
import { GameEngine } from './engine';

function useGameEngine() {
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState(null);
  
  const startGame = (playerNames) => {
    const newState = engine.startGame({ playerNames });
    setState(newState);
  };
  
  const applyAction = (action) => {
    const result = engine.applyAction(action);
    if (result.success) {
      setState(engine.getState());
      return result.events;
    }
    return null;
  };
  
  return { state, startGame, applyAction };
}

// Uso en componente
function GameComponent() {
  const { state, startGame, applyAction } = useGameEngine();
  
  if (!state) {
    return <button onClick={() => startGame(['Player 1'])}>Start</button>;
  }
  
  return <div>Turn: {state.turn}</div>;
}
```

## Conceptos Clave

### Estado Inmutable

```typescript
// ❌ NO hacer esto
state.turn += 1;

// ✅ Hacer esto
const result = engine.applyAction(action);
const newState = result.newState;
```

### Determinismo

```typescript
// Misma semilla = mismo resultado
const engine1 = new GameEngine();
engine1.startGame({ playerNames: ['A'], seed: 12345 });

const engine2 = new GameEngine();
engine2.startGame({ playerNames: ['A'], seed: 12345 });

// Aplicar mismas acciones = mismo estado final
```

### Serialización

```typescript
// El estado es completamente serializable
const json = engine.saveGame();
const parsed = JSON.parse(json);
// Todos los datos están ahí
```

## Tipos Importantes

### GameState

```typescript
interface GameState {
  gameId: string;
  turn: number;
  phase: GamePhase;
  players: Player[];
  tiles: Map<TileId, Tile>;
  ghettos: Map<GhettoId, Ghetto>;
  characters: Map<CharacterId, Character>;
  alien: AlienState;
  gameOver: boolean;
}
```

### GameAction

```typescript
interface GameAction {
  type: ActionType;
  playerId: PlayerId;
  timestamp: number;
  // ... campos específicos según tipo
}
```

### ActionResult

```typescript
interface ActionResult {
  success: boolean;
  newState?: GameState;
  error?: string;
  events?: GameEvent[];
}
```

## Fases del Juego

1. **PREPARATION** - Automática (consumo de comida)
2. **EXPLORATION** - Colocar losetas
3. **MOVEMENT** - Mover personajes
4. **RESOURCE_GATHERING** - Recolectar recursos
5. **TRADING** - Intercambio y construcción
6. **ALIEN_TURN** - Turno del alienígena
7. **ROLE_CHECK** - Verificación de roles
8. **END_GAME_CHECK** - Verificación de victoria

## Personajes y Habilidades

| Personaje   | Habilidad                  | Capacidad       |
|-------------|----------------------------|-----------------|
| PEASANT     | Recolecta comida           | 3 por acción    |
| MINER       | Recolecta minerales/metal  | 2 de cada uno   |
| DOCTOR      | Cura heridos               | 2 por acción    |
| SOLDIER     | Ataca alienígena           | 3 + dado        |
| CONSTRUCTOR | Construye edificios        | 1 por turno     |

## Recursos y Costos

### Recursos
- **FOOD** - Supervivencia (1 por humano/turno)
- **MEDICINE** - Curación (1 por herido)
- **METAL** - Construcción
- **MINERALS** - Victoria (baliza)

### Edificios y Costos
- **BUNKER** - 3 metal (reduce daño -2)
- **HOSPITAL** - 2 metal + 2 medicina (cura +2)
- **WORKSHOP** - 4 metal (conversiones)
- **BEACON** - 5 metal + 3 minerales (victoria)

## Condiciones de Victoria

1. **MOTHERSHIP_DESTROYED** - Destruir nave nodriza (20 HP)
2. **BEACON_ACTIVATED** - Activar baliza de rescate
3. **ESCAPE_SHIP** - Escapar con 5+ humanos
4. **TOTAL_DEFEAT** - Todos los humanos muertos (derrota)

## Debugging

### Habilitar Logging

```typescript
const engine = new GameEngine({ enableLogging: true });
// Verás logs en consola de todas las operaciones
```

### Inspeccionar Estado

```typescript
const state = engine.getState();

// Ver guettos
state.ghettos.forEach((ghetto, id) => {
  console.log(`${ghetto.name}:`, {
    population: ghetto.population,
    wounded: ghetto.wounded,
    resources: ghetto.resources,
  });
});

// Ver personajes
state.characters.forEach((char, id) => {
  console.log(`${char.name} (${char.type}):`, {
    isWounded: char.isWounded,
    isUsed: char.isUsed,
    canAct: char.canAct,
  });
});
```

### Historial de Acciones

```typescript
const history = engine.getHistory();
console.log('Actions taken:', history.length);
history.forEach((action, i) => {
  console.log(`${i + 1}. ${action.type}`);
});
```

## Troubleshooting

### "No active game"
```typescript
// Asegúrate de iniciar el juego primero
engine.startGame({ playerNames: ['Player 1'] });
```

### "Invalid action"
```typescript
// Verifica la fase actual
console.log('Current phase:', engine.getState().phase);

// Valida antes de aplicar
const validation = engine.validateAction(action);
console.log('Validation:', validation);
```

### "Character not found"
```typescript
// Verifica que el ID existe
const char = engine.getState().characters.get(characterId);
if (!char) {
  console.log('Character does not exist');
}
```

## Próximos Pasos

1. **Lee la documentación completa:** `README.md`
2. **Explora la arquitectura:** `ARCHITECTURE.md`
3. **Ve los diagramas:** `DIAGRAMS.md`
4. **Revisa los ejemplos:** `examples/basic-usage.ts`
5. **Estudia los tests:** `tests/game-rules.test.ts`
6. **Integra con tu UI:** `examples/ui-integration-example.ts`

## Recursos

- 📖 **README.md** - Documentación completa
- 🏛️ **ARCHITECTURE.md** - Diseño y patrones
- 📊 **DIAGRAMS.md** - Visualizaciones
- 💡 **examples/** - Ejemplos de código
- 🧪 **tests/** - Tests unitarios

## Soporte

Para preguntas o problemas, revisa:
1. La documentación en los archivos .md
2. Los ejemplos en `examples/`
3. Los tests en `tests/`

---

**¡Listo para empezar! 🎮**

```bash
npm run examples  # Ver ejemplos en acción
npm test          # Ejecutar tests
```



