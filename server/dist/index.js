"use strict";
/**
 * JORUMI Server - Entry Point
 *
 * Servidor autoritativo para JORUMI
 * Arquitectura: Express + Socket.IO + GameEngine
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const socket_server_1 = require("./network/socket-server");
// ==========================================================================
// CONFIGURACIÓN
// ==========================================================================
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// ==========================================================================
// SERVIDOR EXPRESS
// ==========================================================================
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true,
}));
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Stats endpoint
app.get('/stats', (req, res) => {
    if (socketServer) {
        res.json(socketServer.getStats());
    }
    else {
        res.status(503).json({ error: 'Server not ready' });
    }
});
// Root endpoint
app.get('/', (req, res) => {
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
const httpServer = (0, http_1.createServer)(app);
const socketServer = new socket_server_1.SocketServer(httpServer, {
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
//# sourceMappingURL=index.js.map