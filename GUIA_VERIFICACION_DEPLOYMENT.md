# 🔍 Guía de Verificación de Deployment

## Fecha: 5 de enero de 2026

Esta guía te ayudará a verificar que tanto el backend (Render) como el frontend (Netlify) estén funcionando correctamente después del último deployment.

---

## 📋 CHECKLIST GENERAL

- [ ] Backend en Render funcionando
- [ ] Frontend en Netlify funcionando
- [ ] Comunicación frontend ↔ backend exitosa
- [ ] Sin errores en consola del navegador

---

## 🟢 PASO 1: Verificar Backend en Render

### 1.1 Acceder a Render Dashboard

1. Ve a: **https://render.com**
2. Inicia sesión con tu cuenta
3. En el dashboard, busca tu servicio: **`jorumi-server`**

### 1.2 Verificar Estado del Servicio

Deberías ver:
```
✅ Live (verde)
```

Si ves otro estado:
- 🟡 **Building**: Espera a que termine (2-5 minutos)
- 🔴 **Failed**: Revisa los logs (ve al PASO 1.4)
- 🟠 **Suspended**: Tu servicio gratuito se suspendió por inactividad, haz click en "Resume"

### 1.3 Obtener URL del Servicio

Tu backend debería estar en:
```
https://jorumi-server.onrender.com
```

O algo similar con tu nombre de servicio.

### 1.4 Probar Endpoints del Backend

Abre estos URLs en tu navegador para verificar que funcionan:

#### **Endpoint 1: Raíz `/`**
```
https://jorumi-server.onrender.com/
```

**Respuesta esperada** (JSON):
```json
{
  "name": "JORUMI Server",
  "version": "1.0.0",
  "description": "Authoritative game server for JORUMI",
  "endpoints": {
    "health": "/health",
    "stats": "/stats",
    "websocket": "ws://localhost:3001"
  }
}
```

#### **Endpoint 2: Health Check `/health`**
```
https://jorumi-server.onrender.com/health
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-05T...",
  "uptime": 123.456
}
```

#### **Endpoint 3: Stats `/stats`**
```
https://jorumi-server.onrender.com/stats
```

**Respuesta esperada**:
```json
{
  "rooms": 0,
  "totalPlayers": 0,
  "activeGames": 0,
  "uptime": 123.456
}
```

### 1.5 Verificar Variables de Entorno en Render

1. En el dashboard de Render, click en tu servicio
2. Ve a la pestaña **"Environment"** en el menú lateral izquierdo
3. Verifica que exista:

```
NODE_ENV = production
PORT = 10000 (o dejarlo vacío, Render lo asigna automáticamente)
CLIENT_URL = https://tu-app.netlify.app
```

⚠️ **IMPORTANTE**: Si `CLIENT_URL` no está configurado:
1. Click en **"Add Environment Variable"**
2. Key: `CLIENT_URL`
3. Value: Tu URL de Netlify (la obtendrás en el PASO 2)
4. Click **"Save Changes"**
5. El servicio se reiniciará automáticamente

### 1.6 Revisar Logs de Render (si hay errores)

1. En el dashboard, click en tu servicio
2. Ve a la pestaña **"Logs"**
3. Busca líneas que contengan:
   - ✅ `Server started on port 10000`
   - ✅ `Socket.IO server running`
   - ✅ `CORS enabled for: https://tu-app.netlify.app`
   - ❌ `Error:` (cualquier línea con "Error")

---

## 🔵 PASO 2: Verificar Frontend en Netlify

### 2.1 Acceder a Netlify Dashboard

1. Ve a: **https://netlify.com**
2. Inicia sesión con tu cuenta
3. En "Sites", busca tu proyecto (probablemente aparece como el nombre de tu repo: **`jorumi`**)

### 2.2 Verificar Estado del Deployment

Deberías ver:
```
✅ Published (verde)
```

Si ves otro estado:
- 🟡 **Building**: Espera a que termine (1-3 minutos)
- 🔴 **Failed**: Revisa los logs de build
- 🟠 **No deployment yet**: Necesitas configurar el proyecto

### 2.3 Obtener URL de tu App

Tu frontend debería estar en algo como:
```
https://tu-nombre-proyecto-123abc.netlify.app
```

O si configuraste un dominio personalizado:
```
https://tu-dominio.netlify.app
```

**Copia esta URL**, la necesitarás para configurar Render.

### 2.4 Verificar Variables de Entorno en Netlify

1. En el dashboard de Netlify, click en tu site
2. Ve a **"Site configuration"** → **"Environment variables"** (menú lateral)
3. Verifica que exista:

```
VITE_SERVER_URL = https://jorumi-server.onrender.com
```

⚠️ **IMPORTANTE**: Si no está configurada:
1. Click en **"Add a variable"**
2. Key: `VITE_SERVER_URL`
3. Value: `https://jorumi-server.onrender.com` (o tu URL de Render)
4. Click **"Create variable"**
5. Ve a **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**

### 2.5 Revisar Logs de Build de Netlify (si hay errores)

1. En el dashboard, click en tu site
2. Ve a **"Deploys"**
3. Click en el deployment más reciente
4. Revisa el log completo
5. Busca:
   - ✅ `vite v5.x.x building for production...`
   - ✅ `✓ built in XX.XXs`
   - ❌ `error TS` (errores de TypeScript)
   - ❌ `✘ [ERROR]` (errores de build)

---

## 🌐 PASO 3: Verificar Conexión Frontend ↔ Backend

### 3.1 Abrir la Aplicación en el Navegador

1. Ve a tu URL de Netlify: `https://tu-app.netlify.app`
2. **Presiona F12** para abrir DevTools
3. Ve a la pestaña **"Console"**

### 3.2 Verificar Mensajes de Conexión

Deberías ver estos mensajes en orden:

```javascript
[Config] Application configuration: { 
  serverUrl: "https://jorumi-server.onrender.com",
  isDevelopment: false,
  isProduction: true
}

[SocketClient] Connecting to https://jorumi-server.onrender.com

[SocketClient] Connected

[NetworkStore] Connected
```

### 3.3 Verificar la Pestaña "Network" (WebSocket)

1. En DevTools, ve a la pestaña **"Network"**
2. En el filtro, selecciona **"WS"** (WebSocket)
3. Deberías ver una conexión activa con estado **"101 Switching Protocols"**
4. Click en la conexión → pestaña **"Messages"**
5. Deberías ver mensajes siendo enviados/recibidos

### 3.4 Probar Funcionalidad Básica

En la aplicación:

1. **Deberías ver el menú de inicio** con:
   - Campo "Your Name"
   - Botón "Create New Room"
   - Botón "Join Existing Room"
   - Indicador de estado de conexión (verde si está conectado)

2. **Prueba crear una sala**:
   - Escribe tu nombre
   - Click en "Create New Room"
   - Deberías ver mensajes en consola como:
     ```
     [NetworkStore] Room created: XXXX
     ```

---

## ❌ SOLUCIÓN DE PROBLEMAS COMUNES

### Problema 1: Backend muestra "Failed" en Render

**Síntomas**: El servicio no arranca, estado en rojo

**Solución**:
1. Revisa logs en Render
2. Busca líneas con `Error:`
3. Errores comunes:
   - `Cannot find module`: Revisa que `package.json` tenga todas las dependencias
   - `Port already in use`: Reinicia el servicio
   - `TypeScript error`: Necesitas corregir errores de compilación

### Problema 2: Frontend muestra errores de CORS

**Síntomas**: En consola del navegador:
```
Access to XMLHttpRequest... has been blocked by CORS policy
```

**Solución**:
1. Ve a Render → Environment Variables
2. Verifica que `CLIENT_URL` tenga la URL exacta de Netlify
3. Reinicia el servicio en Render
4. Espera 1-2 minutos y recarga la app

### Problema 3: "Failed to connect to server"

**Síntomas**: En consola:
```
[SocketClient] Connection error
[NetworkStore] Disconnected
```

**Solución**:
1. Verifica que el backend esté "Live" en Render
2. Verifica que `VITE_SERVER_URL` en Netlify tenga la URL correcta
3. Prueba acceder directamente a `https://jorumi-server.onrender.com/health`
4. Si falla, el backend está caído

### Problema 4: Servicios gratuitos de Render se duermen

**Síntomas**: Primera conexión tarda 30-50 segundos

**Explicación**: Los servicios gratuitos de Render se "duermen" después de 15 minutos de inactividad

**Solución**:
- Es normal, solo espera la primera vez
- Para mantenerlo activo, considera:
  - Upgrade a plan de pago
  - Usar un servicio como UptimeRobot para hacer ping cada 10 minutos

### Problema 5: Variables de entorno no se actualizan

**Síntomas**: Cambios en variables de entorno no tienen efecto

**Solución**:
- **Render**: Las variables se aplican automáticamente al reiniciar
- **Netlify**: Necesitas hacer un **"Trigger deploy"** manual después de cambiar variables

---

## ✅ CHECKLIST FINAL DE VERIFICACIÓN

### Backend (Render)
- [ ] Estado: **Live** (verde)
- [ ] `/health` responde con `"status": "ok"`
- [ ] `/stats` responde sin errores
- [ ] Variable `CLIENT_URL` configurada correctamente
- [ ] Logs muestran: "Server started on port..."

### Frontend (Netlify)
- [ ] Estado: **Published** (verde)
- [ ] Variable `VITE_SERVER_URL` configurada correctamente
- [ ] App carga sin errores 404
- [ ] Consola muestra mensajes de configuración
- [ ] Consola muestra "Connected"

### Conexión
- [ ] No hay errores de CORS en consola
- [ ] WebSocket conectado (Network → WS)
- [ ] Indicador de conexión en verde
- [ ] Puedes crear/unirte a salas

---

## 📞 Si Necesitas Ayuda Adicional

Si algo no funciona:

1. **Copia los errores exactos** de:
   - Logs de Render
   - Logs de Netlify
   - Consola del navegador

2. **Toma screenshots** de:
   - Estado del servicio en Render
   - Variables de entorno en Render
   - Estado del deployment en Netlify
   - Variables de entorno en Netlify
   - Consola del navegador

3. **Comparte esta información** y podré ayudarte a diagnosticar el problema

---

## 🎉 Todo Funcionando

Si completaste todos los checkmarks (✅), ¡felicidades! Tu aplicación está:

- ✅ Backend deployado y funcionando en Render
- ✅ Frontend deployado y funcionando en Netlify
- ✅ Comunicación cliente-servidor establecida
- ✅ Lista para jugar en modo multiplayer

---

**Última actualización**: 5 de enero de 2026
**Estado**: Guía completa de verificación post-deployment

