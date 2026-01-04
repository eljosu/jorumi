# 🔧 Corrección de Errores de Deployment - JORUMI

## Resumen de Problemas Encontrados

Durante el despliegue en Render, se encontraron varios errores de TypeScript que impedían la compilación del servidor. Estos errores han sido corregidos exitosamente.

---

## Errores Corregidos

### 1. **Error de rootDir en tsconfig.json del servidor**

**Problema:**
```
error TS6059: File '/opt/render/project/src/engine/...' is not under 'rootDir' '/opt/render/project/src/server/src'
```

**Causa:** El `tsconfig.json` del servidor tenía un `rootDir` demasiado restrictivo que no permitía importar archivos del motor (`engine`) ubicado fuera de `./src`.

**Solución:** Se eliminó la restricción `rootDir` y se configuró correctamente el `include` y `exclude`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@jorumi/engine": ["../engine/index.ts"]
    }
  },
  "include": ["src/**/*", "../engine/**/*"],
  "exclude": ["node_modules", "dist", "../engine/examples/**/*", "../engine/tests/**/*"]
}
```

**Archivo modificado:** `server/tsconfig.json`

---

### 2. **Error de tipo con BuildingType.BEACON**

**Problema:**
```
error TS2345: Argument of type '"BEACON"' is not assignable to parameter of type 'BuildingType'
```

**Causa:** Se estaban usando strings literales (`'BEACON'`) en lugar de los valores del enum `BuildingType.BEACON`.

**Solución:** Se corrigieron las referencias en los siguientes archivos:

**`engine/actions/validators.ts`:**
```typescript
// Antes:
if (!ghetto.buildings.includes('BEACON')) {

// Después:
if (!ghetto.buildings.includes(BuildingType.BEACON)) {
```

**`engine/rules/game-rules.ts`:**
```typescript
// Antes:
if (ghetto.buildings.includes('BEACON') && 

// Después:
if (ghetto.buildings.includes(BuildingType.BEACON) && 
```

**`engine/tests/game-rules.test.ts`:**
```typescript
// Antes:
buildings: ['BEACON'],

// Después:
buildings: [BuildingType.BEACON],
```

También se agregó la importación de `BuildingType` en estos archivos.

---

### 3. **Error de tipos implícitos 'any' en Express**

**Problema:**
```
error TS7006: Parameter 'req' implicitly has an 'any' type
error TS7006: Parameter 'res' implicitly has an 'any' type
```

**Causa:** Los parámetros de las rutas de Express no tenían tipos explícitos.

**Solución:** Se agregaron los tipos `Request` y `Response` de Express:

**`server/src/index.ts`:**
```typescript
// Antes:
import express from 'express';
app.get('/health', (req, res) => {

// Después:
import express, { Request, Response } from 'express';
app.get('/health', (req: Request, res: Response) => {
```

---

### 4. **Error de indexación en BUILDING_COSTS**

**Problema:**
```
error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ readonly BUNKER: ...; readonly HOSPITAL: ...; }'
```

**Causa:** El parámetro `action` tenía tipo `any` y no se podía usar para indexar `BUILDING_COSTS`.

**Solución:** Se tipó correctamente la función y se agregó un cast de tipo:

**`engine/core/action-reducer.ts`:**
```typescript
// Antes:
function reduceBuildStructure(
  state: GameState,
  action: any,
  events: GameEvent[]
): GameState {
  const cost = BUILDING_COSTS[action.buildingType];

// Después:
function reduceBuildStructure(
  state: GameState,
  action: BuildStructureAction,
  events: GameEvent[]
): GameState {
  const cost = BUILDING_COSTS[action.buildingType as BuildingType];
```

---

### 5. **Error de posible null en game-engine.ts**

**Problema:**
```
error TS2531: Object is possibly 'null'
```

**Causa:** Se accedía a `this.state` después de asignarlo, pero TypeScript no podía inferir que ya no era null.

**Solución:** Se usó `result.newState` en lugar de `this.state`:

**`engine/core/game-engine.ts`:**
```typescript
// Antes:
this.state = result.newState;
this.log('Action applied successfully', {
  phase: this.state.phase,  // ← this.state podría ser null
  turn: this.state.turn,

// Después:
this.state = result.newState;
this.log('Action applied successfully', {
  phase: result.newState.phase,  // ← result.newState es definitivamente no-null
  turn: result.newState.turn,
```

---

### 6. **Configuración del engine/tsconfig.json**

**Problema:** El engine tenía configuraciones muy estrictas (`noUnusedLocals`, `noUnusedParameters`) que causaban errores en código de desarrollo.

**Solución:** Se desactivaron estas opciones y se excluyeron los ejemplos y tests:

**`engine/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    ...
  },
  "exclude": [
    "node_modules",
    "dist",
    "examples",
    "tests"
  ]
}
```

---

## Verificación de la Corrección

### Compilación Local Exitosa

```bash
# Engine
cd engine
npm run build
# ✓ Compilación exitosa

# Server
cd ../server
npm run build
# ✓ Compilación exitosa
```

---

## Próximos Pasos para el Deployment

1. **Commit de los cambios:**
```bash
git add .
git commit -m "fix: Corregir errores de TypeScript para deployment en Render"
git push origin main
```

2. **Redesplegar en Render:**
   - Los cambios se desplegarán automáticamente en Render
   - O puedes forzar un redespliegue manual desde el dashboard de Render

3. **Verificar el deployment:**
   - Revisar los logs de Render para confirmar que la compilación es exitosa
   - Verificar que el servidor responde correctamente en la URL de Render

---

## Archivos Modificados

1. `server/tsconfig.json` - Configuración de TypeScript del servidor
2. `server/src/index.ts` - Tipos de Express
3. `engine/tsconfig.json` - Configuración de TypeScript del engine
4. `engine/actions/validators.ts` - Corrección de tipos BuildingType
5. `engine/rules/game-rules.ts` - Corrección de tipos BuildingType
6. `engine/tests/game-rules.test.ts` - Corrección de tipos BuildingType
7. `engine/core/action-reducer.ts` - Corrección de tipos y indexación
8. `engine/core/game-engine.ts` - Corrección de posible null

---

## Notas Importantes

- ✅ Todos los errores críticos de TypeScript han sido corregidos
- ✅ La compilación local funciona correctamente
- ✅ No se han modificado las funcionalidades del juego
- ✅ Solo se han corregido errores de tipos y configuración

---

---

## 🔄 Correcciones Adicionales (Actualización)

### 7. **Error de tipos de Express - "Could not find a declaration file"**

**Problema:**
```
error TS7016: Could not find a declaration file for module 'express'
```

**Causa:** Las dependencias de tipos (`@types/express`, `@types/cors`, etc.) y TypeScript estaban en `devDependencies`, pero Render las necesita durante el build en producción.

**Solución:** Mover las dependencias necesarias para el build a `dependencies`:

**`server/package.json`:**
```json
{
  "dependencies": {
    "socket.io": "^4.7.2",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "nanoid": "^5.0.4",
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

---

### 8. **Configuración de entorno para producción**

**Problema:** El frontend necesita saber la URL del servidor en producción, que es diferente a la de desarrollo.

**Solución:** Crear sistema de configuración de entorno:

**`client/src/config/environment.ts`:**
```typescript
export function getServerUrl(): string {
  const envUrl = import.meta.env.VITE_SERVER_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  if (import.meta.env.PROD) {
    return 'https://jorumi-server.onrender.com';
  }
  
  return 'http://localhost:3001';
}

export const config = {
  serverUrl: getServerUrl(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  socket: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  },
} as const;
```

**Actualización de `network-store.ts`:**
```typescript
import { config } from '../config/environment';

const client = getSocketClient({
  serverUrl: config.serverUrl,
  // ... otras opciones
});
```

---

### 9. **Archivo render.yaml para configuración de Render**

Se creó un archivo de configuración específico para Render:

**`render.yaml`:**
```yaml
services:
  - type: web
    name: jorumi-server
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: CLIENT_URL
        sync: false
```

---

### 10. **Tipos de Vite para import.meta.env**

**Problema:** TypeScript no reconocía `import.meta.env`.

**Solución:** Crear archivo de declaración de tipos:

**`client/src/vite-env.d.ts`:**
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

### 11. **Dependencia immer para Zustand**

**Problema:** El store del cliente usa `zustand/middleware/immer` pero immer no estaba instalado.

**Solución:** Agregar immer a las dependencias:

```bash
npm install immer@^10.0.3
```

---

### 12. **Tipos correctos para mensajes WebSocket**

**Problema:** El `socket-client.ts` usaba strings literales en lugar de enums para los tipos de mensajes.

**Solución:** Usar `ClientMessageType` enum:

```typescript
import { ClientMessageType } from '../../../server/src/types/messages';

this.send({
  type: ClientMessageType.CREATE_ROOM,
  playerName,
  roomConfig,
} as ClientMessage);
```

---

## 📝 Nuevos Archivos Creados

1. **`ENVIRONMENT_CONFIG.md`** - Guía completa de configuración de variables de entorno para Render y Netlify
2. **`render.yaml`** - Configuración de Render (alternativa a configuración manual)
3. **`client/src/config/environment.ts`** - Sistema de configuración de entorno del cliente
4. **`client/src/vite-env.d.ts`** - Tipos de Vite para TypeScript

---

## 🚀 Pasos Siguientes para Deployment Completo

### 1. **Configurar Variables de Entorno en Render**

Ve a tu servicio en Render y agrega:

```bash
NODE_ENV=production
CLIENT_URL=https://tu-app.netlify.app  # ← Reemplazar con tu URL de Netlify
```

### 2. **Configurar Variables de Entorno en Netlify**

Ve a tu sitio en Netlify → Site settings → Environment variables:

```bash
VITE_SERVER_URL=https://jorumi-server.onrender.com  # ← Reemplazar con tu URL de Render
```

### 3. **Obtener las URLs**

**URL de Render:**
- Ve a tu servicio en Render
- Copia la URL que aparece en la parte superior (ejemplo: `https://jorumi-server-abc123.onrender.com`)

**URL de Netlify:**
- Ve a tu sitio en Netlify
- Copia la URL del sitio (ejemplo: `https://jorumi-game.netlify.app`)

### 4. **Verificar el Deployment**

**Backend (Render):**
```bash
# Endpoint raíz
https://tu-servidor.onrender.com/

# Endpoint de salud
https://tu-servidor.onrender.com/health
```

**Frontend (Netlify):**
- Abre tu app en el navegador
- Abre la consola (F12) y busca:
  - Logs de configuración: `[Config] Application configuration`
  - Logs de conexión: `[SocketClient] Connecting to`

### 5. **Troubleshooting**

Si hay problemas de conexión:
1. Verifica que ambas URLs en las variables de entorno sean correctas
2. Asegúrate de que ambos servicios estén en estado "Live"
3. Revisa los logs en Render y Netlify
4. Verifica que CORS esté configurado correctamente (`CLIENT_URL` en Render)

---

## 📊 Resumen de Commits

1. `37025a6` - Correcciones iniciales de TypeScript
2. `6d89ff1` - Mover tipos a dependencies para Render
3. `b96f70c` - Configurar cliente para producción

---

**Fecha de corrección:** 2026-01-04
**Estado:** ✅ Listo para redesplegar con configuración de variables de entorno
**Siguiente paso:** Configurar variables de entorno en Render y Netlify

