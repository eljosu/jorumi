# JORUMI - Estructura Completa del Proyecto

```
jorumi/
│
├── 📁 engine/                           ← MOTOR DE REGLAS (TypeScript puro)
│   ├── actions/
│   │   ├── types.ts                     Definición de todas las acciones
│   │   └── validators.ts                Validación de acciones
│   ├── core/
│   │   ├── game-engine.ts               API pública del motor
│   │   ├── state-factory.ts             Creación de estados
│   │   └── action-reducer.ts            Aplicación de acciones
│   ├── domain/
│   │   ├── types.ts                     Tipos del dominio (GameState, etc.)
│   │   └── constants.ts                 Constantes del juego
│   ├── rules/
│   │   ├── game-rules.ts                Implementación de reglas del manual
│   │   └── phase-machine.ts             Máquina de estados de fases
│   ├── dice/
│   │   ├── dice.ts                      Sistema de dados
│   │   └── rng.ts                       Generador aleatorio determinista
│   ├── utils/
│   │   ├── hex.ts                       Utilidades hexagonales
│   │   └── helpers.ts                   Funciones auxiliares
│   ├── tests/                           Tests unitarios
│   ├── examples/
│   │   └── ui-integration-example.ts    Ejemplo de integración
│   ├── index.ts                         Exports públicos
│   ├── package.json
│   ├── tsconfig.json
│   ├── ARCHITECTURE.md                  Documentación arquitectura motor
│   ├── QUICKSTART.md
│   └── README.md
│
├── 📁 client/                           ← FRONTEND 3D (React + R3F)
│   │
│   ├── 📁 src/
│   │   │
│   │   ├── 📁 store/                    ← CAPA DE ESTADO (Adapter)
│   │   │   └── game-store.ts            ⭐ Zustand store
│   │   │                                   • Envuelve GameEngine
│   │   │                                   • GameState + UI State
│   │   │                                   • Historial (undo/redo)
│   │   │                                   • Procesamiento de eventos
│   │   │                                   • Acciones → Motor → Estado
│   │   │
│   │   ├── 📁 hooks/                    ← HOOKS PERSONALIZADOS
│   │   │   └── useEngineSync.ts         • Inicialización motor
│   │   │                                   • Auto-save
│   │   │
│   │   ├── 📁 components/               ← COMPONENTES REACT
│   │   │   │
│   │   │   ├── 📁 scene/                ← COMPONENTES 3D (Three.js)
│   │   │   │   ├── GameScene.tsx        Canvas principal (cámara, luces)
│   │   │   │   ├── Lighting.tsx         Setup de iluminación
│   │   │   │   ├── GameBoard.tsx        ⭐ Lee GameState → Renderiza todo
│   │   │   │   ├── HexTile.tsx          Loseta hexagonal individual
│   │   │   │   ├── CharacterMesh.tsx    Personaje 3D con animación
│   │   │   │   └── Mothership.tsx       Nave alienígena
│   │   │   │
│   │   │   ├── 📁 ui/                   ← COMPONENTES UI (HTML/CSS)
│   │   │   │   ├── GameHUD.tsx          HUD principal (turno, fase)
│   │   │   │   ├── CharacterPanel.tsx   Panel de personaje seleccionado
│   │   │   │   ├── StartMenu.tsx        Menú inicial
│   │   │   │   └── LoadingScreen.tsx    Pantalla de carga
│   │   │   │
│   │   │   └── 📁 dice/                 ← SISTEMA DE DADOS
│   │   │       └── DiceRoller.tsx       ⚠️ Integración crítica con motor
│   │   │
│   │   ├── 📁 utils/                    ← UTILIDADES
│   │   │   ├── coordinate-converter.ts  Hex ↔ Cartesian
│   │   │   └── asset-loader.ts          Carga de modelos GLB
│   │   │
│   │   ├── App.tsx                      ⭐ Componente raíz
│   │   ├── main.tsx                     Entry point
│   │   └── index.css                    Estilos globales
│   │
│   ├── 📁 assets/
│   │   └── 📁 3d/                       ← ASSETS 3D
│   │       ├── characters/              Modelos de personajes (GLB)
│   │       ├── resources/               Modelos de recursos (GLB)
│   │       ├── vehicles/                Nave nodriza, barcas (GLB)
│   │       ├── dice/                    Dados especiales (GLB)
│   │       ├── specs/                   Especificaciones JSON
│   │       ├── examples/                Ejemplos de código
│   │       ├── INTEGRATION_GUIDE.md     Guía de integración assets
│   │       └── QUICKSTART.md
│   │
│   ├── index.html
│   ├── package.json                     Dependencias del cliente
│   ├── vite.config.ts                   Configuración Vite
│   ├── tsconfig.json                    TypeScript config
│   ├── tailwind.config.js               TailwindCSS config
│   ├── postcss.config.js
│   │
│   ├── 📄 README.md                     Setup y uso del cliente
│   ├── 📄 INTEGRATION_ARCHITECTURE.md   ⭐ Arquitectura detallada
│   └── 📄 EXTENDING_GUIDE.md            Guía para agregar features
│
├── 📁 docs/
│   └── Manual Juego JORUMI.docx         Manual de reglas oficial
│
├── 📁 server/                           (Opcional - para multiplayer)
│
├── 📄 INTEGRATION_SUMMARY.md            ⭐ Resumen ejecutivo integración
├── 📄 CLIENT_HANDOFF.md                 ⭐ Documento de entrega
├── 📄 PROJECT_STRUCTURE.md              Este archivo
└── 📄 IMPLEMENTATION_SUMMARY.md         Resumen general del proyecto
```

---

## 🔑 Archivos Clave

### Motor de Reglas

| Archivo | Descripción | Criticidad |
|---------|-------------|------------|
| `engine/index.ts` | Exports públicos del motor | ⭐⭐⭐ |
| `engine/core/game-engine.ts` | API principal del motor | ⭐⭐⭐ |
| `engine/domain/types.ts` | Tipos del dominio (GameState, etc.) | ⭐⭐⭐ |
| `engine/actions/types.ts` | Definición de acciones | ⭐⭐⭐ |
| `engine/rules/game-rules.ts` | Implementación de reglas | ⭐⭐⭐ |

### Integración

| Archivo | Descripción | Criticidad |
|---------|-------------|------------|
| `client/src/store/game-store.ts` | Adapter Motor ↔ React | ⭐⭐⭐ |
| `client/src/utils/coordinate-converter.ts` | Conversión Hex ↔ 3D | ⭐⭐⭐ |
| `client/src/components/scene/GameBoard.tsx` | Renderizado basado en estado | ⭐⭐⭐ |
| `client/src/components/dice/DiceRoller.tsx` | Integración dados | ⭐⭐⭐ |

### Documentación

| Archivo | Descripción | Audiencia |
|---------|-------------|-----------|
| `CLIENT_HANDOFF.md` | Documento de entrega | Lead, PM |
| `INTEGRATION_SUMMARY.md` | Resumen técnico ejecutivo | Tech Lead |
| `client/INTEGRATION_ARCHITECTURE.md` | Arquitectura detallada | Desarrolladores |
| `client/README.md` | Setup y uso diario | Todos |
| `client/EXTENDING_GUIDE.md` | Guía de desarrollo | Desarrolladores |

---

## 📊 Capas del Sistema

```
┌─────────────────────────────────────────────────────────┐
│  VISUAL LAYER                                           │
│  • React Components (client/src/components/ui/)         │
│  • Three.js Scene (client/src/components/scene/)        │
│  RESPONSABILIDAD: Mostrar estado, capturar input        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Read state, Dispatch actions
                      ▼
┌─────────────────────────────────────────────────────────┐
│  STATE ADAPTER LAYER                                    │
│  • Zustand Store (client/src/store/game-store.ts)      │
│  RESPONSABILIDAD: Conectar motor con React              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Actions → New State + Events
                      ▼
┌─────────────────────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER                                   │
│  • Game Engine (engine/)                                │
│  RESPONSABILIDAD: Reglas del juego, validación          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### Lectura de Estado

```
GameState (motor)
    ↓
Zustand Store (adapter)
    ↓
useGameStore(selector) (React hook)
    ↓
Component props/state
    ↓
Renderizado 3D/UI
```

### Escritura de Estado

```
User Interaction
    ↓
Event Handler (onClick, etc.)
    ↓
dispatchAction(action) (store method)
    ↓
engine.applyAction(action) (motor method)
    ↓
Validation + Rules application
    ↓
New GameState + Events
    ↓
Store update (gameState = newState)
    ↓
React re-render (reactive)
    ↓
Updated UI/3D
```

---

## 📦 Dependencias por Capa

### Motor (`engine/`)
```json
{
  "dependencies": {}  // CERO dependencias externas
}
```
✅ TypeScript puro, completamente independiente

### Cliente (`client/`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "three": "^0.160.0",
    "immer": "^10.0.3"
  }
}
```
✅ Stack moderno: React + R3F + Zustand

---

## 🎯 Puntos de Entrada

### Desarrollo Local

```bash
# Terminal 1: Motor (si necesitas compilar)
cd engine
npm run build

# Terminal 2: Cliente
cd client
npm install
npm run dev
# → http://localhost:3000
```

### Producción

```bash
cd client
npm run build
# → dist/ folder
```

---

## 🗂️ Convenciones de Nomenclatura

### Archivos

- **Componentes React:** `PascalCase.tsx` (ej: `GameBoard.tsx`)
- **Hooks:** `useCamelCase.ts` (ej: `useEngineSync.ts`)
- **Utilidades:** `kebab-case.ts` (ej: `coordinate-converter.ts`)
- **Stores:** `kebab-case-store.ts` (ej: `game-store.ts`)

### Carpetas

- **Minúsculas con guiones:** `scene/`, `ui/`, `dice/`
- **Agrupación por función:** No por tipo de archivo

### Código

- **Variables:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Tipos/Interfaces:** `PascalCase`
- **Enums:** `PascalCase`

---

## 📐 Arquitectura en Capas

### Layer 1: Domain (Motor)
**Ubicación:** `engine/domain/`  
**Responsabilidad:** Tipos y constantes del dominio  
**Dependencias:** Ninguna

### Layer 2: Rules (Motor)
**Ubicación:** `engine/rules/`  
**Responsabilidad:** Implementación de reglas del manual  
**Dependencias:** Domain

### Layer 3: Actions (Motor)
**Ubicación:** `engine/actions/`  
**Responsabilidad:** Sistema de comandos y validación  
**Dependencias:** Domain, Rules

### Layer 4: Core (Motor)
**Ubicación:** `engine/core/`  
**Responsabilidad:** Orquestación del motor  
**Dependencias:** Domain, Rules, Actions

### Layer 5: Adapter (Cliente)
**Ubicación:** `client/src/store/`  
**Responsabilidad:** Conexión motor ↔ React  
**Dependencias:** Motor, Zustand

### Layer 6: Components (Cliente)
**Ubicación:** `client/src/components/`  
**Responsabilidad:** UI y visualización 3D  
**Dependencias:** Adapter, React, R3F

---

## 🔍 Búsqueda Rápida

### "¿Dónde está...?"

- **La definición de GameState:** `engine/domain/types.ts`
- **Las acciones disponibles:** `engine/actions/types.ts`
- **La validación de reglas:** `engine/rules/game-rules.ts`
- **El store de Zustand:** `client/src/store/game-store.ts`
- **El componente principal 3D:** `client/src/components/scene/GameBoard.tsx`
- **La configuración de Vite:** `client/vite.config.ts`
- **Los modelos 3D:** `client/assets/3d/`

### "¿Cómo hago...?"

- **Agregar nueva acción:** Ver `client/EXTENDING_GUIDE.md` línea 10
- **Cargar modelo GLB:** Ver `client/src/utils/asset-loader.ts`
- **Convertir coordenadas:** Ver `client/src/utils/coordinate-converter.ts`
- **Integrar dado:** Ver `client/src/components/dice/DiceRoller.tsx`
- **Validar acción:** Ver `client/src/store/game-store.ts` método `validateAction`

---

## 📊 Estadísticas del Proyecto

### Motor
- **Archivos TypeScript:** ~20
- **Líneas de código:** ~3,000
- **Tests:** Sí (unitarios)
- **Dependencias externas:** 0
- **Cobertura:** Alta

### Cliente
- **Componentes React:** ~15
- **Líneas de código:** ~2,500
- **Assets 3D:** ~50 modelos (estimado)
- **Dependencias:** 7 principales
- **Bundle size:** TBD (depende de assets)

### Documentación
- **Archivos Markdown:** 10+
- **Líneas totales:** ~5,000
- **Ejemplos de código:** 20+
- **Diagramas:** 5+

---

## ✅ Checklist de Verificación

Antes de empezar a desarrollar, verifica:

- [ ] Motor compilado: `cd engine && npm run build`
- [ ] Cliente instalado: `cd client && npm install`
- [ ] Dev server corriendo: `npm run dev`
- [ ] Navegador en http://localhost:3000
- [ ] Menú inicial visible
- [ ] Puede iniciar juego
- [ ] Tablero 3D renderiza
- [ ] Controles de cámara funcionan
- [ ] Leída documentación de arquitectura
- [ ] Comprendidos principios de integración

---

## 🎓 Recursos de Aprendizaje

### Para Nuevos en el Proyecto
1. Leer `CLIENT_HANDOFF.md` (este es el overview)
2. Ejecutar aplicación y explorar
3. Leer `client/INTEGRATION_ARCHITECTURE.md`
4. Revisar código de `game-store.ts`
5. Seguir tutorial en `client/EXTENDING_GUIDE.md`

### Para Nuevos en React Three Fiber
- [R3F Documentation](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Components](https://github.com/pmndrs/drei)
- Revisar `client/src/components/scene/` ejemplos

### Para Nuevos en Zustand
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- Revisar `client/src/store/game-store.ts`

---

**Este documento es un mapa completo del proyecto. Guárdalo como referencia.**



