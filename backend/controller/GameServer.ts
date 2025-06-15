import { WebSocketServer, WebSocket, RawData } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { Game } from './Game';

type Player = {
  ws: WebSocket;
  playerID: 'X' | 'O';
  name: string;
};

type GameRoom = {
  id: string;
  players: Player[];
  game: Game;
  currentPlayer: 'X' | 'O';
};

export class GameServer extends EventEmitter {
  private rooms: Map<string, GameRoom> = new Map();
  private wss: WebSocketServer;

  constructor(public readonly port: number) {
    super();
    this.wss = new WebSocketServer({ port });

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

  public close() {
    this.wss.close();
    this.emit('serverClosed');
  }

  private handleMessage(ws: WebSocket, data: RawData) {
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
    } catch (error) {
      console.error('Error handling message:', error);
      this.emit('error', error);
    }
  }

  private handleCreateGame(ws: WebSocket, playerName: string) {
    const roomId = uuidv4();
    const gameID = Math.floor(Math.random() * 10000);

    const room: GameRoom = {
      id: roomId,
      players: [{
        ws,
        playerID: 'X',
        name: playerName
      }],
      game: new Game(roomId, gameID, 'X', playerName, 'O'),
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

  private handleJoinGame(ws: WebSocket, roomId: string, playerName: string) {
    const room = this.rooms.get(roomId);

    if (!room || room.players.length !== 1) {
      ws.send(JSON.stringify({ type: 'JOIN_ERROR', message: 'Invalid room' }));
      return;
    }

    const player2: Player = {
      ws,
      playerID: 'O',
      name: playerName
    };
    room.players.push(player2);
    room.game.player2Name = playerName;

    // Notify both players with complete game information
    room.players.forEach((player, index) => {
      player.ws.send(JSON.stringify({
        type: 'GAME_START',
        playerID: player.playerID,
        playerName: player.name,
        opponentName: room.players[index === 0 ? 1 : 0].name,
        opponentMark: room.players[index === 0 ? 1 : 0].playerID,
        board: room.game.board,
        currentPlayer: 'X', // X always starts first
        roomId: room.id
      }));
    });

    this.emit('playerJoined', { roomId, playerName });
  }

  private handleMove(ws: WebSocket, move: { row: number; col: number }) {
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

  private findPlayerRoom(ws: WebSocket): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.ws === ws)) {
        return room;
      }
    }
    return undefined;
  }

  private handleDisconnect(ws: WebSocket) {
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
