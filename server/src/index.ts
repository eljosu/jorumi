/**
 * JORUMI Server - Entry Point
 * 
 * Servidor autoritativo para JORUMI
 * Arquitectura: Express + Socket.IO + GameEngine
 */

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { SocketServer } from './network/socket-server';

// ==========================================================================
// CONFIGURACIÓN
// ==========================================================================

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==========================================================================
// SERVIDOR EXPRESS
// ==========================================================================

const app = express();

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Stats endpoint
app.get('/stats', (req: Request, res: Response) => {
  if (socketServer) {
    res.json(socketServer.getStats());
  } else {
    res.status(503).json({ error: 'Server not ready' });
  }
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'JORUMI Server',
    version: '1.0.0',
    description: 'Authoritative game server for JORUMI',
    endpoints: {
      health: '/health',
      stats: '/stats',
      websocket: 'ws://localhost:' + PORT,
    },
  });
});

// ==========================================================================
// SERVIDOR HTTP + WEBSOCKET
// ==========================================================================

const httpServer = createServer(app);

const socketServer = new SocketServer(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// ==========================================================================
// INICIO DEL SERVIDOR
// ==========================================================================

httpServer.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('   🎮 JORUMI AUTHORITATIVE SERVER');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`   Server:     http://localhost:${PORT}`);
  console.log(`   WebSocket:  ws://localhost:${PORT}`);
  console.log(`   Client:     ${CLIENT_URL}`);
  console.log('');
  console.log('   Status:     ✓ Running');
  console.log('   Engine:     ✓ Loaded');
  console.log('   Rooms:      ✓ Ready');
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});

// ==========================================================================
// MANEJO DE SEÑALES
// ==========================================================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  socketServer.shutdown();
  
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  socketServer.shutdown();
  
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});



