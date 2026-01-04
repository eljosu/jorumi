# 🎮 JORUMI - Juego por Turnos con Multiplayer Autoritativo

JORUMI es un juego de estrategia por turnos ambientado en un mundo post-apocalíptico donde humanos luchan por sobrevivir contra una amenaza alienígena.

## 🌟 Características Principales

### Motor de Reglas Puro
- ✅ TypeScript determinista
- ✅ Inmutable y serializable
- ✅ Independiente de UI
- ✅ RNG seedeado para replays

### Sistema Multiplayer Autoritativo
- ✅ Servidor como única fuente de verdad
- ✅ Cliente no autoritativo (solo renderiza)
- ✅ WebSocket con Socket.IO
- ✅ Validación exhaustiva de acciones
- ✅ Sincronización perfecta de estado

### Frontend Moderno
- ✅ React + TypeScript
- ✅ Three.js para gráficos 3D
- ✅ Zustand para state management
- ✅ Tailwind CSS para estilos

## 📁 Estructura del Proyecto

```
jorumi/
├── engine/                      # Motor de reglas puro
│   ├── core/                   # GameEngine, reducers
│   ├── domain/                 # Tipos, constantes
│   ├── actions/                # Acciones y validadores
│   ├── rules/                  # Reglas del juego
│   ├── dice/                   # RNG y dados
│   └── utils/                  # Utilidades (hex grid, etc)
│
├── server/                      # Servidor autoritativo
│   ├── src/
│   │   ├── core/               # GameRoom, RoomManager
│   │   ├── network/            # SocketServer
│   │   ├── types/              # Protocolo de mensajes
│   │   └── index.ts            # Entry point
│   └── package.json
│
├── client/                      # Cliente React
│   ├── src/
│   │   ├── components/         # Componentes UI
│   │   │   ├── multiplayer/   # Lobby, GameActions
│   │   │   ├── scene/         # Three.js 3D
│   │   │   └── ui/            # HUD, panels
│   │   ├── network/           # SocketClient
│   │   ├── store/             # Zustand stores
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Helpers
│   └── package.json
│
├── examples/                    # Ejemplos de integración
└── docs/                       # Documentación adicional
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js >= 18
- npm >= 9

### Instalación

1. **Clonar repositorio**
   ```bash
   git clone <repo-url>
   cd jorumi
   ```

2. **Instalar dependencias del servidor**
   ```bash
   cd server
   npm install
   ```

3. **Instalar dependencias del cliente**
   ```bash
   cd ../client
   npm install
   ```

### Ejecución

1. **Iniciar servidor** (Terminal 1)
   ```bash
   cd server
   npm run dev
   ```
   
   Servidor corriendo en `http://localhost:3001` ✅

2. **Iniciar cliente** (Terminal 2)
   ```bash
   cd client
   npm run dev
   ```
   
   Cliente corriendo en `http://localhost:5173` ✅

3. **Jugar multiplayer**
   - Abrir dos pestañas en `http://localhost:5173`
   - Primera pestaña: **Create Room**
   - Segunda pestaña: **Join Room** (copiar Room ID)
   - ¡Jugar! 🎮

## 📚 Documentación

### Guías Principales
- [🏗 Arquitectura Multiplayer](./MULTIPLAYER_ARCHITECTURE.md) - Arquitectura completa del sistema
- [⚡ Guía de Inicio Rápido](./QUICKSTART_MULTIPLAYER.md) - Inicio en 5 minutos
- [📋 Resumen de Implementación](./IMPLEMENTATION_SUMMARY_MULTIPLAYER.md) - Entregables y checklist
- [🎮 Motor de Reglas](./engine/README.md) - Documentación del motor
- [🌐 Servidor](./server/README.md) - Documentación del servidor

### Ejemplos
- [Multiplayer Completo](./examples/multiplayer-example.tsx) - Integración React completa
- [Uso del Servidor](./examples/server-usage.ts) - Referencia del servidor

## 🎯 Modelo de Autoridad

### Servidor (Autoritativo) ✅
```
✅ Ejecuta GameEngine (motor de reglas)
✅ Valida TODAS las acciones
✅ Genera RNG (dados)
✅ Mantiene GameState oficial
✅ Resuelve turnos y fases
```

### Cliente (No Autoritativo) ❌
```
✅ Renderiza estado del servidor
✅ Captura input del jugador
✅ Envía comandos al servidor
❌ NO ejecuta reglas
❌ NO modifica GameState
❌ NO genera aleatoriedad
```

## 🔄 Flujo de Juego

```
1. Cliente envía acción → Servidor
2. Servidor valida (turno, rol, fase, reglas)
3. Servidor ejecuta en GameEngine
4. Servidor actualiza GameState
5. Servidor broadcast a TODOS los clientes
6. Clientes renderizan nuevo estado
```

## 🛠 Stack Tecnológico

### Backend
- Node.js + TypeScript
- Express (HTTP)
- Socket.IO (WebSocket)
- GameEngine (motor propio)

### Frontend
- React + TypeScript
- Three.js / React Three Fiber
- Zustand (state management)
- Tailwind CSS
- Socket.IO Client

### Motor de Reglas
- TypeScript puro
- Inmutable
- Determinista
- Serializable

## 📊 Arquitectura

```
┌─────────────────────────────────────────┐
│         SERVIDOR AUTORITATIVO           │
│  ┌───────────────────────────────────┐  │
│  │      GameEngine (reglas)          │  │
│  └───────────────────────────────────┘  │
│                  ↕                      │
│  ┌───────────────────────────────────┐  │
│  │      GameRoom (sala)              │  │
│  └───────────────────────────────────┘  │
│                  ↕                      │
│  ┌───────────────────────────────────┐  │
│  │   SocketServer (WebSocket)        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  ↕ ↕
         ┌────────┴─┴────────┐
         ↓                    ↓
    ┌─────────┐         ┌─────────┐
    │Cliente 1│         │Cliente 2│
    │         │         │         │
    │ Socket  │         │ Socket  │
    │ Zustand │         │ Zustand │
    │ React   │         │ React   │
    └─────────┘         └─────────┘
```

## 🔌 Protocolo de Mensajes

### Cliente → Servidor
- `CREATE_ROOM` - Crear sala
- `JOIN_ROOM` - Unirse a sala
- `PLAYER_ACTION` - Enviar acción
- `REQUEST_SNAPSHOT` - Solicitar estado completo

### Servidor → Cliente
- `GAME_STATE_UPDATE` - Actualización de estado
- `ACTION_REJECTED` - Acción rechazada
- `DICE_ROLLED` - Resultado de dados
- `PHASE_CHANGED` - Cambio de fase
- `GAME_ENDED` - Fin de partida

## 🎲 Mecánicas del Juego

### Roles
- **HUMAN** - Jugador humano controlando supervivientes
- **ALIEN** - Jugador alienígena amenazando a humanos

### Fases del Turno
1. PREPARATION - Preparación
2. EXPLORATION - Exploración del mapa
3. MOVEMENT - Movimiento de personajes
4. RESOURCE_GATHERING - Recolección de recursos
5. TRADING - Intercambio
6. ALIEN_TURN - Turno del alienígena
7. ROLE_CHECK - Verificación de cambio de rol
8. END_GAME_CHECK - Verificación de fin

### Condiciones de Victoria
- **MOTHERSHIP_DESTROYED** - Destruir nave nodriza
- **ESCAPE_SHIP** - Escapar en nave auxiliar
- **BEACON_ACTIVATED** - Activar baliza de rescate
- **TOTAL_DEFEAT** - Todos los humanos muertos

## 🧪 Testing

### Servidor
```bash
cd server
npm test
```

### Cliente
```bash
cd client
npm test
```

### Probar Multiplayer Local
1. Servidor: `cd server && npm run dev`
2. Cliente 1: Abrir `http://localhost:5173`
3. Cliente 2: Abrir `http://localhost:5173` en otra pestaña
4. Crear sala → Unirse → Jugar

## 📦 Scripts Disponibles

### Servidor
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Build para producción
npm start        # Iniciar producción
```

### Cliente
```bash
npm run dev      # Desarrollo con Vite
npm run build    # Build para producción
npm run preview  # Preview del build
```

## 🔧 Configuración

### Servidor (.env)
```bash
PORT=3001
CLIENT_URL=http://localhost:5173
MAX_ROOMS=100
```

### Cliente
```typescript
// Configurar URL del servidor
const client = new SocketClient({
  serverUrl: 'http://localhost:3001',
});
```

## 🚧 Roadmap

### Completado ✅
- [x] Motor de reglas completo
- [x] Servidor autoritativo
- [x] Cliente WebSocket
- [x] Sistema de salas
- [x] Validación de acciones
- [x] RNG determinista
- [x] Protocolo de mensajes
- [x] Documentación completa

### Futuro 🔮
- [ ] Persistencia (database)
- [ ] Autenticación (JWT)
- [ ] Rate limiting
- [ ] Chat en partida
- [ ] Replays
- [ ] Ranking/ELO
- [ ] Espectadores
- [ ] Tutorial interactivo

## 🤝 Contribuir

1. Fork el repositorio
2. Crear branch (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -am 'Agregar nueva feature'`)
4. Push al branch (`git push origin feature/nueva-feature`)
5. Crear Pull Request

## 📄 Licencia

[MIT License](./LICENSE)

## 👥 Autores

- **Game Design** - Diseño original del juego
- **Backend & Networking** - Sistema multiplayer autoritativo
- **Frontend** - UI/UX y gráficos 3D

## 🙏 Agradecimientos

- Socket.IO por el excelente framework de WebSocket
- Three.js por el motor 3D
- Zustand por el state management simple y efectivo

---

## 📞 Soporte

- 📧 Email: support@jorumi.com
- 💬 Discord: [JORUMI Community](#)
- 📖 Docs: [Documentación Completa](./MULTIPLAYER_ARCHITECTURE.md)

---

**¡Disfruta jugando JORUMI!** 🎮✨
#   j o r u m i 
 
 #   j o r u m i  
 