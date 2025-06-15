type Mark = 'X' | 'O';
type Board = (Mark | null)[][];

export class Game {
  public board: Board;

  constructor(
    public roomID: string,
    public gameID: number,
    public player1ID?: Mark,
    public player1Name?: string,
    public player2ID?: Mark,
    public player2Name?: string,
    initialBoard?: Board
  ) {
    this.board = initialBoard || [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
  }

  makeMove(playerID: Mark, move: { row: number; col: number }):
    { status: 'invalid' | 'valid' | 'win' | 'draw' } {

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

  private checkWin(playerID: Mark): boolean {
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

  private checkDraw(): boolean {
    return this.board.every(row => row.every(cell => cell !== null));
  }
}
