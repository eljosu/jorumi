# ⚡ Quick Deploy Checklist - JORUMI

## Pre-Deploy (Local)

```bash
# 1. Verificar que todo funciona localmente
cd client
npm run dev  # Debe funcionar en http://localhost:5173

cd ../server
npm run dev  # Debe funcionar en http://localhost:3000

# 2. Commit final
cd ..
git add .
git commit -m "ready for production deploy"
git push origin main
```

---

## 🔥 Deploy Rápido (10 minutos)

### PASO 1: Render (Backend) - 5 min

1. Ve a https://render.com → Sign up con GitHub
2. **New +** → **Web Service**
3. Conecta repo `jorumi`
4. Configuración:
   ```
   Name: jorumi-backend
   Root Directory: server
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
5. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://TU-APP.netlify.app
   ```
6. **Create Web Service**
7. ⏱️ Espera 5-8 min
8. 📋 **COPIA LA URL:** `https://jorumi-backend.onrender.com`

---

### PASO 2: Netlify (Frontend) - 3 min

1. Ve a https://netlify.com → Sign up con GitHub
2. **Add new site** → **Import from Git**
3. Selecciona repo `jorumi`
4. Configuración:
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```
5. **Environment Variables:**
   ```
   VITE_API_URL=https://jorumi-backend.onrender.com
   ```
   ⚠️ Usa la URL que copiaste del PASO 1
6. **Deploy site**
7. ⏱️ Espera 3-5 min
8. 📋 **COPIA LA URL:** `https://random-123.netlify.app`

---

### PASO 3: Conectar Frontend ↔️ Backend - 1 min

1. Ve a **Render** → Tu servicio → **Environment**
2. Edita `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://random-123.netlify.app
   ```
   ⚠️ Usa la URL que copiaste del PASO 2
3. **Save Changes**
4. ⏱️ Render hará re-deploy automático (2 min)

---

### PASO 4: ✅ Verificar

1. Abre tu app de Netlify en el navegador
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Busca:
   ```
   ✅ [SocketClient] Connected
   ❌ CORS error... (malo)
   ```

**Si ves CORS error:**
- Verifica que las URLs no tengan `/` al final
- Verifica que CORS_ORIGIN en Render sea correcta
- Espera 2 min más para que Render termine el re-deploy

**Si todo está bien:**
🎉 ¡Tu aplicación está LIVE!

---

## 📱 URLs Finales

```
Frontend: https://random-123.netlify.app
Backend:  https://jorumi-backend.onrender.com
```

**Opcional:** Cambia el nombre del sitio:
- Netlify → Site settings → Change site name → `jorumi-game`
- Nueva URL: `https://jorumi-game.netlify.app`

---

## 🐛 Problemas Comunes

### ❌ Build Failed en Netlify

**Error:** `Cannot find module '@engine/index'`

**Fix:**
```bash
# Verifica que client/tsconfig.json tenga:
"paths": {
  "@engine/*": ["../engine/*"]
}

# Y que engine/index.ts exporte los tipos necesarios
```

### ❌ CORS Error

**Error:** `Access-Control-Allow-Origin missing`

**Fix:**
1. Render → Environment → `CORS_ORIGIN` debe ser EXACTAMENTE la URL de Netlify
2. Sin `/` al final
3. Con `https://`
4. Espera 2 min para re-deploy

### ❌ WebSocket No Conecta

**Error:** `WebSocket connection failed`

**Fix:**
```typescript
// En client/src/network/socket-client.ts
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
});
```

### ❌ 404 en Assets

**Error:** `Failed to load resource: /assets/3d/...`

**Fix:**
- Mueve la carpeta `client/assets/` a `client/public/assets/`
- O actualiza las rutas en el código

---

## 🚀 Auto-Deploy

Cada vez que hagas `git push origin main`:
- ✅ Netlify se actualiza automáticamente
- ✅ Render se actualiza automáticamente

No necesitas hacer nada más!

---

## 📊 Monitoring

**Ver logs en vivo:**

Render:
```
Dashboard → jorumi-backend → Logs
```

Netlify:
```
Dashboard → jorumi-game → Deploys → [último deploy] → Deploy log
```

---

## 💰 Costos

- **GitHub:** Gratis
- **Netlify:** 
  - ✅ Free: 100GB bandwidth/mes
  - 💰 Pro: $19/mes (más bandwidth)
- **Render:**
  - ✅ Free: 750 horas/mes (se duerme después de 15min)
  - 💰 Starter: $7/mes (siempre activo)

**Recomendación para producción:**
- Netlify Free (suficiente)
- Render Starter ($7/mes) para que no se duerma

---

## ⏱️ Tiempo Total: ~10 minutos

```
✅ Render setup:      5 min
✅ Netlify setup:     3 min
✅ Configurar CORS:   1 min
✅ Verificar:         1 min
─────────────────────────
   TOTAL:            10 min
```

---

**¿Listo para deploy?** → Sigue los 4 pasos y tendrás tu app en producción! 🚀

**Fecha:** 4 de Enero, 2025

