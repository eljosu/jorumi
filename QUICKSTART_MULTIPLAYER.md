# JORUMI Multiplayer - Guía de Inicio Rápido

## 🚀 Inicio en 5 Minutos

### 1. Instalar Dependencias

```bash
# Servidor
cd server
npm install

# Cliente
cd ../client
npm install socket.io-client
```

### 2. Iniciar Servidor

```bash
cd server
npm run dev
```

Verás:
```
═══════════════════════════════════════════════════
   🎮 JORUMI AUTHORITATIVE SERVER
═══════════════════════════════════════════════════

   Server:     http://localhost:3001
   WebSocket:  ws://localhost:3001
   Client:     http://localhost:5173

   Status:     ✓ Running
   Engine:     ✓ Loaded
   Rooms:      ✓ Ready

═══════════════════════════════════════════════════
```

### 3. Iniciar Cliente

```bash
cd client
npm run dev
```

### 4. Conectar y Jugar

1. Abre `http://localhost:5173` en dos pestañas
2. Primera pestaña: **"Create Room"**
3. Copia el Room ID
4. Segunda pestaña: **"Join Room"** (pega el Room ID)
5. ¡El juego inicia automáticamente cuando ambos jugadores están conectados!

---

## 📖 Ejemplo Básico de Código

### Conectar al Servidor

```typescript
import { useNetworkStore } from './store/network-store';

function App() {
  const connect = useNetworkStore((state) => state.connect);
  
  useEffect(() => {
    connect(); // Auto-conecta al montar
  }, []);
  
  return <div>My Game</div>;
}
```

### Crear Sala

```typescript
const createRoom = useNetworkStore((state) => state.createRoom);

<button onClick={() => createRoom('PlayerName')}>
  Create Room
</button>
```

### Enviar Acción

```typescript
import { ActionType } from '../../../engine';

const sendAction = useNetworkStore((state) => state.sendAction);
const playerId = useNetworkStore((state) => state.playerId);

const handleEndTurn = () => {
  sendAction({
    type: ActionType.END_TURN,
    playerId: playerId!,
    timestamp: Date.now(),
  });
};
```

### Renderizar Estado

```typescript
const gameState = useNetworkStore((state) => state.gameState);

if (!gameState) return <div>Waiting...</div>;

return (
  <div>
    <h2>Turn: {gameState.turn}</h2>
    <h3>Phase: {gameState.phase}</h3>
  </div>
);
```

---

## 🎯 Flujo de Juego Completo

```typescript
import { MultiplayerLobby } from './components/multiplayer/MultiplayerLobby';
import { GameBoard } from './components/GameBoard';
import { useNetworkStore } from './store/network-store';

function App() {
  const isInRoom = useNetworkStore((state) => state.isInRoom);
  const gameState = useNetworkStore((state) => state.gameState);
  
  // Conectar al servidor
  useEffect(() => {
    useNetworkStore.getState().connect();
  }, []);
  
  return (
    <>
      {!isInRoom && <MultiplayerLobby />}
      {isInRoom && !gameState && <WaitingForOpponent />}
      {isInRoom && gameState && <GameBoard />}
    </>
  );
}
```

---

## 🔑 Conceptos Clave

### 1. Cliente NO Ejecuta Reglas

```typescript
// ❌ INCORRECTO
const engine = new GameEngine();
engine.applyAction(action);

// ✅ CORRECTO
const sendAction = useNetworkStore((state) => state.sendAction);
sendAction(action);
```

### 2. Servidor Valida TODO

```typescript
// Servidor automáticamente valida:
// - ¿Es el turno del jugador?
// - ¿Fase correcta?
// - ¿Acción válida según reglas?
// - ¿Rol correcto?
```

### 3. Estado del Servidor es la Verdad

```typescript
// El cliente solo muestra lo que el servidor envía
const gameState = useNetworkStore((state) => state.gameState);

// Nunca modificar gameState localmente
```

---

## 🎮 Hooks Útiles

### Detectar Si Es Mi Turno

```typescript
import { useIsMyTurn } from './store/network-store';

function ActionButton() {
  const isMyTurn = useIsMyTurn();
  
  return (
    <button disabled={!isMyTurn}>
      {isMyTurn ? 'Your Turn' : 'Waiting...'}
    </button>
  );
}
```

### Obtener Mi Rol

```typescript
import { useMyRole } from './store/network-store';

function RoleDisplay() {
  const myRole = useMyRole();
  
  return <div>You are: {myRole}</div>;
}
```

### Escuchar Eventos

```typescript
const events = useNetworkStore((state) => state.events);

useEffect(() => {
  if (events.length > 0) {
    const lastEvent = events[events.length - 1];
    console.log('New event:', lastEvent.type);
  }
}, [events]);
```

---

## 🛠 Componentes Incluidos

### MultiplayerLobby
Componente completo de lobby con:
- Crear sala
- Unirse a sala
- Ver jugadores
- Copiar Room ID

```typescript
import { MultiplayerLobby } from './components/multiplayer/MultiplayerLobby';

<MultiplayerLobby />
```

### GameActions
Componente de ejemplo para enviar acciones:

```typescript
import { GameActions } from './components/multiplayer/GameActions';

<GameActions />
```

---

## 📊 Debugging

### Ver Estado de Conexión

```typescript
const isConnected = useNetworkStore((state) => state.isConnected);
const connectionStatus = useNetworkStore((state) => state.connectionStatus);

console.log('Connected:', isConnected);
console.log('Status:', connectionStatus);
```

### Ver Errores

```typescript
const lastError = useNetworkStore((state) => state.lastError);
const lastActionRejected = useNetworkStore((state) => state.lastActionRejected);

if (lastError) {
  console.error('Error:', lastError);
}

if (lastActionRejected) {
  console.warn('Action rejected:', lastActionRejected.reason);
}
```

### Logs del Servidor

El servidor muestra logs detallados:

```
[SocketServer] Client connected
[RoomManager] Room created { roomId: 'abc123' }
[GameRoom abc123] Player added { playerId: 'p1', playerName: 'Alice' }
[GameRoom abc123] Game started
[GameRoom abc123] Action applied: MOVE_CHARACTER
```

---

## 🔧 Configuración

### Variables de Entorno del Servidor

Crear `server/.env`:

```bash
PORT=3001
CLIENT_URL=http://localhost:5173
MAX_ROOMS=100
```

### Configurar URL del Servidor en Cliente

```typescript
const client = new SocketClient({
  serverUrl: 'http://localhost:3001',  // Cambiar en producción
});
```

---

## 📁 Archivos Importantes

```
server/
  src/
    index.ts                 # Punto de entrada del servidor
    core/
      game-room.ts          # Sala de juego individual
      room-manager.ts       # Gestor de salas
    network/
      socket-server.ts      # Servidor WebSocket
    types/
      messages.ts           # Protocolo de mensajes

client/
  src/
    network/
      socket-client.ts      # Cliente WebSocket
    store/
      network-store.ts      # Store de Zustand
    components/
      multiplayer/
        MultiplayerLobby.tsx
        GameActions.tsx

examples/
  multiplayer-example.tsx   # Ejemplo completo
  server-usage.ts           # Referencia del servidor
```

---

## ❓ FAQ

### ¿Por qué no puedo ejecutar el motor en el cliente?

El cliente nunca debe ejecutar reglas para evitar:
- Inconsistencias de estado
- Trampas
- Desincronización
- Resultados no deterministas

### ¿Cómo manejo la latencia?

JORUMI es un juego por turnos, por lo que la latencia no es crítica. No uses predicción del lado del cliente.

### ¿Qué pasa si un jugador se desconecta?

El servidor mantiene el estado. Cuando reconecta, solicita un snapshot:

```typescript
socketClient.requestSnapshot();
```

### ¿Puedo jugar offline?

Sí, usa el motor directamente sin servidor:

```typescript
import { GameEngine } from '../../../engine';

const engine = new GameEngine();
engine.startGame({ playerNames: ['Player1', 'Player2'] });
```

---

## ✅ Checklist Pre-Juego

- [ ] Servidor corriendo en puerto 3001
- [ ] Cliente conectado (🟢 Connected)
- [ ] Room creado o unido
- [ ] 2 jugadores en la sala
- [ ] Roles asignados
- [ ] Game State recibido

---

## 🎯 Próximos Pasos

1. ✅ **Completaste** el setup básico
2. 📖 Lee `MULTIPLAYER_ARCHITECTURE.md` para arquitectura detallada
3. 🎨 Personaliza los componentes de UI
4. 🎮 Implementa acciones específicas del juego
5. 🔊 Agrega efectos visuales y sonoros
6. 🚀 Deploy a producción

---

## 📚 Recursos

- [Arquitectura Completa](./MULTIPLAYER_ARCHITECTURE.md)
- [Documentación del Motor](./engine/README.md)
- [README del Servidor](./server/README.md)
- [Ejemplos](./examples/)

---

**¡Listo para jugar multiplayer!** 🎮✨



