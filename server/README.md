# JORUMI Authoritative Server

Servidor autoritativo para el juego JORUMI, implementado con Node.js, TypeScript, Express y Socket.IO.

## 🎯 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR AUTORITATIVO                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              GameEngine (motor puro)                   │  │
│  │  - Mantiene GameState oficial                         │  │
│  │  - Ejecuta TODAS las reglas                           │  │
│  │  - Genera RNG (dados)                                 │  │
│  │  - Valida acciones                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              GameRoomManager                           │  │
│  │  - Gestiona salas de juego                            │  │
│  │  - Matchmaking                                        │  │
│  │  - Sincronización jugadores                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           WebSocket Server (Socket.IO)                │  │
│  │  - Broadcast a jugadores                              │  │
│  │  - Gestión de conexiones                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura

```
server/
├── src/
│   ├── core/              # Lógica del servidor
│   │   ├── game-room.ts   # Sala de juego individual
│   │   └── room-manager.ts # Gestor de salas
│   ├── network/           # Comunicación
│   │   └── socket-server.ts # Servidor WebSocket
│   ├── types/             # Tipos TypeScript
│   │   └── messages.ts    # Protocolo de mensajes
│   └── index.ts           # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Inicio Rápido

### Instalación

```bash
cd server
npm install
```

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

### Verificar Estado

```bash
# Health check
curl http://localhost:3001/health

# Estadísticas
curl http://localhost:3001/stats
```

## 📡 Protocolo de Mensajes

### Cliente → Servidor

#### CREATE_ROOM
Crea una nueva sala de juego.

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
Se une a una sala existente.

```typescript
{
  type: 'JOIN_ROOM',
  roomId: string,
  playerName: string
}
```

#### PLAYER_ACTION
Ejecuta una acción del jugador (validada por el servidor).

```typescript
{
  type: 'PLAYER_ACTION',
  roomId: string,
  action: GameAction  // De engine/actions/types.ts
}
```

#### REQUEST_SNAPSHOT
Solicita el estado completo del juego (reconexión).

```typescript
{
  type: 'REQUEST_SNAPSHOT',
  roomId: string
}
```

### Servidor → Cliente

#### ROOM_JOINED
Confirmación de unión a sala.

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
Actualización del estado después de una acción.

```typescript
{
  type: 'GAME_STATE_UPDATE',
  roomId: string,
  gameState: GameState,
  events: GameEvent[]
}
```

#### ACTION_REJECTED
Acción rechazada por el servidor.

```typescript
{
  type: 'ACTION_REJECTED',
  roomId: string,
  action: GameAction,
  reason: string
}
```

#### DICE_ROLLED
Resultado de una tirada de dados (generado por el servidor).

```typescript
{
  type: 'DICE_ROLLED',
  roomId: string,
  diceType: string,
  result: any,
  context?: string
}
```

## 🔒 Modelo de Autoridad

### Servidor (Autoritativo)
- ✅ Ejecuta el motor de reglas
- ✅ Valida TODAS las acciones
- ✅ Genera RNG (dados)
- ✅ Mantiene GameState oficial
- ✅ Resuelve turnos y fases

### Cliente (No Autoritativo)
- ❌ NO ejecuta reglas
- ❌ NO genera dados
- ❌ NO modifica GameState
- ✅ Solo renderiza
- ✅ Solo envía comandos

## 🎲 RNG y Dados

El RNG vive **EXCLUSIVAMENTE** en el servidor:

1. Cada sala tiene su propio seed
2. El cliente recibe solo resultados finales
3. Posibilidad de replay con mismo seed
4. Debug determinista

## 🔄 Flujo de Acción

```
1. Cliente envía PlayerAction
          ↓
2. Servidor valida:
   - ¿Es el turno del jugador?
   - ¿Tiene el rol correcto?
   - ¿Es válida la acción?
          ↓
3a. SI VÁLIDA:
    - Ejecuta applyAction() en GameEngine
    - Actualiza GameState
    - Broadcast a todos los clientes
          ↓
3b. SI INVÁLIDA:
    - Envía ACTION_REJECTED
    - Incluye motivo del rechazo
```

## 🛠 Ejemplo de Uso

Ver `examples/` en el directorio raíz para ejemplos completos de:
- Crear y unirse a salas
- Enviar acciones
- Recibir updates
- Manejar reconexiones

## 📊 Endpoints HTTP

- `GET /` - Información del servidor
- `GET /health` - Health check
- `GET /stats` - Estadísticas en tiempo real

## 🔧 Configuración

Variables de entorno (`.env`):

```bash
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MAX_ROOMS=100
MAX_PLAYERS_PER_ROOM=2
ROOM_TIMEOUT_MS=3600000
```

## 📝 Logs

El servidor genera logs detallados:

```
[SocketServer] Client connected
[GameRoom abc123] Player added
[GameRoom abc123] Game started
[GameRoom abc123] Action applied: MOVE_CHARACTER
```

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencias Clave

- `socket.io` - WebSocket con soporte de salas
- `express` - Servidor HTTP
- `nanoid` - Generación de IDs únicos
- `@jorumi/engine` - Motor de reglas (workspace)

## 🔐 Seguridad

- ✅ Nunca confía en datos del cliente
- ✅ Valida TODAS las acciones
- ✅ Verifica turnos y roles
- ✅ Ignora acciones fuera de turno
- ✅ Rate limiting (TODO)
- ✅ Autenticación (TODO)

## 🚧 Roadmap

- [ ] Persistencia de partidas (database)
- [ ] Sistema de ranking
- [ ] Replays
- [ ] Espectadores
- [ ] Chat
- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Métricas y monitoring

## 📖 Documentación Adicional

- [Protocolo de Mensajes](./docs/PROTOCOL.md)
- [Arquitectura del Servidor](./docs/ARCHITECTURE.md)
- [Guía de Integración](./docs/INTEGRATION.md)



