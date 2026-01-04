# 🔄 Guía Actualizada - Deployment JORUMI

## ✅ Problema Resuelto

**Error corregido:** `Cannot find name 'console'` en el engine.

**Causa:** El engine no tenía configurados los tipos de Node.js en TypeScript.

**Solución aplicada:**
- ✅ Agregado `"types": ["node"]` al `tsconfig.json` del engine
- ✅ Movido `@types/node` a dependencies (necesario en producción)
- ✅ Código compilando correctamente
- ✅ Cambios subidos a GitHub (commit `4e7e8c5`)

---

## 🚀 Pasos para Deployment (Actualizados)

### ✅ PASO 0: GitHub (YA COMPLETADO)

Los cambios ya están en GitHub. Puedes verificar:
```
https://github.com/eljosu/jorumi
```

Último commit: `fix: Agregar tipos de Node.js al engine para resolver error de console`

---

### 📍 PASO 1: Configurar Backend en Render

#### 1.1 Acceder a Render

1. Ve a: **https://dashboard.render.com**
2. Inicia sesión con tu cuenta

#### 1.2 Crear el Servicio (Si no existe)

**Si ya tienes el servicio creado:**
- Haz clic en tu servicio existente
- Ve al **Paso 1.3** directamente

**Si NO tienes el servicio:**

1. Haz clic en **"New +"** (botón azul arriba a la derecha)
2. Selecciona **"Web Service"**
3. En "Connect a repository":
   - Si es la primera vez, haz clic en **"Connect account"** → Autoriza GitHub
   - Busca y selecciona tu repositorio: **`eljosu/jorumi`**
   - Haz clic en **"Connect"**

4. Configuración del servicio:
   ```
   Name: jorumi-server
   Region: Oregon (US West)
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

5. **NO hagas clic en "Create Web Service" todavía**

#### 1.3 Configurar Variables de Entorno

**IMPORTANTE:** Antes de crear/desplegar, configura las variables.

1. Baja hasta la sección **"Environment Variables"**
2. Haz clic en **"Add Environment Variable"** tres veces para agregar:

   **Variable 1:**
   ```
   Key: NODE_ENV
   Value: production
   ```

   **Variable 2:**
   ```
   Key: PORT
   Value: 10000
   ```

   **Variable 3 (la completaremos después):**
   ```
   Key: CLIENT_URL
   Value: https://placeholder.com
   ```
   *(Por ahora usa un placeholder, lo actualizaremos después de tener Netlify)*

#### 1.4 Crear y Desplegar

1. Ahora sí, haz clic en **"Create Web Service"** (botón azul abajo)
2. Render comenzará a desplegar automáticamente
3. Ve a la pestaña **"Logs"** para ver el progreso
4. Verás algo como:
   ```
   ==> Cloning from https://github.com/eljosu/jorumi
   ==> Using Node.js version 22.16.0
   ==> Running build command 'npm install && npm run build'
   ==> Build succeeded 🎉
   ==> Deploying...
   ```

5. **Espera pacientemente** - puede tardar 5-10 minutos en el plan gratuito

#### 1.5 Verificar el Deployment

1. Cuando veas **"Live"** en verde (arriba a la izquierda), el servidor está corriendo
2. En la parte superior verás la URL de tu servicio:
   ```
   https://jorumi-server-XXXXX.onrender.com
   ```

3. **COPIA ESTA URL COMPLETA** - la necesitarás para Netlify

4. Prueba que funciona:
   - Haz clic en la URL o ábrela en una nueva pestaña
   - Deberías ver:
   ```json
   {
     "name": "JORUMI Server",
     "version": "1.0.0",
     "description": "Authoritative game server for JORUMI",
     "endpoints": {
       "health": "/health",
       "stats": "/stats",
       "websocket": "ws://..."
     }
   }
   ```

5. Prueba el health check:
   - Agrega `/health` a tu URL: `https://tu-servidor.onrender.com/health`
   - Deberías ver:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-04T...",
     "uptime": 123.456
   }
   ```

✅ **Si ves esto, tu backend está funcionando correctamente**

---

### 📍 PASO 2: Configurar Frontend en Netlify

#### 2.1 Acceder a Netlify

1. Ve a: **https://app.netlify.com**
2. Inicia sesión con tu cuenta

#### 2.2 Importar el Proyecto

**Si ya tienes el sitio creado:**
- Haz clic en tu sitio existente
- Ve al **Paso 2.3** directamente

**Si NO tienes el sitio:**

1. Haz clic en **"Add new site"** (botón verde)
2. Selecciona **"Import an existing project"**
3. Selecciona **"Deploy with GitHub"**
4. Si es la primera vez, autoriza Netlify en GitHub
5. Busca y selecciona: **`eljosu/jorumi`**
6. Configuración del sitio:
   ```
   Branch to deploy: main
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```

7. **NO hagas clic en "Deploy site" todavía**

#### 2.3 Configurar Variables de Entorno

**CRÍTICO:** Esto conecta el frontend con el backend.

1. Haz clic en **"Show advanced"** o **"Advanced build settings"**
2. En la sección **"Environment variables"**, haz clic en **"New variable"**
3. Agrega:
   ```
   Key: VITE_SERVER_URL
   Value: [LA URL QUE COPIASTE DE RENDER]
   ```
   
   **Ejemplo:**
   ```
   Key: VITE_SERVER_URL
   Value: https://jorumi-server-abc123.onrender.com
   ```

   **IMPORTANTE:**
   - ✅ Incluye `https://`
   - ✅ NO incluyas `/` al final
   - ✅ Debe ser exactamente la URL de Render

#### 2.4 Desplegar el Sitio

1. Ahora sí, haz clic en **"Deploy site"** (botón azul)
2. Netlify comenzará a construir y desplegar
3. Ve a la pestaña **"Deploys"** para ver el progreso
4. Verás:
   ```
   Building
   → Installing dependencies
   → Building site
   → Deploying
   Site is live ✓
   ```

5. Esto tarda 2-5 minutos

#### 2.5 Obtener la URL del Sitio

1. Una vez desplegado, verás la URL en la parte superior:
   ```
   https://random-name-123.netlify.app
   ```

2. Puedes cambiar el nombre:
   - Ve a **"Site settings"** → **"Change site name"**
   - Elige un nombre único (ej: `jorumi-game`)
   - Tu URL será: `https://jorumi-game.netlify.app`

3. **COPIA ESTA URL COMPLETA** - la necesitarás para actualizar Render

✅ **Frontend desplegado en Netlify**

---

### 📍 PASO 3: Conectar Backend ↔ Frontend

Ahora conectamos ambos servicios para que puedan comunicarse.

#### 3.1 Actualizar CLIENT_URL en Render

1. Vuelve a **Render**: https://dashboard.render.com
2. Selecciona tu servicio **jorumi-server**
3. Ve a la pestaña **"Environment"** (menú lateral izquierdo)
4. Busca la variable **`CLIENT_URL`**
5. Haz clic en el ícono de editar (lápiz)
6. Actualiza el valor con tu URL de Netlify:
   ```
   https://tu-sitio-jorumi.netlify.app
   ```

   **IMPORTANTE:**
   - ✅ Incluye `https://`
   - ✅ NO incluyas `/` al final
   - ✅ Debe ser exactamente tu URL de Netlify

7. Haz clic en **"Save Changes"**

#### 3.2 Esperar el Redespliegue

1. Render redespleará automáticamente (verás "Deploying..." arriba)
2. Espera 2-3 minutos
3. Cuando veas **"Live"** de nuevo, está listo

#### 3.3 Verificar las Variables

**En Render, deberías tener:**
```
NODE_ENV = production
PORT = 10000
CLIENT_URL = https://tu-sitio-jorumi.netlify.app
```

**En Netlify, deberías tener:**
```
VITE_SERVER_URL = https://jorumi-server-abc123.onrender.com
```

✅ **Backend y Frontend conectados**

---

### 📍 PASO 4: Verificación Final

#### 4.1 Verificar el Backend

1. Abre tu servidor en el navegador:
   ```
   https://tu-servidor.onrender.com/health
   ```

2. Deberías ver:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-04T...",
     "uptime": 123.456
   }
   ```

✅ **Backend funcionando**

#### 4.2 Verificar el Frontend

1. Abre tu sitio en el navegador:
   ```
   https://tu-sitio-jorumi.netlify.app
   ```

2. Deberías ver la aplicación JORUMI cargando

3. Abre la **Consola del Navegador**:
   - **Windows/Linux:** Presiona `F12` o `Ctrl + Shift + I`
   - **Mac:** Presiona `Cmd + Option + I`

4. En la pestaña **"Console"**, busca estos mensajes:
   ```
   [Config] Application configuration: { serverUrl: "https://..." }
   [SocketClient] Connecting to https://...
   [SocketClient] Connected
   [NetworkStore] Connected
   ```

✅ **Frontend funcionando y conectado**

#### 4.3 Probar la Conexión

1. En tu sitio, intenta crear una sala o interactuar
2. En la consola, NO deberías ver errores rojos
3. Deberías ver mensajes de WebSocket funcionando

✅ **Aplicación completamente funcional**

---

## 🎉 ¡Deployment Completado!

Tu aplicación JORUMI está ahora:
- ✅ Desplegada en Render (Backend)
- ✅ Desplegada en Netlify (Frontend)
- ✅ Conectada y funcionando
- ✅ Lista para usar

---

## 📊 Resumen de URLs

Guarda estas URLs para referencia:

### Backend (Render)
```
URL: https://jorumi-server-XXXXX.onrender.com
Health: https://jorumi-server-XXXXX.onrender.com/health
Dashboard: https://dashboard.render.com
```

### Frontend (Netlify)
```
URL: https://tu-sitio-jorumi.netlify.app
Dashboard: https://app.netlify.com
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to server"

**Síntomas:** La consola muestra errores de conexión

**Solución:**
1. Verifica que `VITE_SERVER_URL` en Netlify sea correcta
2. Verifica que el servidor en Render esté "Live"
3. Abre `https://tu-servidor.onrender.com/health` directamente

### Error: "CORS error"

**Síntomas:** La consola muestra "CORS policy" error

**Solución:**
1. Verifica que `CLIENT_URL` en Render sea exactamente tu URL de Netlify
2. Debe incluir `https://` y NO tener `/` al final
3. Redesplega Render después de cambiar

### Error: "WebSocket connection failed"

**Síntomas:** Conexión se establece pero se desconecta

**Solución:**
1. Asegúrate de usar `https://` (no `http://`)
2. Limpia caché del navegador
3. Prueba en modo incógnito

### Build falla en Render

**Síntomas:** El deployment muestra "Build failed"

**Solución:**
1. Revisa los logs en Render → Logs
2. Verifica que el último commit en GitHub sea el correcto
3. Intenta "Clear build cache & deploy"

---

## 📝 Checklist Final

Usa este checklist para verificar que todo esté correcto:

### Backend (Render)
- [ ] Servicio creado y conectado a GitHub
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Variable `NODE_ENV=production`
- [ ] Variable `PORT=10000`
- [ ] Variable `CLIENT_URL` con URL de Netlify
- [ ] Estado: **"Live"** en verde
- [ ] `/health` responde correctamente

### Frontend (Netlify)
- [ ] Sitio creado y conectado a GitHub
- [ ] Base directory: `client`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `client/dist`
- [ ] Variable `VITE_SERVER_URL` con URL de Render
- [ ] Sitio desplegado exitosamente
- [ ] Abre sin errores 404

### Conexión
- [ ] URLs cruzadas configuradas
- [ ] Sin errores CORS en consola
- [ ] WebSocket conecta correctamente
- [ ] Se puede crear una sala

---

## 🎯 Próximos Pasos

### 1. Probar Multiplayer

1. Abre tu sitio en 2 navegadores diferentes
2. En uno, crea una sala
3. En el otro, únete con el código
4. Verifica que ambos jugadores se vean

### 2. Monitorear

- **Render:** Revisa los logs regularmente
- **Netlify:** Monitorea el analytics

### 3. Dominio Personalizado (Opcional)

Si quieres tu propio dominio:
1. Compra un dominio
2. En Netlify: Domain settings → Add custom domain
3. En Render: Settings → Custom domains
4. Actualiza las variables de entorno con los nuevos dominios

---

## 📚 Documentación Adicional

- **`DEPLOYMENT_SUCCESS.md`** - Resumen técnico completo
- **`ENVIRONMENT_CONFIG.md`** - Detalles de variables de entorno
- **`DEPLOYMENT_FIX.md`** - Historial de correcciones
- **`GUIA_PASO_A_PASO.md`** - Guía original detallada

---

## ✅ Cambios Realizados en Esta Actualización

**Commit:** `fix: Agregar tipos de Node.js al engine para resolver error de console`

**Archivos modificados:**
- `engine/tsconfig.json` - Agregado `"types": ["node"]`
- `engine/package.json` - Movido `@types/node` a dependencies

**Problema resuelto:**
```
error TS2584: Cannot find name 'console'
```

**Resultado:**
- ✅ Engine compila correctamente
- ✅ Server compila correctamente
- ✅ Listo para deployment en Render

---

**Fecha:** 2026-01-04  
**Estado:** ✅ Listo para deployment  
**Último commit:** `4e7e8c5`

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema:

1. **Revisa los logs:**
   - Render: Logs tab
   - Netlify: Deploys → [último deploy] → Deploy log
   - Navegador: Consola (F12)

2. **Verifica las URLs:**
   - Deben ser exactas
   - Con `https://`
   - Sin `/` al final

3. **Limpia caché:**
   - Navegador: `Ctrl + Shift + Delete`
   - Render: Clear build cache & deploy
   - Netlify: Clear cache and deploy site

4. **Consulta la documentación:**
   - Lee `DEPLOYMENT_SUCCESS.md` para detalles técnicos
   - Lee `ENVIRONMENT_CONFIG.md` para variables de entorno

---

¡Buena suerte con tu deployment! 🚀

