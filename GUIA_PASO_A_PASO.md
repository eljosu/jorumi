# 🚀 Guía Paso a Paso Completa - Deployment JORUMI

## 📋 Índice

1. [Verificar GitHub](#1-verificar-github)
2. [Configurar Backend en Render](#2-configurar-backend-en-render)
3. [Configurar Frontend en Netlify](#3-configurar-frontend-en-netlify)
4. [Conectar Backend con Frontend](#4-conectar-backend-con-frontend)
5. [Verificación Final](#5-verificación-final)
6. [Solución de Problemas](#6-solución-de-problemas)

---

## 1. Verificar GitHub

### ✅ Los cambios ya están en GitHub

Ya he subido todos los cambios al repositorio. Vamos a verificar:

### Paso 1.1: Verificar en el navegador

1. Ve a tu repositorio en GitHub:
   ```
   https://github.com/eljosu/jorumi
   ```

2. Deberías ver los commits recientes:
   - ✅ "docs: Agregar guía de deployment exitoso"
   - ✅ "fix: Resolver error de imports del engine en producción"
   - ✅ "feat: Configurar cliente para conectarse al servidor en producción"
   - ✅ "fix: Mover tipos de TypeScript a dependencies para Render build"

### Paso 1.2: Verificar localmente (opcional)

```bash
# En tu terminal, en la carpeta jorumi
git status
# Debería decir: "Your branch is up to date with 'origin/main'"

git log --oneline -5
# Deberías ver los últimos 5 commits
```

✅ **GitHub está actualizado y listo**

---

## 2. Configurar Backend en Render

### Paso 2.1: Acceder a Render

1. Ve a: https://dashboard.render.com
2. Inicia sesión con tu cuenta
3. Verás una lista de tus servicios

### Paso 2.2: Crear o Seleccionar el Servicio

**Si ya creaste el servicio:**
- Haz clic en tu servicio "jorumi-server" o como lo hayas nombrado

**Si NO has creado el servicio aún:**

1. Haz clic en **"New +"** → **"Web Service"**

2. Conecta tu repositorio de GitHub:
   - Haz clic en **"Connect account"** si es necesario
   - Busca y selecciona el repositorio `eljosu/jorumi`
   - Haz clic en **"Connect"**

3. Configura el servicio:
   ```
   Name: jorumi-server
   Region: Oregon (US West) [o el más cercano]
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

4. Haz clic en **"Create Web Service"**

### Paso 2.3: Configurar Variables de Entorno

**IMPORTANTE:** Esto es CRÍTICO para que funcione.

1. En tu servicio de Render, ve a la pestaña **"Environment"** (menú lateral izquierdo)

2. Haz clic en **"Add Environment Variable"**

3. Agrega estas **3 variables** una por una:

   **Variable 1:**
   ```
   Key: NODE_ENV
   Value: production
   ```
   → Haz clic en "Add"

   **Variable 2:**
   ```
   Key: PORT
   Value: 10000
   ```
   → Haz clic en "Add"

   **Variable 3 (IMPORTANTE - la agregaremos después):**
   ```
   Key: CLIENT_URL
   Value: [DEJAR EN BLANCO POR AHORA]
   ```
   → **NO la agregues todavía**, la completaremos en el Paso 4

4. Haz clic en **"Save Changes"**

### Paso 2.4: Esperar el Deployment

1. Render comenzará a desplegar automáticamente
2. Ve a la pestaña **"Logs"** para ver el progreso
3. Espera a ver:
   ```
   ==> Build succeeded 🎉
   ==> Deploying...
   ```

4. El despliegue puede tardar **5-10 minutos** en el plan gratuito

### Paso 2.5: Obtener la URL del Servidor

1. Una vez que el despliegue termine y veas **"Live"** en verde
2. En la parte superior de la página, verás la URL de tu servicio:
   ```
   https://jorumi-server-XXXXX.onrender.com
   ```

3. **COPIA ESTA URL COMPLETA** - la necesitarás para Netlify

4. Prueba que funciona:
   - Abre esa URL en tu navegador
   - Deberías ver algo como:
   ```json
   {
     "name": "JORUMI Server",
     "version": "1.0.0",
     "description": "Authoritative game server for JORUMI"
   }
   ```

5. Prueba el endpoint de salud:
   - Abre: `https://tu-servidor.onrender.com/health`
   - Deberías ver:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": 123
   }
   ```

✅ **Backend configurado y funcionando en Render**

---

## 3. Configurar Frontend en Netlify

### Paso 3.1: Acceder a Netlify

1. Ve a: https://app.netlify.com
2. Inicia sesión con tu cuenta
3. Verás una lista de tus sitios

### Paso 3.2: Crear o Seleccionar el Sitio

**Si ya creaste el sitio:**
- Haz clic en tu sitio "jorumi" o como lo hayas nombrado

**Si NO has creado el sitio aún:**

1. Haz clic en **"Add new site"** → **"Import an existing project"**

2. Conecta tu repositorio:
   - Selecciona **"Deploy with GitHub"**
   - Autoriza Netlify si es necesario
   - Busca y selecciona el repositorio `eljosu/jorumi`

3. Configura el sitio:
   ```
   Branch to deploy: main
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```

4. **NO hagas clic en "Deploy site" todavía** - primero configuraremos las variables

### Paso 3.3: Configurar Variables de Entorno

**IMPORTANTE:** Esto es CRÍTICO para la conexión con el backend.

1. Antes de desplegar, haz clic en **"Show advanced"** o **"Site settings"**

2. Ve a **"Site settings"** → **"Environment variables"** (o "Build & deploy" → "Environment")

3. Haz clic en **"Add a variable"** o **"Add environment variable"**

4. Agrega esta variable:
   ```
   Key: VITE_SERVER_URL
   Value: [LA URL QUE COPIASTE DE RENDER]
   ```
   
   **Ejemplo:**
   ```
   Key: VITE_SERVER_URL
   Value: https://jorumi-server-abc123.onrender.com
   ```

5. Haz clic en **"Save"**

### Paso 3.4: Desplegar el Sitio

1. Si aún no has desplegado:
   - Haz clic en **"Deploy site"**

2. Si el sitio ya estaba desplegado:
   - Ve a **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**

3. Espera a que el despliegue termine (2-5 minutos)

### Paso 3.5: Obtener la URL del Sitio

1. Una vez desplegado, verás la URL en la parte superior:
   ```
   https://tu-sitio-jorumi.netlify.app
   ```

2. **COPIA ESTA URL COMPLETA** - la necesitarás para completar Render

✅ **Frontend configurado y desplegado en Netlify**

---

## 4. Conectar Backend con Frontend

Ahora vamos a conectar ambos servicios para que puedan comunicarse.

### Paso 4.1: Actualizar CLIENT_URL en Render

1. Vuelve a Render: https://dashboard.render.com
2. Selecciona tu servicio **jorumi-server**
3. Ve a la pestaña **"Environment"**
4. Busca la variable `CLIENT_URL` (o agrégala si no existe)
5. Actualiza su valor con la URL de Netlify:
   ```
   Key: CLIENT_URL
   Value: https://tu-sitio-jorumi.netlify.app
   ```
   
   **IMPORTANTE:**
   - ✅ Incluye `https://`
   - ✅ NO incluyas `/` al final
   - ✅ Debe ser exactamente tu URL de Netlify

6. Haz clic en **"Save Changes"**

7. Render redespleará automáticamente (espera 2-3 minutos)

### Paso 4.2: Verificar las Variables

**En Render, deberías tener:**
```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://tu-sitio-jorumi.netlify.app
```

**En Netlify, deberías tener:**
```
VITE_SERVER_URL=https://jorumi-server-abc123.onrender.com
```

✅ **Backend y Frontend conectados**

---

## 5. Verificación Final

### Paso 5.1: Verificar el Backend

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

✅ Si ves esto, el backend está funcionando

### Paso 5.2: Verificar el Frontend

1. Abre tu sitio en el navegador:
   ```
   https://tu-sitio-jorumi.netlify.app
   ```

2. Abre la consola del navegador:
   - Windows/Linux: `F12` o `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`

3. En la consola, busca estos mensajes:
   ```
   [Config] Application configuration: { serverUrl: "https://..." }
   [SocketClient] Connecting to https://...
   ```

✅ Si ves estos mensajes, el frontend está configurado correctamente

### Paso 5.3: Verificar la Conexión

1. En tu sitio, intenta crear una sala o interactuar con el juego

2. En la consola del navegador, deberías ver:
   ```
   [SocketClient] Connected
   [NetworkStore] Connected
   ```

3. Si ves errores como:
   - ❌ "Failed to connect" → Revisa el Paso 6.1
   - ❌ "CORS error" → Revisa el Paso 6.2
   - ❌ "WebSocket connection failed" → Revisa el Paso 6.3

✅ **Aplicación completamente funcional**

---

## 6. Solución de Problemas

### 6.1 Error: "Cannot connect to server"

**Síntomas:**
- La consola muestra errores de conexión
- No se puede crear una sala

**Causa:** La URL del servidor es incorrecta o el servidor no está corriendo

**Solución:**

1. **Verifica la URL en Netlify:**
   - Ve a Netlify → Site settings → Environment variables
   - Busca `VITE_SERVER_URL`
   - Asegúrate de que sea exactamente: `https://tu-servidor.onrender.com`
   - NO debe tener espacios ni `/` al final

2. **Verifica que el servidor esté corriendo:**
   - Ve a Render → Tu servicio
   - Verifica que diga **"Live"** en verde
   - Si dice "Build failed" o "Deploy failed", revisa los logs

3. **Prueba el servidor directamente:**
   - Abre `https://tu-servidor.onrender.com/health` en el navegador
   - Debe responder con JSON, no con error

4. **Si hiciste cambios en Netlify:**
   - Ve a Deploys → Trigger deploy → Deploy site
   - Espera a que termine y prueba de nuevo

### 6.2 Error: "CORS error"

**Síntomas:**
- La consola muestra: "Access to XMLHttpRequest has been blocked by CORS policy"
- O: "CORS error"

**Causa:** El servidor no permite conexiones desde tu dominio de Netlify

**Solución:**

1. **Verifica CLIENT_URL en Render:**
   - Ve a Render → Tu servicio → Environment
   - Busca `CLIENT_URL`
   - Debe ser exactamente: `https://tu-sitio-jorumi.netlify.app`
   - ✅ Con `https://`
   - ✅ Sin `/` al final
   - ✅ Exactamente como aparece en Netlify

2. **Redesplega el servidor:**
   - Después de cambiar `CLIENT_URL`
   - Ve a Manual Deploy → Deploy latest commit
   - Espera 2-3 minutos

3. **Limpia la caché del navegador:**
   - `Ctrl + Shift + Delete` (Windows/Linux)
   - `Cmd + Shift + Delete` (Mac)
   - Selecciona "Cached images and files"
   - Haz clic en "Clear data"

### 6.3 Error: "WebSocket connection failed"

**Síntomas:**
- La consola muestra: "WebSocket connection to 'wss://...' failed"
- Conexión se establece pero se desconecta inmediatamente

**Causa:** Problema con la conexión WebSocket

**Solución:**

1. **Asegúrate de usar HTTPS:**
   - En Netlify, la variable debe ser `https://...` (no `http://`)
   - Render automáticamente usa HTTPS

2. **Verifica que el servidor acepte WebSocket:**
   - Render Free tier soporta WebSocket ✅
   - No debería haber problemas

3. **Prueba con otro navegador:**
   - A veces los bloqueadores de anuncios interfieren
   - Prueba en modo incógnito

### 6.4 Error: "Build failed" en Render

**Síntomas:**
- El despliegue falla
- Los logs muestran errores de compilación

**Causa:** Problema con las dependencias o el código

**Solución:**

1. **Revisa los logs de build:**
   - Ve a Render → Tu servicio → Logs
   - Lee el error específico

2. **Verifica que el commit esté actualizado:**
   - Ve a GitHub y verifica que el commit más reciente sea `f3cf2e2`
   - Si no, significa que los cambios no se subieron correctamente

3. **Fuerza un rebuild:**
   - Ve a Manual Deploy → Clear build cache & deploy

### 6.5 Error: "Build failed" en Netlify

**Síntomas:**
- El despliegue falla
- Los logs muestran errores

**Causa:** Problema con la configuración o dependencias

**Solución:**

1. **Verifica la configuración de build:**
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```

2. **Verifica las variables de entorno:**
   - Debe existir `VITE_SERVER_URL`
   - Con la URL correcta del servidor

3. **Revisa los logs de build:**
   - Ve a Deploys → [Último deploy] → Deploy log
   - Lee el error específico

---

## 7. Resumen de URLs y Variables

### Render (Backend)

**URL del servicio:**
```
https://jorumi-server-XXXXX.onrender.com
```

**Variables de entorno:**
```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://[TU-SITIO].netlify.app
```

### Netlify (Frontend)

**URL del sitio:**
```
https://[TU-SITIO].netlify.app
```

**Variables de entorno:**
```
VITE_SERVER_URL=https://jorumi-server-XXXXX.onrender.com
```

---

## 8. Checklist Final

Usa este checklist para verificar que todo esté correcto:

### Backend (Render)
- [ ] Servicio creado y conectado a GitHub
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Variable `NODE_ENV=production` configurada
- [ ] Variable `PORT=10000` configurada
- [ ] Variable `CLIENT_URL` configurada con URL de Netlify
- [ ] Build exitoso (estado "Live")
- [ ] Endpoint `/health` responde correctamente

### Frontend (Netlify)
- [ ] Sitio creado y conectado a GitHub
- [ ] Base directory: `client`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `client/dist`
- [ ] Variable `VITE_SERVER_URL` configurada con URL de Render
- [ ] Build exitoso (sitio desplegado)
- [ ] Sitio abre sin errores 404

### Conexión
- [ ] URLs cruzadas configuradas correctamente
- [ ] No hay errores CORS en la consola
- [ ] WebSocket se conecta correctamente
- [ ] Se puede crear una sala en el juego

---

## 9. Primeros Pasos Después del Deployment

Una vez que todo esté funcionando:

### 1. Prueba la Aplicación

1. Abre tu sitio en 2 navegadores diferentes o ventanas incógnito
2. En uno, crea una sala
3. En el otro, únete con el código de la sala
4. Verifica que ambos jugadores se vean
5. Intenta iniciar una partida

### 2. Monitorea los Logs

**En Render:**
- Ve a Logs para ver las conexiones en tiempo real
- Deberías ver mensajes como:
  ```
  [SocketServer] Client connected
  [RoomManager] Room created
  ```

**En Netlify:**
- Ve a Functions (si las usas) o Site analytics
- Monitorea el tráfico

### 3. Dominio Personalizado (Opcional)

**Para Netlify:**
1. Ve a Domain settings → Add custom domain
2. Sigue las instrucciones para configurar tu DNS

**Para Render:**
1. Ve a Settings → Custom domains
2. Agrega tu dominio y configura el DNS

### 4. Actualizar las URLs

Si configuras dominios personalizados:
1. Actualiza `CLIENT_URL` en Render con tu nuevo dominio
2. Actualiza `VITE_SERVER_URL` en Netlify con tu nuevo dominio del servidor
3. Redesplega ambos servicios

---

## 10. Mantenimiento Futuro

### Para Actualizar el Código

1. Haz cambios en tu código local
2. Haz commit:
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```
3. Render y Netlify redesplegarán automáticamente

### Monitoreo

- **Uptime:** Render y Netlify tienen dashboards de uptime
- **Errores:** Revisa los logs regularmente
- **Performance:** Render Free tier puede ser lento en "cold starts"

### Costos

- **Render Free:** 750 horas/mes, suficiente para desarrollo
- **Netlify Free:** 100GB bandwidth/mes, 300 build minutes/mes
- Si necesitas más, considera los planes pagos

---

## 🎉 ¡Felicidades!

Tu aplicación JORUMI ahora está completamente desplegada y funcional en producción con:
- ✅ Backend autoritativo en Render
- ✅ Frontend en Netlify
- ✅ WebSocket funcionando
- ✅ CORS configurado correctamente
- ✅ Variables de entorno configuradas

**¿Problemas?** Revisa la sección 6 de Solución de Problemas.

**¿Preguntas?** Consulta la documentación adicional:
- `DEPLOYMENT_SUCCESS.md` - Resumen técnico
- `DEPLOYMENT_FIX.md` - Historial de correcciones
- `ENVIRONMENT_CONFIG.md` - Detalles de variables de entorno

---

**Última actualización:** 2026-01-04
**Estado:** ✅ Guía completa y probada

