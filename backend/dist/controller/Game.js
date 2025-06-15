"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    constructor(roomID, gameID, player1ID, player1Name, player2ID, player2Name, initialBoard) {
        this.roomID = roomID;
        this.gameID = gameID;
        this.player1ID = player1ID;
        this.player1Name = player1Name;
        this.player2ID = player2ID;
        this.player2Name = player2Name;
        this.board = initialBoard || [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
    }
    makeMove(playerID, move) {
        if (move.row < 0 || move.row > 2 || move.col < 0 || move.col > 2) {
            return { status: 'invalid' };
        }
        if (this.board[move.row][move.col] !== null) {
            return { status: 'invalid' };
        }
        this.board[move.row][move.col] = playerID;
        if (this.checkWin(playerID)) {
            return { status: 'win' };
        }
        if (this.checkDraw()) {
            return { status: 'draw' };
        }
        return { status: 'valid' };
    }
    checkWin(playerID) {
        const b = this.board;
        for (let i = 0; i < 3; i++) {
            if ((b[i][0] === playerID && b[i][1] === playerID && b[i][2] === playerID) ||
                (b[0][i] === playerID && b[1][i] === playerID && b[2][i] === playerID)) {
                return true;
            }
        }
        return (b[0][0] === playerID && b[1][1] === playerID && b[2][2] === playerID) ||
            (b[0][2] === playerID && b[1][1] === playerID && b[2][0] === playerID);
    }
    checkDraw() {
        return this.board.every(row => row.every(cell => cell !== null));
    }
}
exports.Game = Game;
