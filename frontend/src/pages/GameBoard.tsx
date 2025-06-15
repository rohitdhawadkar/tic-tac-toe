import { useWebSocket } from '../context/WebSocketContext';
import { useGame } from '../context/GameContext';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameBoard.css';

const GameBoard = () => {
    const { socket } = useWebSocket();
    const { gameState, setGameState } = useGame();
    const navigate = useNavigate();

    if (!gameState) {
        return (
            <div className="no-game-container">
                <p>No game is going on.</p>
                <button onClick={() => navigate('/')} className="back-home-btn">Go to Homepage</button>
            </div>
        );
    }

    const handleMove = (row: number, col: number) => {
        if (!socket || gameState.board[row][col]) return;
        
        socket.send(JSON.stringify({
            type: 'MOVE',
            move: { row, col }
        }));
    };

    useEffect(() => {
        if (!socket) return;
        
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'MOVE_MADE') {
                setGameState({
                    ...gameState,
                    board: message.board,
                    // Update other game state as needed
                });
            }
        };

        return () => {
            socket.onmessage = null;
        };
    }, [socket, gameState]);

    // Helper to determine winner
    const calculateWinner = (board: (string | null)[][]) => {
        const lines = [
            // Rows
            ...board,
            // Columns
            ...[0, 1, 2].map(i => board.map(row => row[i])),
            // Diagonals
            [board[0][0], board[1][1], board[2][2]],
            [board[0][2], board[1][1], board[2][0]]
        ];

        for (const line of lines) {
            if (line[0] && line.every(cell => cell === line[0])) {
                return line[0];
            }
        }
        return null;
    };

    const winner = useMemo(() => calculateWinner(gameState.board), [gameState.board]);
    const isDraw = useMemo(() => !winner && gameState.board.flat().every(cell => cell), [winner, gameState.board]);

    // Determine current turn
    const xCount = gameState.board.flat().filter(cell => cell === 'X').length;
    const oCount = gameState.board.flat().filter(cell => cell === 'O').length;
    const currentTurn = xCount === oCount ? 'X' : 'O';
    const isMyTurn = currentTurn === gameState.playerMark;

    return (
        <div className="game-container">
            <div className="game-wrapper">
                <div className="game-header">
                    <h2>Playing as {gameState.playerMark} ({gameState.playerName})</h2>
                </div>
                
                <div className="game-info">
                    <p className="opponent-info">
                        Opponent: {gameState.opponentName || 'Waiting...'}
                    </p>
                    <p className={`turn-info ${isMyTurn ? 'my-turn' : 'opponent-turn'}`}>
                        Current turn: {currentTurn} {isMyTurn ? '(Your turn)' : "(Opponent's turn)"}
                    </p>
                </div>

                <div className="game-status">
                    {winner && (
                        <h3 className={winner === gameState.playerMark ? 'win-message' : 'lose-message'}>
                            {winner === gameState.playerMark 
                                ? 'You win!' 
                                : `${gameState.opponentName || 'Opponent'} wins!`
                            }
                        </h3>
                    )}
                    {!winner && isDraw && (
                        <h3 className="draw-message">It's a draw!</h3>
                    )}
                </div>

                <div className="board">
                    {gameState.board.map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            {row.map((cell, colIndex) => (
                                <button
                                    key={colIndex}
                                    className={`cell ${cell ? cell.toLowerCase() : ''}`}
                                    onClick={() => handleMove(rowIndex, colIndex)}
                                    disabled={!!cell || !!winner || !isMyTurn}
                                >
                                    {cell}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameBoard;