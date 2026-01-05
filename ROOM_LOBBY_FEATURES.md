# 🎮 Room Lobby - Guía de Funcionalidades

## Fecha: 5 de enero de 2026

Esta guía explica las nuevas funcionalidades del sistema de salas (Room Lobby) implementadas en JORUMI.

---

## 🎯 ¿Qué es el Room Lobby?

El **Room Lobby** es la sala de espera donde los jugadores se reúnen antes de iniciar una partida. Es como la "antesala" del juego donde puedes:
- Ver tu Room ID
- Ver quién está conectado
- Esperar a que se unan más jugadores
- Iniciar el juego cuando todos estén listos

---

## 📱 Flujo de Usuario

### 1. **Menú Inicial (StartMenu)**
Cuando abres la app, verás:
- Campo "Your Name"
- Estado de conexión (🟢 Connected / 🟡 Connecting...)
- Botón "Create New Room"
- Botón "Join Existing Room"

### 2. **Crear una Sala**
1. Escribe tu nombre
2. Click en "Create New Room"
3. **→ Entras automáticamente al Room Lobby**

### 3. **Room Lobby (Sala de Espera)**

#### Vista General:
```
┌─────────────────────────────────────┐
│       🎮 Game Lobby                 │
│   Waiting for players...            │
├─────────────────────────────────────┤
│                                     │
│   Room ID: WaLJ3Q83Vt  [📋 Copy]   │
│   Share this ID with friends!       │
│                                     │
├─────────────────────────────────────┤
│   Players (1/4)                     │
│   ┌──────────────────────────────┐  │
│   │ 👑 Josue (You) (Host) ✓ Ready│  │
│   └──────────────────────────────┘  │
│   ┌──────────────────────────────┐  │
│   │ ⏳ Waiting for player...     │  │
│   └──────────────────────────────┘  │
│   ┌──────────────────────────────┐  │
│   │ ⏳ Waiting for player...     │  │
│   └──────────────────────────────┘  │
│   ┌──────────────────────────────┐  │
│   │ ⏳ Waiting for player...     │  │
│   └──────────────────────────────┘  │
├─────────────────────────────────────┤
│   📖 How to Play                    │
│   • Minimum 2 players to start      │
│   • One player will be HUMAN        │
│   • The other will be ALIEN         │
│   • Work together to survive!       │
├─────────────────────────────────────┤
│   [Leave Room] [🎮 Start Game]     │
│                                     │
│   ⚠️ Need 1 more player to start   │
└─────────────────────────────────────┘
```

#### Elementos de la UI:

1. **Room ID Card** (arriba)
   - Muestra el ID único de la sala (ej: `WaLJ3Q83Vt`)
   - Botón "📋 Copy ID" para copiar al portapapeles
   - Cambia a "✓ Copied!" cuando copias
   - Mensaje: "Share this ID with friends so they can join your game!"

2. **Players List** (centro)
   - Muestra hasta 4 jugadores (máximo)
   - Cada jugador tiene:
     - **Icono**: 👑 para host, 👤 para otros
     - **Color**: Azul para ti, gris para otros
     - **Nombre del jugador**
     - **Badge**: "(You)" si eres tú
     - **Badge**: "(Host)" para el primer jugador
     - **Badge**: "Role" si tiene rol asignado
     - **Estado**: 🟢 Ready
   - Slots vacíos muestran: ⏳ "Waiting for player..."

3. **Game Info Box** (centro-abajo)
   - Fondo azul oscuro
   - "📖 How to Play"
   - Lista de reglas básicas

4. **Action Buttons** (abajo)
   - **"Leave Room"** (rojo, siempre visible)
     - Pregunta confirmación antes de salir
   - **"🎮 Start Game"** (verde, solo para host)
     - Habilitado solo si hay ≥2 jugadores
     - Deshabilitado (gris) si falta jugadores
   - **"Waiting for host to start..."** (gris, para no-hosts)
     - Solo informativo

5. **Warning Message** (abajo)
   - ⚠️ Amarillo
   - Muestra: "Need X more player(s) to start"
   - Solo visible si faltan jugadores

---

## 🔄 Estados del Lobby

### Estado 1: Solo tú (1/4)
```
Players (1/4)
👑 Josue (You) (Host) ✓ Ready
⏳ Waiting for player...
⏳ Waiting for player...
⏳ Waiting for player...

[Leave Room] [Start Game - DISABLED]
⚠️ Need 1 more player to start
```

### Estado 2: Dos jugadores (2/4) - ¡Listo para jugar!
```
Players (2/4)
👑 Josue (You) (Host) ✓ Ready
👤 María ✓ Ready
⏳ Waiting for player...
⏳ Waiting for player...

[Leave Room] [🎮 Start Game - ENABLED]
```

### Estado 3: Sala completa (4/4)
```
Players (4/4)
👑 Josue (You) (Host) ✓ Ready
👤 María ✓ Ready
👤 Carlos ✓ Ready
👤 Ana ✓ Ready

[Leave Room] [🎮 Start Game - ENABLED]
```

---

## 🎮 Unirse a una Sala Existente

### Proceso para el segundo jugador:

1. **En el StartMenu**:
   - Escribe tu nombre
   - Click en "Join Existing Room"
   - Aparece un campo de texto
   - Ingresa el Room ID (ej: `WaLJ3Q83Vt`)
   - Click en "Join"

2. **Entras al Room Lobby**:
   - Ves a todos los jugadores ya conectados
   - Tu nombre aparece en la lista
   - Ves el mensaje: "Waiting for host to start..."
   - No puedes iniciar el juego (solo el host puede)

---

## 💻 Funciones Técnicas Implementadas

### Componente: `RoomLobby.tsx`
```typescript
// Estados que usa:
- roomInfo: Info de la sala (ID, jugadores, etc.)
- players: Array de jugadores conectados
- playerId: Tu ID único
- gameState: null (si está en lobby)

// Funciones:
- handleCopyRoomId(): Copia el Room ID al portapapeles
- handleStartGame(): Envía señal al servidor para iniciar
- handleLeaveRoom(): Sale de la sala
```

### Store: `network-store.ts` (Actualizado)
```typescript
// Callbacks mejorados:

onRoomCreated(roomId, playerId):
  - Crea roomInfo con tu jugador
  - Marca isInRoom = true
  - Te añade a la lista de players

onRoomJoined(info):
  - Actualiza roomInfo completo
  - Carga lista de jugadores existentes
  - Marca isInRoom = true

onPlayerJoined(player):
  - Añade nuevo jugador a players[]
  - Actualiza roomInfo.players

onPlayerLeft(playerId):
  - Elimina jugador de players[]
  - Actualiza roomInfo.players
```

### App.tsx (Lógica de Navegación)
```typescript
// Decisión de qué mostrar:

if (!isConnected || !isInRoom) {
  → Mostrar StartMenu
}
else if (!gameState) {
  → Mostrar RoomLobby (estás en sala, juego no iniciado)
}
else {
  → Mostrar GameScene + HUD (juego activo)
}
```

---

## 🎨 Diseño Visual

### Colores y Estilos:
- **Fondo**: Gradiente negro con jorumi-dark
- **Cards**: Fondo oscuro con opacidad 90%
- **Room ID**: Fondo gris oscuro, texto grande mono
- **Botón Copy**: Azul, cambia a verde al copiar
- **Player Cards**: Gris oscuro con bordes redondeados
- **Empty Slots**: Fondo gris con borde punteado
- **Host Icon**: 👑 amarillo
- **Ready Status**: 🟢 verde
- **Warnings**: ⚠️ amarillo

### Responsividad:
- `max-w-2xl`: Ancho máximo en pantallas grandes
- `w-full`: 100% en móviles
- `p-8`: Padding generoso
- `space-y-*`: Espaciado vertical consistente

---

## 🔮 Próximas Funcionalidades (TODO)

### Funciones que faltan implementar:

1. **Start Game (servidor)**
   - Actualmente el botón solo hace `console.log`
   - Necesita enviar mensaje `START_GAME` al servidor
   - Servidor debe validar que haya suficientes jugadores
   - Servidor debe inicializar GameEngine
   - Servidor debe enviar GAME_STARTED a todos

2. **Asignación de Roles Visual**
   - Mostrar "HUMAN" o "ALIEN" junto a cada jugador
   - Se asigna cuando el juego empieza

3. **Chat en Lobby** (opcional)
   - Los jugadores pueden hablar mientras esperan

4. **Configuración de Sala** (opcional)
   - Elegir número máximo de jugadores
   - Elegir si la sala es privada o pública
   - Elegir dificultad

5. **Kick Player** (opcional)
   - El host puede expulsar jugadores

6. **Ready Check** (opcional)
   - Cada jugador marca "Ready" antes de empezar
   - El juego solo empieza si todos están ready

---

## 🐛 Debugging

### Si no ves el Room Lobby:

1. **Verifica en consola**:
   ```javascript
   [NetworkStore] Room created: <ROOM_ID>
   ```
   Si ves esto, el lobby debería aparecer.

2. **Verifica estado de React**:
   - `isConnected`: debe ser `true`
   - `isInRoom`: debe ser `true`
   - `roomInfo`: debe tener `{ roomId, playerId, playerName, players }`

3. **Si no aparece**:
   - Recarga la página (Ctrl+F5)
   - Revisa errores en consola
   - Verifica que Netlify haya redespliegado

### Logs útiles:
```javascript
// Cuando creas sala:
[StartMenu] Create room clicked. Connected: true
[SocketClient] Creating room with player: <NAME>
[SocketClient] Message received: ROOM_CREATED
[NetworkStore] Room created: <ROOM_ID>

// Cuando se muestra el lobby:
// (No hay log específico, pero App.tsx renderiza RoomLobby)
```

---

## ✅ Checklist de Verificación

Después de que Netlify redespliegue:

- [ ] Abrir app en navegador
- [ ] Ver StartMenu con estado "🟢 Connected"
- [ ] Crear nueva sala con tu nombre
- [ ] **Ver Room Lobby aparecer automáticamente**
- [ ] Ver tu nombre en la lista de jugadores
- [ ] Ver el Room ID en grande arriba
- [ ] Click en "📋 Copy ID" y verificar que cambie a "✓ Copied!"
- [ ] Ver que "Start Game" esté deshabilitado (gris)
- [ ] Ver mensaje "⚠️ Need 1 more player to start"
- [ ] Abrir otra pestaña en modo incógnito
- [ ] Unirse con el Room ID copiado
- [ ] **Verificar que ambas pestañas muestren 2 jugadores**
- [ ] Verificar que "Start Game" se habilite (verde) en la primera pestaña
- [ ] Click en "Start Game" (actualmente solo hace log, juego no arranca todavía)

---

**Última actualización**: 5 de enero de 2026  
**Estado**: ✅ UI completamente funcional, falta implementar lógica de inicio de juego

