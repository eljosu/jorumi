# 🚀 Guía Completa de Deployment - JORUMI

## Arquitectura del Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  GitHub Repository (Código fuente)                          │
│  https://github.com/tu-usuario/jorumi                       │
│                                                              │
└────────────┬──────────────────────────┬─────────────────────┘
             │                          │
             │                          │
    ┌────────▼─────────┐       ┌───────▼──────────┐
    │                  │       │                   │
    │  Netlify         │       │  Render           │
    │  (Frontend)      │◄──────┤  (Backend)        │
    │  client/         │ CORS  │  server/          │
    │                  │       │                   │
    └──────────────────┘       └───────────────────┘
         │                            │
         │ HTTPS                      │ WebSocket
         │                            │
    ┌────▼────────────────────────────▼─────┐
    │                                       │
    │         Usuario Final                 │
    │         (Navegador)                   │
    │                                       │
    └───────────────────────────────────────┘
```

---

## PASO 1: Preparar el Proyecto en GitHub

### 1.1 Verificar el Estado del Repositorio

```bash
# En la carpeta raíz del proyecto
cd c:\Users\abm\Desktop\jorumi

# Verificar estado
git status

# Ver branch actual
git branch
```

### 1.2 Crear .gitignore (si no existe)

Verifica que tengas estos archivos ignorados:

```bash
# Crear o actualizar .gitignore en la raíz
```

Contenido de `.gitignore`:
```
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
*/dist/
build/
*/build/

# Environment variables
.env
.env.local
.env.production
*.env

# Logs
*.log
npm-debug.log*
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporal
*.tmp
.cache/
```

### 1.3 Commit de los Cambios Recientes

```bash
# Añadir todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: implementar sistema de balance y corregir errores para deploy

- Sistema completo de balance y tuning automático
- Corrección de exports de tipos desde engine
- Corrección de imports en cliente
- Preparación para deploy en Netlify y Render"

# Push a GitHub
git push origin main
```

### 1.4 Verificar en GitHub

1. Ve a `https://github.com/TU_USUARIO/jorumi`
2. Verifica que los últimos commits están ahí
3. Asegúrate que las carpetas `client/` y `server/` están visibles

---

## PASO 2: Deploy del Backend en Render

### 2.1 Crear Cuenta en Render

1. Ve a `https://render.com`
2. Haz clic en **"Get Started"**
3. Registrate con GitHub (recomendado)
4. Autoriza a Render a acceder a tus repositorios

### 2.2 Crear un Nuevo Web Service

1. En el Dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub:
   - Busca: `jorumi`
   - Haz clic en **"Connect"**

### 2.3 Configurar el Web Service

Completa el formulario con estos valores:

```yaml
Name: jorumi-backend
Region: Oregon (US West) o el más cercano a ti
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

**IMPORTANTE: Root Directory = `server`** (no dejar vacío)

### 2.4 Seleccionar Plan

- **Free Plan**: Suficiente para desarrollo/pruebas
  - ⚠️ Se duerme después de 15 min de inactividad
  - 750 horas gratis por mes
- **Starter Plan** ($7/mes): Recomendado para producción
  - Siempre activo
  - Más recursos

Selecciona **Free** para empezar.

### 2.5 Variables de Entorno

Antes de crear el servicio, agrega estas variables:

Haz clic en **"Advanced"** → **"Add Environment Variable"**

```bash
# Variables requeridas
NODE_ENV=production
PORT=10000

# CORS - Lo configuraremos después
CORS_ORIGIN=https://tu-app.netlify.app
```

⚠️ **Nota:** Dejaremos `CORS_ORIGIN` temporal, lo actualizaremos después del deploy de Netlify.

### 2.6 Crear el Servicio

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir tu backend
3. Espera 5-10 minutos mientras se completa el build

### 2.7 Verificar el Deploy

Una vez completado:
1. Verás un estado **"Live"** en verde
2. Tendrás una URL como: `https://jorumi-backend.onrender.com`
3. Haz clic en la URL para verificar que el servidor responde

**Prueba el servidor:**
```bash
# En tu navegador o terminal:
curl https://jorumi-backend.onrender.com/health

# Deberías ver algo como:
# {"status":"ok","timestamp":"2025-01-04T..."}
```

### 2.8 Guardar la URL del Backend

**IMPORTANTE:** Copia y guarda esta URL, la necesitarás para Netlify:
```
https://jorumi-backend.onrender.com
```

---

## PASO 3: Deploy del Frontend en Netlify

### 3.1 Crear Cuenta en Netlify

1. Ve a `https://www.netlify.com`
2. Haz clic en **"Sign up"**
3. Registrate con GitHub (recomendado)
4. Autoriza a Netlify a acceder a tus repositorios

### 3.2 Crear un Nuevo Site

1. En el Dashboard, haz clic en **"Add new site"**
2. Selecciona **"Import an existing project"**
3. Haz clic en **"Deploy with GitHub"**
4. Busca y selecciona tu repositorio: `jorumi`

### 3.3 Configurar el Build

Completa el formulario:

```yaml
Site name: jorumi-game (o el nombre que prefieras)
Branch to deploy: main
Base directory: client
Build command: npm run build
Publish directory: client/dist
```

**CRÍTICO:** 
- ✅ Base directory: `client`
- ✅ Publish directory: `client/dist` (no solo `dist`)

### 3.4 Variables de Entorno

Antes de hacer deploy, configura las variables:

Haz clic en **"Show advanced"** → **"New variable"**

```bash
# Variable para conectar con el backend
VITE_API_URL=https://jorumi-backend.onrender.com

# Reemplaza con la URL real de tu backend de Render
```

**Formato importante:**
- La variable DEBE llamarse `VITE_API_URL`
- DEBE empezar con `VITE_` para que Vite la reconozca
- DEBE usar la URL completa de Render (incluyendo `https://`)

### 3.5 Deploy

1. Haz clic en **"Deploy site"**
2. Netlify comenzará a construir tu frontend
3. Espera 3-5 minutos

### 3.6 Verificar el Deploy

Una vez completado:
1. Verás "Site is live" en verde
2. Tendrás una URL temporal como: `https://random-name-123.netlify.app`
3. Haz clic en la URL para ver tu aplicación

### 3.7 Configurar Dominio Personalizado (Opcional)

Si quieres un nombre mejor:

1. Ve a **"Site settings"** → **"Change site name"**
2. Elige un nombre disponible: `jorumi-game`
3. Tu nueva URL será: `https://jorumi-game.netlify.app`

### 3.8 Guardar la URL del Frontend

**IMPORTANTE:** Copia esta URL, la necesitas para actualizar CORS:
```
https://jorumi-game.netlify.app
```

---

## PASO 4: Configurar CORS en el Backend

Ahora que tienes la URL de Netlify, actualiza el backend:

### 4.1 Actualizar Variable de Entorno en Render

1. Ve a tu servicio en Render
2. Ve a **"Environment"**
3. Edita la variable `CORS_ORIGIN`
4. Actualiza con la URL de Netlify:
   ```
   CORS_ORIGIN=https://jorumi-game.netlify.app
   ```
5. Haz clic en **"Save Changes"**

### 4.2 Verificar Configuración CORS en el Código

Asegúrate que tu `server/src/index.ts` tenga:

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));
```

Si necesitas hacer cambios, commit y push:

```bash
git add server/src/index.ts
git commit -m "fix: configurar CORS para producción"
git push origin main
```

Render automáticamente hará re-deploy.

---

## PASO 5: Configurar Cliente para Conectar con Backend

### 5.1 Verificar Variables de Entorno en el Cliente

En tu código del cliente, asegúrate de usar la variable de entorno:

```typescript
// client/src/network/socket-client.ts o donde inicialices socket.io

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
});
```

### 5.2 Si Necesitas Actualizar el Cliente

Si hiciste cambios:

```bash
git add client/src/network/socket-client.ts
git commit -m "fix: usar variable de entorno para URL del servidor"
git push origin main
```

Netlify automáticamente hará re-deploy.

---

## PASO 6: Verificación y Testing

### 6.1 Verificar Backend

```bash
# Prueba el endpoint de health
curl https://jorumi-backend.onrender.com/health

# Deberías ver:
# {"status":"ok",...}
```

### 6.2 Verificar Frontend

1. Abre `https://jorumi-game.netlify.app` en tu navegador
2. Abre las DevTools (F12)
3. Ve a la pestaña **"Console"**
4. Busca errores de CORS o conexión

### 6.3 Verificar Conexión WebSocket

En la consola del navegador, deberías ver:

```
[SocketClient] Connecting to: https://jorumi-backend.onrender.com
[SocketClient] Connected
```

Si ves errores de CORS:
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solución:**
1. Verifica que `CORS_ORIGIN` en Render tenga la URL correcta
2. Verifica que NO tenga `/` al final
3. Re-deploya el backend

### 6.4 Testing Completo

1. **Crear cuenta/login** (si tienes autenticación)
2. **Crear una sala de juego**
3. **Verificar que el estado se sincroniza**
4. **Probar acciones del juego**
5. **Verificar que no hay errores en consola**

---

## PASO 7: Automatización de Deploys

### 7.1 Configurar Auto-Deploy desde GitHub

**Netlify:**
- Ya está configurado por defecto
- Cada push a `main` hace re-deploy automático

**Render:**
- También está configurado por defecto
- Cada push a `main` hace re-deploy automático

### 7.2 Configurar Branch de Staging (Opcional)

Para tener un ambiente de pruebas:

**En Netlify:**
1. Ve a **"Site settings"** → **"Build & deploy"**
2. Ve a **"Deploy contexts"**
3. Activa **"Deploy Preview"** para branch `develop`

**En Render:**
1. Crea un nuevo servicio
2. Usa branch `develop`
3. Llámalo `jorumi-backend-staging`

---

## PASO 8: Configuración de Dominios Personalizados (Opcional)

### 8.1 Dominio para Frontend (Netlify)

Si tienes un dominio propio (ej: `jorumi.com`):

1. Ve a **"Domain settings"** en Netlify
2. Haz clic en **"Add custom domain"**
3. Ingresa tu dominio: `jorumi.com`
4. Sigue las instrucciones para configurar DNS:
   - Añade un registro CNAME o A en tu proveedor de DNS
   - Apunta a tu sitio de Netlify

### 8.2 Dominio para Backend (Render)

1. Ve a **"Settings"** → **"Custom Domain"** en Render
2. Añade: `api.jorumi.com`
3. Configura DNS en tu proveedor:
   - Añade registro CNAME: `api` → `jorumi-backend.onrender.com`

### 8.3 Actualizar Variables de Entorno

Si usas dominios personalizados, actualiza:

**En Render:**
```
CORS_ORIGIN=https://jorumi.com
```

**En Netlify:**
```
VITE_API_URL=https://api.jorumi.com
```

---

## PASO 9: Monitoreo y Logs

### 9.1 Ver Logs en Render

1. Ve a tu servicio en Render
2. Haz clic en la pestaña **"Logs"**
3. Verás logs en tiempo real del servidor

**Comandos útiles:**
```bash
# Filtrar por nivel
# En la búsqueda de logs: "ERROR"

# Descargar logs
# Haz clic en "Download logs"
```

### 9.2 Ver Logs en Netlify

1. Ve a tu sitio en Netlify
2. Haz clic en **"Deploys"**
3. Haz clic en un deploy específico
4. Ve los logs de build

### 9.3 Configurar Alertas (Opcional)

**Render:**
- Email automático si el servicio falla
- Ve a **"Settings"** → **"Notifications"**

**Netlify:**
- Deploy notifications en Slack
- Ve a **"Settings"** → **"Build & deploy"** → **"Deploy notifications"**

---

## PASO 10: Optimizaciones de Producción

### 10.1 Optimizar Build del Cliente

En `client/vite.config.ts`, asegúrate de tener:

```typescript
export default defineConfig({
  build: {
    minify: 'esbuild',
    sourcemap: false, // En producción
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
});
```

### 10.2 Configurar Cache en Netlify

Crea un archivo `client/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Commit y push:
```bash
git add client/netlify.toml
git commit -m "feat: añadir configuración de Netlify"
git push origin main
```

### 10.3 Habilitar Compresión en Backend

Asegúrate que tu `server/src/index.ts` tenga:

```typescript
import compression from 'compression';

app.use(compression());
```

---

## PASO 11: Troubleshooting Común

### Problema 1: Build Falla en Netlify

**Error:** `npm ERR! missing script: build`

**Solución:**
1. Verifica que `client/package.json` tenga:
   ```json
   "scripts": {
     "build": "tsc && vite build"
   }
   ```
2. Verifica que **Base directory** sea `client`

### Problema 2: CORS Error en Producción

**Error:** `Access-Control-Allow-Origin header is missing`

**Solución:**
1. Verifica `CORS_ORIGIN` en Render
2. Verifica que el servidor esté usando `cors` middleware
3. Re-deploya el backend

### Problema 3: WebSocket No Conecta

**Error:** `WebSocket connection failed`

**Solución:**
1. Verifica que estés usando `wss://` (no `ws://`) en producción
2. Verifica que Render permita WebSockets (sí permite)
3. Añade en cliente:
   ```typescript
   const socket = io(SERVER_URL, {
     transports: ['websocket', 'polling'],
     upgrade: true,
   });
   ```

### Problema 4: Backend "Dormido" (Free Plan de Render)

**Error:** Primera request tarda 30+ segundos

**Solución:**
- Es normal en Free Plan
- El servicio se "duerme" después de 15 min
- Primera request lo "despierta" (tarda ~30 seg)
- **Solución permanente:** Upgrade a Starter Plan

### Problema 5: Assets 3D No Cargan

**Error:** 404 en `/assets/3d/...`

**Solución:**
1. Verifica que la carpeta `client/assets/` esté en el repo
2. Verifica que `client/public/` contenga los assets
3. Mueve assets a `client/public/assets/`

---

## PASO 12: Mejores Prácticas

### 12.1 Versionado

```bash
# En package.json
"version": "1.0.0"

# Tags en git
git tag -a v1.0.0 -m "Primera versión en producción"
git push origin v1.0.0
```

### 12.2 Variables de Entorno Seguras

**NUNCA commites:**
- Claves API
- Secretos
- Tokens
- Contraseñas

**Siempre usa variables de entorno en:**
- Render → Environment variables
- Netlify → Environment variables

### 12.3 Branches

```
main → Producción (Netlify + Render)
develop → Staging/Testing
feature/* → Desarrollo local
```

### 12.4 Monitoring

Considera usar:
- **Sentry** para error tracking
- **LogRocket** para session replay
- **Google Analytics** para métricas

---

## 📋 Checklist Final

Antes de considerar el deploy completo:

### GitHub
- [ ] ✅ Código pusheado a `main`
- [ ] ✅ `.gitignore` configurado
- [ ] ✅ Commits descriptivos
- [ ] ✅ README actualizado

### Render (Backend)
- [ ] ✅ Servicio creado y "Live"
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ `CORS_ORIGIN` tiene URL de Netlify
- [ ] ✅ Logs sin errores
- [ ] ✅ Endpoint `/health` responde

### Netlify (Frontend)
- [ ] ✅ Sitio deployado y "Published"
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ `VITE_API_URL` tiene URL de Render
- [ ] ✅ Sin errores 404
- [ ] ✅ Sin errores CORS

### Conexión
- [ ] ✅ WebSocket conecta exitosamente
- [ ] ✅ Puedes crear/unir salas
- [ ] ✅ Estado se sincroniza entre clientes
- [ ] ✅ No hay errores en consola

### Extras
- [ ] ⭐ Dominio personalizado (opcional)
- [ ] ⭐ Monitoring configurado (opcional)
- [ ] ⭐ Alerts configuradas (opcional)

---

## 🎉 ¡Felicidades!

Tu aplicación JORUMI ahora está desplegada en producción.

**URLs Finales:**
```
Frontend: https://jorumi-game.netlify.app
Backend:  https://jorumi-backend.onrender.com
GitHub:   https://github.com/TU_USUARIO/jorumi
```

---

## 📞 Soporte

Si tienes problemas:

1. **Netlify Support:** https://answers.netlify.com/
2. **Render Support:** https://render.com/docs
3. **GitHub Issues:** En tu repositorio

---

**Fecha:** 4 de Enero, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Producción Ready

