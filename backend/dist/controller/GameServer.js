"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameServer = void 0;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const events_1 = require("events");
const Game_1 = require("./Game");
class GameServer extends events_1.EventEmitter {
    constructor(port) {
        super();
        this.port = port;
        this.rooms = new Map();
        this.wss = new ws_1.WebSocketServer({ port });
        this.wss.on('connection', (ws) => {
            ws.on('message', (data) => this.handleMessage(ws, data));
            ws.on('close', () => this.handleDisconnect(ws));
        });
        this.on('roomCreated', (roomId) => {
            console.log(`Room ${roomId} created`);
        });
        this.on('roomClosed', (roomId) => {
            console.log(`Room ${roomId} closed`);
        });
    }
    close() {
        this.wss.close();
        this.emit('serverClosed');
    }
    handleMessage(ws, data) {
        try {
            const messageStr = data.toString();
            console.log('Received message:', messageStr);
            const message = JSON.parse(messageStr);
            switch (message.type) {
                case 'CREATE_GAME':
                    this.handleCreateGame(ws, message.playerName);
                    break;
                case 'JOIN_GAME':
                    this.handleJoinGame(ws, message.roomId, message.playerName);
                    break;
                case 'MOVE':
                    this.handleMove(ws, message.move);
                    break;
            }
        }
        catch (error) {
            console.error('Error handling message:', error);
            this.emit('error', error);
        }
    }
    handleCreateGame(ws, playerName) {
        const roomId = (0, uuid_1.v4)();
        const gameID = Math.floor(Math.random() * 10000);
        const room = {
            id: roomId,
            players: [{
                    ws,
                    playerID: 'X',
                    name: playerName
                }],
            game: new Game_1.Game(roomId, gameID, 'X', playerName, 'O'),
            currentPlayer: 'X'
        };
        this.rooms.set(roomId, room);
        this.emit('roomCreated', roomId);
        ws.send(JSON.stringify({
            type: 'GAME_CREATED',
            roomId,
            shareableLink: `https://yourdomain.com/join?room=${roomId}`
        }));
    }
    handleJoinGame(ws, roomId, playerName) {
        const room = this.rooms.get(roomId);
        if (!room || room.players.length !== 1) {
            ws.send(JSON.stringify({ type: 'JOIN_ERROR', message: 'Invalid room' }));
            return;
        }
        const player2 = {
            ws,
            playerID: 'O',
            name: playerName
        };
        room.players.push(player2);
        room.game.player2Name = playerName;
        this.emit('playerJoined', { roomId, playerName });
        // Notify both players that the game has started
        room.players.forEach(player => {
            player.ws.send(JSON.stringify({
                type: 'GAME_START',
                playerID: player.playerID,
                opponentName: player.playerID === 'X' ? player2.name : room.players[0].name,
                board: room.game.board,
                currentPlayer: 'X' // First move is always X
            }));
        });
    }
    handleMove(ws, move) {
        const room = this.findPlayerRoom(ws);
        if (!room) {
            console.log('Room not found for move');
            return;
        }
        const player = room.players.find(p => p.ws === ws);
        if (!player) {
            console.log('Player not found for move');
            return;
        }
        // Check if it's the player's turn
        if (room.currentPlayer !== player.playerID) {
            console.log('Not player\'s turn:', { currentPlayer: room.currentPlayer, playerID: player.playerID });
            ws.send(JSON.stringify({ type: 'INVALID_MOVE', message: 'Not your turn' }));
            return;
        }
        const result = room.game.makeMove(player.playerID, move);
        console.log('Move result:', result);
        if (result.status === 'invalid') {
            ws.send(JSON.stringify({ type: 'INVALID_MOVE', message: 'Invalid move' }));
            return;
        }
        // Update current player
        room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
        // Notify both players about the move
        room.players.forEach(p => {
            p.ws.send(JSON.stringify({
                type: 'MOVE_MADE',
                board: room.game.board,
                currentPlayer: room.currentPlayer,
                gameStatus: result.status
            }));
        });
        if (result.status === 'win' || result.status === 'draw') {
            this.rooms.delete(room.id);
            this.emit('gameEnded', { roomId: room.id, result: result.status });
        }
    }
    findPlayerRoom(ws) {
        for (const room of this.rooms.values()) {
            if (room.players.some(p => p.ws === ws)) {
                return room;
            }
        }
        return undefined;
    }
    handleDisconnect(ws) {
        const room = this.findPlayerRoom(ws);
        if (room) {
            const otherPlayer = room.players.find(p => p.ws !== ws);
            if (otherPlayer) {
                otherPlayer.ws.send(JSON.stringify({
                    type: 'OPPONENT_DISCONNECTED'
                }));
            }
            this.rooms.delete(room.id);
            this.emit('roomClosed', room.id);
        }
    }
}
exports.GameServer = GameServer;
