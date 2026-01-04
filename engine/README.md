# 🎮 JORUMI Game Engine

Motor de reglas del juego de mesa cooperativo **JORUMI**, implementado en TypeScript puro siguiendo principios de arquitectura limpia y Domain-Driven Design.

## 📋 Características

- ✅ **Arquitectura limpia**: Desacoplado completamente de UI, frameworks y renderizado
- ✅ **Estado inmutable**: Todas las operaciones retornan nuevo estado
- ✅ **Determinista**: RNG seedeado para reproducibilidad exacta
- ✅ **Serializable**: Guardado/carga de partidas y multiplayer
- ✅ **Testeable**: Lógica pura con 100% de cobertura posible
- ✅ **Type-safe**: TypeScript estricto con tipos exhaustivos
- ✅ **Sin dependencias**: Cero dependencias externas de runtime

## 🏗️ Arquitectura

```
engine/
├── core/              # Núcleo del motor
│   ├── game-engine.ts    # Clase principal del motor
│   ├── state-factory.ts  # Creación de estados iniciales
│   └── action-reducer.ts # Aplicación de acciones (inmutable)
│
├── domain/            # Modelo de dominio
│   ├── types.ts          # Tipos e interfaces del juego
│   └── constants.ts      # Constantes y configuración
│
├── actions/           # Sistema de acciones/comandos
│   ├── types.ts          # Definición de todas las acciones
│   └── validators.ts     # Validación de acciones
│
├── rules/             # Reglas del juego
│   ├── phase-machine.ts  # Máquina de estados de fases
│   └── game-rules.ts     # Implementación de reglas del manual
│
├── dice/              # Sistema de dados
│   ├── rng.ts            # Generador de números aleatorios
│   └── dice.ts           # Dados personalizados del juego
│
├── utils/             # Utilidades
│   ├── hex.ts            # Lógica de coordenadas hexagonales
│   └── helpers.ts        # Funciones auxiliares
│
├── examples/          # Ejemplos de uso
│   └── basic-usage.ts
│
└── tests/             # Tests unitarios
    └── game-rules.test.ts
```

## 🚀 Uso Básico

### Instalación

```bash
npm install
```

### Ejemplo Simple

```typescript
import { GameEngine, ActionType } from './engine';

// Crear motor
const engine = new GameEngine({ 
  enableLogging: true 
});

// Iniciar partida
const state = engine.startGame({
  playerNames: ['Alice', 'Bob'],
  seed: 12345, // Opcional: para reproducibilidad
});

console.log('Partida creada:', state.gameId);
console.log('Turno:', state.turn);
console.log('Fase:', state.phase);

// Avanzar fase
engine.advancePhase();

// Aplicar acción
const action = {
  type: ActionType.MOVE_CHARACTER,
  playerId: state.currentPlayerId,
  characterId: 'character_123',
  targetTileId: 'tile_456',
  timestamp: Date.now(),
};

const result = engine.applyAction(action);

if (result.success) {
  console.log('✓ Acción aplicada correctamente');
  console.log('Eventos:', result.events);
} else {
  console.log('✗ Error:', result.error);
}
```

### Guardar y Cargar Partida

```typescript
// Guardar
const savedGame = engine.saveGame();
localStorage.setItem('jorumi-save', savedGame);

// Cargar
const loadedGame = localStorage.getItem('jorumi-save');
engine.loadGame(loadedGame);
```

### Sistema de Dados Determinista

```typescript
const diceManager = engine.getDiceManager();
const rng = engine.getRNG();

// Lanzar dado de ataque alienígena
const result = diceManager.roll('ALIEN_ATTACK', rng);
console.log('Resultado:', result.result); // 'SHIELD', 'ATTACK', etc.

// Para testing: RNG fijo
import { FixedRandom } from './engine/dice/rng';

const testRng = new FixedRandom([0.5, 0.8, 0.2]);
const testResult = diceManager.roll('HUMAN_D6', testRng);
```

## 🎯 Conceptos del Dominio

### GameState

Estado completo e inmutable del juego:

```typescript
interface GameState {
  gameId: string;
  turn: number;
  phase: GamePhase;
  currentPlayerId: PlayerId;
  
  players: Player[];
  tiles: Map<TileId, Tile>;
  ghettos: Map<GhettoId, Ghetto>;
  characters: Map<CharacterId, Character>;
  alien: AlienState;
  
  gameOver: boolean;
  victoryCondition?: VictoryCondition;
}
```

### Fases del Juego

El juego se estructura en 8 fases por turno:

1. **PREPARATION** - Preparación inicial, consumo de comida
2. **EXPLORATION** - Exploración y colocación de losetas
3. **MOVEMENT** - Movimiento de personajes
4. **RESOURCE_GATHERING** - Obtención de recursos
5. **TRADING** - Intercambio y conversiones
6. **ALIEN_TURN** - Turno del alienígena
7. **ROLE_CHECK** - Comprobación de cambio de rol
8. **END_GAME_CHECK** - Verificación de victoria/derrota

### Personajes

Cada personaje tiene habilidades únicas:

- **DOCTOR** - Cura humanos heridos
- **SOLDIER** - Combate contra alienígena
- **PEASANT** - Recolecta comida (3 por acción)
- **CONSTRUCTOR** - Construye edificios
- **MINER** - Obtiene minerales y metal (2 de cada uno)

### Recursos

- **FOOD** - Comida (necesaria para sobrevivir)
- **MEDICINE** - Medicina (cura heridos)
- **METAL** - Metal (construcción)
- **MINERALS** - Minerales (objetivo alienígena, baliza)

### Edificios

- **BUNKER** - Defensa (costo: 3 metal)
- **HOSPITAL** - Curación mejorada (costo: 2 metal + 2 medicina)
- **WORKSHOP** - Conversión de recursos (costo: 4 metal)
- **BEACON** - Condición de victoria (costo: 5 metal + 3 minerales)

## 🎲 Sistema de Acciones

Todas las modificaciones al estado se realizan mediante acciones validadas:

```typescript
// 1. Crear acción
const action: MoveCharacterAction = {
  type: ActionType.MOVE_CHARACTER,
  playerId: 'player_123',
  characterId: 'char_456',
  targetTileId: 'tile_789',
  timestamp: Date.now(),
};

// 2. Validar (opcional)
const validation = engine.validateAction(action);
if (!validation.valid) {
  console.log('Acción inválida:', validation.reason);
}

// 3. Aplicar
const result = engine.applyAction(action);
```

### Tipos de Acciones

- `MOVE_CHARACTER` - Mover personaje
- `GATHER_RESOURCES` - Recolectar recursos
- `BUILD_STRUCTURE` - Construir edificio
- `HEAL_WOUNDED` - Curar heridos
- `TRANSFER_RESOURCES` - Transferir recursos entre guettos
- `ATTACK_ALIEN` - Atacar al alienígena
- `ALIEN_CONTROL_GHETTO` - Control alienígena
- `ALIEN_BOMB` - Bomba alienígena (destruye loseta)
- `ACTIVATE_BEACON` - Activar baliza
- Y más...

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con ejemplos
npm run examples
```

### Escribir Tests

```typescript
import { applyFoodConsumption } from './engine/rules/game-rules';

function test_FoodConsumption() {
  const ghetto = {
    population: 10,
    wounded: 0,
    resources: { FOOD: 10, MEDICINE: 5, METAL: 3, MINERALS: 0 },
    // ... otros campos
  };
  
  const result = applyFoodConsumption(ghetto);
  
  console.assert(result.deaths === 0, 'No deaths expected');
  console.assert(result.ghetto.resources.FOOD === 0, 'Food consumed');
  console.log('✓ Test passed');
}
```

## 🔧 Reglas Implementadas

### Mecánicas de Supervivencia

- ✅ Consumo de comida por turno (1 por humano)
- ✅ Muerte por hambruna (50% sin comida)
- ✅ Curación de heridos con medicina
- ✅ Muerte de heridos sin medicina (30%)

### Control Alienígena

- ✅ Toma de control de guettos
- ✅ Deshabilitación de personajes en guettos controlados
- ✅ Liberación de guettos mediante combate

### Construcción

- ✅ Costos de recursos para edificios
- ✅ Efectos de edificios (defensa, curación, conversión)
- ✅ Límite de edificios por guetto

### Combate

- ✅ Ataque de soldados
- ✅ Sistema de escudo alienígena
- ✅ Daño a nave nodriza
- ✅ Reducción de daño por búnker

### Condiciones de Victoria

- ✅ Destrucción de nave nodriza
- ✅ Activación de baliza
- ✅ Escape en nave auxiliar
- ✅ Derrota total (todos los humanos muertos)

## 📊 Coordenadas Hexagonales

El mapa usa un sistema de coordenadas axiales:

```typescript
import { 
  createHexCoordinate, 
  hexDistance, 
  getAdjacentHexCoordinates 
} from './engine/utils/hex';

// Crear coordenada
const coord = createHexCoordinate(2, -1); // { q: 2, r: -1, s: -1 }

// Calcular distancia
const distance = hexDistance(coord1, coord2);

// Obtener adyacentes
const adjacent = getAdjacentHexCoordinates(coord);
```

## 🎮 Integración con UI

El motor está completamente desacoplado de la UI. Para integrarlo:

```typescript
// 1. Crear motor en tu aplicación
const gameEngine = new GameEngine();
gameEngine.startGame({ playerNames: ['Player 1'] });

// 2. Obtener estado y renderizar
const state = gameEngine.getState();
renderGame(state); // Tu función de renderizado

// 3. Aplicar acción desde UI
function onPlayerAction(action: GameAction) {
  const result = gameEngine.applyAction(action);
  
  if (result.success) {
    // Actualizar UI
    const newState = gameEngine.getState();
    renderGame(newState);
    
    // Mostrar eventos
    result.events?.forEach(event => {
      showNotification(event);
    });
  } else {
    // Mostrar error
    showError(result.error);
  }
}
```

## 🔄 Multiplayer y Replay

### Replay de Partida

```typescript
const actions: GameAction[] = [
  // ... historial de acciones
];

const finalState = engine.replay(
  { playerNames: ['Alice', 'Bob'], seed: 12345 },
  actions
);

console.log('Partida replicada:', finalState);
```

### Sincronización Multiplayer

```typescript
// Cliente A
const action = createMoveAction(...);
const result = engineA.applyAction(action);

if (result.success) {
  // Enviar acción a otros clientes
  socket.emit('game-action', action);
}

// Cliente B
socket.on('game-action', (action) => {
  // Aplicar misma acción
  engineB.applyAction(action);
  // Ambos motores ahora tienen el mismo estado
});
```

## 📝 Licencia

Este motor es parte del proyecto JORUMI.

## 🤝 Contribución

Ver documentación del proyecto principal.

---

**Desarrollado con ❤️ y TypeScript por el equipo JORUMI**


