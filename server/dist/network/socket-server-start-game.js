"use strict";
// Fragmento para añadir al socket-server.ts después de handleLeaveRoom
handleStartGame(socket, Socket, connection, ClientConnection, message, any);
void {
    console, : .log('[SocketServer] handleStartGame called'),
    if(, connection) { }, : .playerId || !connection.roomId
};
{
    console.error('[SocketServer] Player not in room');
    this.sendError(socket, ErrorCode.PLAYER_NOT_IN_ROOM, 'Not in a room');
    return;
}
const room = this.roomManager.getRoom(connection.roomId);
if (!room) {
    console.error('[SocketServer] Room not found:', connection.roomId);
    this.sendError(socket, ErrorCode.ROOM_NOT_FOUND, 'Room not found');
    return;
}
// Verificar que sea el host (primer jugador)
const players = room.getAllPlayers();
if (players.length === 0 || players[0].id !== connection.playerId) {
    console.error('[SocketServer] Only host can start game');
    this.sendError(socket, ErrorCode.UNAUTHORIZED, 'Only the host can start the game');
    return;
}
// Verificar mínimo de jugadores (2 para jugar)
if (players.length < 2) {
    console.error('[SocketServer] Not enough players:', players.length);
    this.sendError(socket, ErrorCode.INVALID_GAME_STATE, 'Need at least 2 players to start');
    return;
}
console.log('[SocketServer] Starting game with', players.length, 'players');
// Iniciar juego en la sala
const success = room.startGame();
if (!success) {
    console.error('[SocketServer] Failed to start game');
    this.sendError(socket, ErrorCode.INTERNAL_ERROR, 'Could not start game');
    return;
}
const gameState = room.getGameState();
if (!gameState) {
    console.error('[SocketServer] No game state after starting');
    this.sendError(socket, ErrorCode.INTERNAL_ERROR, 'Game state not available');
    return;
}
console.log('[SocketServer] Game started successfully, broadcasting to room');
// Broadcast GAME_STARTED a todos los jugadores de la sala
this.broadcastToRoom(connection.roomId, {
    type: ServerMessageType.GAME_STARTED,
    roomId: connection.roomId,
    gameState,
});
this.log('Game started', {
    roomId: connection.roomId,
    players: players.length,
    gameId: gameState.gameId,
});
//# sourceMappingURL=socket-server-start-game.js.map