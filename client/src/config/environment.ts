/**
 * JORUMI Client - Environment Configuration
 * 
 * Centraliza la configuración de variables de entorno
 * y proporciona valores por defecto seguros
 */

/**
 * Obtiene la URL del servidor según el entorno
 */
export function getServerUrl(): string {
  // Vite expone las variables de entorno con el prefijo VITE_
  const envUrl = import.meta.env.VITE_SERVER_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback: detectar entorno de producción
  if (import.meta.env.PROD) {
    // En producción, intentar detectar la URL del servidor
    // Esto debe ser configurado en Netlify como variable de entorno
    console.warn('[Config] VITE_SERVER_URL not set in production, using default');
    return 'https://jorumi-server.onrender.com';
  }
  
  // Desarrollo local
  return 'http://localhost:3001';
}

/**
 * Verifica si estamos en modo desarrollo
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Verifica si estamos en modo producción
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Configuración completa de la aplicación
 */
export const config = {
  serverUrl: getServerUrl(),
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  
  // Configuración de Socket.IO
  socket: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  },
  
  // Configuración de logging
  logging: {
    enabled: isDevelopment(),
    level: isDevelopment() ? 'debug' : 'error',
  },
} as const;

// Log de configuración en desarrollo
if (isDevelopment()) {
  console.log('[Config] Application configuration:', config);
}

