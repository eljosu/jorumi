# 🔧 Configuración de Variables de Entorno - JORUMI

## Resumen

Para que el frontend (Netlify) se conecte correctamente al backend (Render), necesitas configurar variables de entorno en ambas plataformas.

---

## 📋 Variables Requeridas

### Backend (Render)

1. **`PORT`** - Puerto del servidor (automático en Render, usa 10000)
2. **`NODE_ENV`** - Entorno de ejecución (`production`)
3. **`CLIENT_URL`** - URL del cliente para CORS

### Frontend (Netlify)

1. **`VITE_SERVER_URL`** - URL del servidor WebSocket

---

## 🚀 Configuración en Render (Backend)

### Paso 1: Acceder a las Variables de Entorno

1. Ve a tu servicio en Render: https://dashboard.render.com
2. Selecciona tu servicio `jorumi-server`
3. Ve a la pestaña **Environment**

### Paso 2: Agregar Variables

Agrega las siguientes variables:

```bash
NODE_ENV=production
CLIENT_URL=https://tu-app.netlify.app
```

**IMPORTANTE:** Reemplaza `https://tu-app.netlify.app` con la URL real de tu aplicación en Netlify.

### Paso 3: Guardar y Redesplegar

1. Haz clic en **Save Changes**
2. Render redespleagará automáticamente tu servicio

---

## 🌐 Configuración en Netlify (Frontend)

### Paso 1: Acceder a las Variables de Entorno

1. Ve a tu sitio en Netlify: https://app.netlify.com
2. Selecciona tu sitio `jorumi` o como lo hayas nombrado
3. Ve a **Site settings** → **Environment variables**

### Paso 2: Agregar Variables

Agrega la siguiente variable:

```bash
VITE_SERVER_URL=https://jorumi-server.onrender.com
```

**IMPORTANTE:** Reemplaza `https://jorumi-server.onrender.com` con la URL real de tu servidor en Render.

### Obtener la URL de Render:

1. Ve a tu servicio en Render
2. En la parte superior verás la URL del servicio (ejemplo: `https://jorumi-server-abc123.onrender.com`)
3. Copia esa URL completa

### Paso 3: Guardar y Redesplegar

1. Haz clic en **Save**
2. Ve a **Deploys** → **Trigger deploy** → **Deploy site**

---

## 🔍 Verificación

### Verificar Backend (Render)

1. Abre la URL de tu servidor en el navegador: `https://tu-servidor.onrender.com`
2. Deberías ver algo como:

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

3. Verifica el endpoint de salud: `https://tu-servidor.onrender.com/health`

```json
{
  "status": "ok",
  "timestamp": "2026-01-04T...",
  "uptime": 123.456
}
```

### Verificar Frontend (Netlify)

1. Abre tu aplicación en Netlify: `https://tu-app.netlify.app`
2. Abre la consola del navegador (F12)
3. Deberías ver logs de configuración:

```
[Config] Application configuration: { serverUrl: "https://...", ... }
```

4. Si hay problemas de conexión, verás errores en la consola

---

## ⚠️ Problemas Comunes

### Error: "Cannot connect to server"

**Causa:** La URL del servidor es incorrecta o el servidor no está corriendo.

**Solución:**
1. Verifica que la URL en `VITE_SERVER_URL` es correcta
2. Verifica que el servidor en Render está corriendo (estado "Live")
3. Intenta acceder directamente a la URL del servidor en el navegador

### Error: "CORS error"

**Causa:** El servidor no permite conexiones desde tu dominio de Netlify.

**Solución:**
1. Verifica que `CLIENT_URL` en Render está configurado correctamente
2. Debe coincidir exactamente con tu URL de Netlify (incluyendo `https://`)
3. Redesplega el servidor después de cambiar `CLIENT_URL`

### Error: "WebSocket connection failed"

**Causa:** El servidor no permite conexiones WebSocket o hay un problema de red.

**Solución:**
1. Verifica que Render está usando el plan correcto (Free tier soporta WebSocket)
2. Verifica que no hay firewalls o proxies bloqueando WebSocket
3. Intenta usar `https://` en lugar de `http://` en la URL del servidor

---

## 📝 Ejemplo Completo

### URLs de Ejemplo

Supongamos que:
- Tu servidor en Render es: `https://jorumi-server-abc123.onrender.com`
- Tu app en Netlify es: `https://jorumi-game.netlify.app`

### Configuración en Render

```bash
NODE_ENV=production
CLIENT_URL=https://jorumi-game.netlify.app
```

### Configuración en Netlify

```bash
VITE_SERVER_URL=https://jorumi-server-abc123.onrender.com
```

---

## 🔒 Seguridad

### Variables Sensibles

- **NO** incluyas API keys o secrets en el código fuente
- **NO** commites archivos `.env.local` al repositorio
- **SÍ** usa variables de entorno en las plataformas de deployment

### CORS

El servidor está configurado para aceptar solo conexiones desde `CLIENT_URL`. Asegúrate de que esta variable esté correctamente configurada para evitar accesos no autorizados.

---

## 📚 Recursos Adicionales

- [Documentación de Vite - Variables de Entorno](https://vitejs.dev/guide/env-and-mode.html)
- [Documentación de Netlify - Variables de Entorno](https://docs.netlify.com/environment-variables/overview/)
- [Documentación de Render - Variables de Entorno](https://render.com/docs/environment-variables)

---

**Última actualización:** 2026-01-04

