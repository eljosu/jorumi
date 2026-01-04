# JORUMI - Arquitectura Multiplayer con Servidor Autoritativo

## 📋 Tabla de Contenidos

1. [Modelo de Autoridad](#modelo-de-autoridad)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo de Mensajes](#flujo-de-mensajes)
4. [Protocolo de Comunicación](#protocolo-de-comunicación)
5. [Integración con el Motor](#integración-con-el-motor)
6. [Guía de Implementación](#guía-de-implementación)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎯 Modelo de Autoridad

### Servidor (Autoritativo) ✅

El servidor es la **ÚNICA fuente de verdad**:

```typescript
✅ Ejecuta el motor de reglas (GameEngine)
✅ Valida TODAS las acciones de jugadores
✅ Genera RNG (dados, aleatoriedad)
✅ Mantiene GameState oficial
✅ Resuelve turnos y fases
✅ Aplica mecánicas del juego
✅ Detecta condiciones de victoria
```

### Cliente (No Autoritativo) ❌

El cliente es **SOLO interfaz de usuario**:

```typescript
✅ Renderiza estado recibido del servidor
✅ Captura input del jugador
✅ Envía comandos al servidor
✅ Reproduce animaciones y efectos visuales
❌ NO ejecuta reglas del juego
❌ NO modifica GameState
❌ NO genera dados o aleatoriedad
❌ NO valida acciones
```

---

## 🏗 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                  SERVIDOR AUTORITATIVO                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         GameEngine (motor de reglas puro)             │  │
│  │  • Ejecuta applyAction()                              │  │
│  │  • Valida con validateAction()                        │  │
│  │  • Mantiene GameState                                 │  │
│  │  • Genera RNG deterministico                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              GameRoom                                  │  │
│  │  • Una sala = Una instancia de GameEngine             │  │
│  │  • Gestiona jugadores conectados                      │  │
│  │  • Enruta acciones al motor                           │  │
│  │  • Genera eventos de juego                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           RoomManager                                  │  │
│  │  • Gestiona múltiples salas                           │  │
│  │  • Matchmaking                                        │  │
│  │  • Limpieza de salas inactivas                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     SocketServer (Socket.IO)                          │  │
│  │  • Gestión de conexiones WebSocket                    │  │
│  │  • Broadcast a jugadores en salas                     │  │
│  │  • Validación de mensajes                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕ ↕ ↕
        ┌──────────────────┴─┴─┴──────────────────┐
        ↓                    ↓                     ↓
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Cliente 1    │    │  Cliente 2    │    │  Cliente N    │
│               │    │               │    │               │
│ SocketClient  │    │ SocketClient  │    │ SocketClient  │
│      ↕        │    │      ↕        │    │      ↕        │
│ NetworkStore  │    │ NetworkStore  │    │ NetworkStore  │
│   (Zustand)   │    │   (Zustand)   │    │   (Zustand)   │
│      ↕        │    │      ↕        │    │      ↕        │
│  React UI     │    │  React UI     │    │  React UI     │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 📡 Flujo de Mensajes

### 1. Flujo de Acción Completo

```
┌─────────┐                                              ┌─────────┐
│ Cliente │                                              │ Servidor│
└────┬────┘                                              └────┬────┘
     │                                                        │
     │  1. sendAction(MOVE_CHARACTER)                        │
     ├───────────────────────────────────────────────────────>│
     │                                                        │
     │                      2. Servidor valida:               │
     │                         - ¿Es su turno?                │
     │                         - ¿Rol correcto?               │
     │                         - ¿Acción válida?              │
     │                                                        │
     │                      3a. SI VÁLIDA:                    │
     │                          - engine.applyAction()        │
     │                          - Actualiza GameState         │
     │                                                        │
     │  4. GAME_STATE_UPDATE + events                         │
     │<───────────────────────────────────────────────────────┤
     │                                                        │
     │  5. ACTION_APPLIED                                     │
     │<───────────────────────────────────────────────────────┤
     │                                                        │
     │                      3b. SI INVÁLIDA:                  │
     │  6. ACTION_REJECTED + reason                           │
     │<───────────────────────────────────────────────────────┤
     │                                                        │
     │  7. Cliente renderiza nuevo estado                     │
     │     (sin ejecutar reglas)                              │
     │                                                        │
```

### 2. Flujo de Conexión

```
Cliente                          Servidor
  │                                 │
  │ connect()                       │
  ├────────────────────────────────>│
  │                                 │
  │ <──── CONNECTED ────────────────┤
  │                                 │
  │ CREATE_ROOM                     │
  ├────────────────────────────────>│
  │                                 │
  │                     [Crea GameRoom]
  │                     [Agrega jugador]
  │                                 │
  │ ROOM_CREATED (roomId, playerId) │
  │<────────────────────────────────┤
  │                                 │
```

### 3. Flujo de Inicio de Partida

```
Cliente 1            Servidor              Cliente 2
  │                    │                      │
  │ JOIN_ROOM          │                      │
  ├───────────────────>│                      │
  │                    │                      │
  │                    │<─────────────────────┤
  │                    │    JOIN_ROOM         │
  │                    │                      │
  │      [2 jugadores → Iniciar partida]      │
  │      [Asignar roles: HUMAN / ALIEN]       │
  │      [engine.startGame()]                 │
  │                    │                      │
  │ GAME_STARTED       │                      │
  │<───────────────────┤                      │
  │                    ├─────────────────────>│
  │                    │     GAME_STARTED     │
  │                    │                      │
  │ PLAYER_ROLE_ASSIGNED (HUMAN)              │
  │<───────────────────┤                      │
  │                    ├─────────────────────>│
  │                    │ PLAYER_ROLE_ASSIGNED │
  │                    │       (ALIEN)        │
  │                    │                      │
```

---

## 🔌 Protocolo de Comunicación

### Mensajes Cliente → Servidor

#### CREATE_ROOM
```typescript
{
  type: 'CREATE_ROOM',
  playerName: string,
  roomConfig?: {
    maxPlayers: number,
    isPrivate: boolean,
    gameSeed?: number
  }
}
```

#### JOIN_ROOM
```typescript
{
  type: 'JOIN_ROOM',
  roomId: string,
  playerName: string
}
```

#### PLAYER_ACTION
```typescript
{
  type: 'PLAYER_ACTION',
  roomId: string,
  action: GameAction  // Del motor de reglas
}
```

**Ejemplo de acción:**
```typescript
{
  type: 'PLAYER_ACTION',
  roomId: 'abc123',
  action: {
    type: ActionType.MOVE_CHARACTER,
    playerId: 'player_001',
    characterId: 'char_doctor',
    targetTileId: 'tile_forest_02',
    timestamp: 1234567890
  }
}
```

#### REQUEST_SNAPSHOT
```typescript
{
  type: 'REQUEST_SNAPSHOT',
  roomId: string
}
```

### Mensajes Servidor → Cliente

#### ROOM_JOINED
```typescript
{
  type: 'ROOM_JOINED',
  roomId: string,
  playerId: string,
  playerName: string,
  players: RoomPlayer[],
  gameState: GameState | null
}
```

#### GAME_STATE_UPDATE
```typescript
{
  type: 'GAME_STATE_UPDATE',
  roomId: string,
  gameState: GameState,
  events: GameEvent[]
}
```

#### ACTION_REJECTED
```typescript
{
  type: 'ACTION_REJECTED',
  roomId: string,
  action: GameAction,
  reason: string
}
```

**Ejemplos de razones:**
- "Not your turn"
- "Wrong phase for this action"
- "Character cannot move - is wounded"
- "Insufficient resources"
- "Invalid target tile"

#### DICE_ROLLED
```typescript
{
  type: 'DICE_ROLLED',
  roomId: string,
  diceType: DiceType,
  result: number | AlienAttackFace | AlienActionFace,
  context?: string
}
```

#### PHASE_CHANGED
```typescript
{
  type: 'PHASE_CHANGED',
  roomId: string,
  previousPhase: GamePhase,
  newPhase: GamePhase,
  turn: number
}
```

---

## ⚙️ Integración con el Motor

### Servidor: Ejecuta el Motor

```typescript
// server/src/core/game-room.ts

import { GameEngine, GameAction } from '../../../engine';

class GameRoom {
  private engine: GameEngine;
  
  constructor() {
    this.engine = new GameEngine({
      enableLogging: true,
      enableHistory: true,
    });
  }
  
  startGame(playerNames: string[], seed?: number) {
    // Ejecutar motor en el servidor
    const gameState = this.engine.startGame({
      playerNames,
      seed: seed ?? Date.now(),
    });
    
    return gameState;
  }
  
  applyPlayerAction(playerId: string, action: GameAction) {
    // 1. Validar con el motor
    const validation = this.engine.validateAction(action);
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.reason,
      };
    }
    
    // 2. Aplicar con el motor
    const result = this.engine.applyAction(action);
    
    return result;
  }
}
```

### Cliente: NO Ejecuta el Motor

```typescript
// client/src/store/network-store.ts

// ❌ NO importar GameEngine en el cliente
// ❌ NO ejecutar applyAction en el cliente

// ✅ Solo enviar acciones
export const useNetworkStore = create((set, get) => ({
  sendAction: (action: GameAction) => {
    const { client } = get();
    
    // Solo enviar al servidor
    client.sendAction(action);
    
    // NO ejecutar: engine.applyAction(action)
  },
}));
```

---

## 🚀 Guía de Implementación

### Paso 1: Instalar Dependencias

#### Servidor
```bash
cd server
npm install
```

#### Cliente
```bash
cd client
npm install socket.io-client
```

### Paso 2: Iniciar Servidor

```bash
cd server
npm run dev
```

El servidor iniciará en `http://localhost:3001`

### Paso 3: Conectar Cliente

```typescript
// client/src/App.tsx

import { useEffect } from 'react';
import { useNetworkStore } from './store/network-store';

function App() {
  const connect = useNetworkStore((state) => state.connect);
  const isConnected = useNetworkStore((state) => state.isConnected);
  
  useEffect(() => {
    connect();
  }, []);
  
  return (
    <div>
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
    </div>
  );
}
```

### Paso 4: Crear/Unirse a Sala

```typescript
import { useNetworkStore } from './store/network-store';

function Lobby() {
  const createRoom = useNetworkStore((state) => state.createRoom);
  const joinRoom = useNetworkStore((state) => state.joinRoom);
  
  return (
    <div>
      <button onClick={() => createRoom('Player1')}>
        Create Room
      </button>
      
      <button onClick={() => joinRoom('room_id', 'Player2')}>
        Join Room
      </button>
    </div>
  );
}
```

### Paso 5: Enviar Acciones

```typescript
import { useNetworkStore } from './store/network-store';
import { ActionType } from '../../../engine';

function GameBoard() {
  const sendAction = useNetworkStore((state) => state.sendAction);
  const playerId = useNetworkStore((state) => state.playerId);
  const gameState = useNetworkStore((state) => state.gameState);
  
  const handleMoveCharacter = (characterId: string, tileId: string) => {
    // Construir acción
    const action = {
      type: ActionType.MOVE_CHARACTER,
      playerId: playerId!,
      characterId,
      targetTileId: tileId,
      timestamp: Date.now(),
    };
    
    // Enviar al servidor (no ejecutar)
    sendAction(action);
  };
  
  return <div>...</div>;
}
```

### Paso 6: Renderizar Estado del Servidor

```typescript
import { useNetworkStore } from './store/network-store';

function GameView() {
  const gameState = useNetworkStore((state) => state.gameState);
  
  if (!gameState) {
    return <div>Waiting for game to start...</div>;
  }
  
  return (
    <div>
      <h2>Turn: {gameState.turn}</h2>
      <h3>Phase: {gameState.phase}</h3>
      
      {/* Renderizar basándose en gameState recibido del servidor */}
      {Array.from(gameState.characters.values()).map(char => (
        <div key={char.id}>{char.name}</div>
      ))}
    </div>
  );
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Flujo Completo

Ver `examples/multiplayer-example.tsx`

### Ejemplo 2: Mover Personaje

```typescript
// Cliente construye acción
const moveAction = {
  type: ActionType.MOVE_CHARACTER,
  playerId: myPlayerId,
  characterId: 'char_soldier_01',
  targetTileId: 'tile_mine_05',
  timestamp: Date.now(),
};

// Enviar al servidor
socketClient.sendAction(moveAction);

// Servidor:
// 1. Valida: ¿Es turno del jugador? ✓
// 2. Valida: ¿Es fase MOVEMENT? ✓
// 3. Valida: ¿Personaje puede moverse? ✓
// 4. Ejecuta: engine.applyAction(moveAction)
// 5. Broadcast: Nuevo GameState a todos
```

### Ejemplo 3: Tirada de Dados

```typescript
// ❌ Cliente NUNCA hace esto:
const diceResult = Math.random() * 6 + 1;

// ✅ Servidor hace esto:
const rng = engine.getRNG();
const diceManager = engine.getDiceManager();
const result = diceManager.roll(DiceType.HUMAN_D6, rng);

// Servidor envía resultado al cliente:
broadcast({
  type: 'DICE_ROLLED',
  diceType: 'HUMAN_D6',
  result: 4,
});
```

### Ejemplo 4: Reconexión

```typescript
// Cliente pierde conexión
socket.on('disconnect', () => {
  console.log('Disconnected');
});

// Cliente reconecta
socket.on('connect', () => {
  // Solicitar estado completo
  socketClient.requestSnapshot();
});

// Servidor envía snapshot
socket.on('message', (msg) => {
  if (msg.type === 'GAME_STATE_SNAPSHOT') {
    // Actualizar store con estado oficial
    updateGameState(msg.gameState);
  }
});
```

---

## 🔒 Seguridad

### Validaciones del Servidor

1. **Turno del jugador**
   ```typescript
   if (gameState.currentPlayerId !== action.playerId) {
     return { error: 'Not your turn' };
   }
   ```

2. **Rol del jugador**
   ```typescript
   const playerRole = getPlayerRole(action.playerId);
   if (action.type === ALIEN_ACTION && playerRole !== PlayerRole.ALIEN) {
     return { error: 'Wrong role' };
   }
   ```

3. **Fase correcta**
   ```typescript
   if (action.type === MOVE_CHARACTER && gameState.phase !== GamePhase.MOVEMENT) {
     return { error: 'Wrong phase' };
   }
   ```

4. **Validación del motor**
   ```typescript
   const validation = engine.validateAction(action);
   if (!validation.valid) {
     return { error: validation.reason };
   }
   ```

### Principios de Seguridad

- ✅ **Nunca confiar en el cliente**
- ✅ **Validar TODO en el servidor**
- ✅ **RNG solo en el servidor**
- ✅ **GameState autoritativo**
- ✅ **Ignorar acciones fuera de turno**
- ✅ **Rate limiting** (TODO)
- ✅ **Autenticación JWT** (TODO)

---

## 📊 Diagrama de Secuencia: Acción Completa

```
Cliente 1         SocketServer        GameRoom         GameEngine        Cliente 2
   │                   │                 │                 │                 │
   │ sendAction()      │                 │                 │                 │
   ├──────────────────>│                 │                 │                 │
   │                   │ handleAction()  │                 │                 │
   │                   ├────────────────>│                 │                 │
   │                   │                 │ validateAction()│                 │
   │                   │                 ├────────────────>│                 │
   │                   │                 │<────────────────┤                 │
   │                   │                 │   valid: true   │                 │
   │                   │                 │                 │                 │
   │                   │                 │ applyAction()   │                 │
   │                   │                 ├────────────────>│                 │
   │                   │                 │<────────────────┤                 │
   │                   │                 │  newState       │                 │
   │                   │                 │                 │                 │
   │                   │ GAME_STATE_UPDATE                 │                 │
   │<──────────────────┼─────────────────┼─────────────────┼────────────────>│
   │                   │                 │                 │                 │
   │  Renderizar       │                 │                 │   Renderizar    │
   │  nuevo estado     │                 │                 │   nuevo estado  │
   │                   │                 │                 │                 │
```

---

## 🎲 RNG y Determinismo

### Seed por Partida

Cada sala tiene su propio seed:

```typescript
const room = new GameRoom({
  gameSeed: 12345,  // Mismo seed = mismos resultados
});

// Permite:
// - Replays deterministas
// - Debug reproducible
// - Verificación de resultados
```

### Generación de Dados

```typescript
// Servidor (ÚNICO lugar donde se genera)
const rng = engine.getRNG();
const result = rng.nextInt(1, 6);

// Cliente recibe solo el resultado
onDiceRolled(diceType, result) {
  // Mostrar animación con resultado recibido
  showDiceAnimation(result);
}
```

---

## 🛠 Troubleshooting

### Problema: Cliente no recibe actualizaciones

**Solución:** Verificar que el socket esté en la sala correcta
```typescript
socket.join(roomId);
```

### Problema: Acción rechazada sin razón clara

**Solución:** Activar logging en el servidor
```typescript
const engine = new GameEngine({
  enableLogging: true,
});
```

### Problema: Estados desincronizados

**Solución:** Solicitar snapshot
```typescript
socketClient.requestSnapshot();
```

---

## 📚 Referencias

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Motor de Reglas JORUMI](../engine/README.md)
- [Servidor README](../server/README.md)

---

## ✅ Checklist de Implementación

### Servidor
- [x] GameEngine integrado
- [x] GameRoom con validación
- [x] RoomManager con matchmaking
- [x] SocketServer con Socket.IO
- [x] Protocolo de mensajes definido
- [x] Validación de turnos y roles
- [x] RNG autoritativo
- [ ] Persistencia (TODO)
- [ ] Autenticación (TODO)
- [ ] Rate limiting (TODO)

### Cliente
- [x] SocketClient sin motor
- [x] NetworkStore con Zustand
- [x] Hooks de integración
- [x] Componentes de lobby
- [x] Componentes de juego
- [x] Manejo de reconexión
- [ ] Animaciones (TODO)
- [ ] Efectos de sonido (TODO)

---

**¡Sistema multiplayer autoritativo completo e implementado!** 🎮✨



