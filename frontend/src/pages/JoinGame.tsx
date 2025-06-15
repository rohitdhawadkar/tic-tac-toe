import { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import './JoinGame.css';

const JoinGame = () => {
    const { connect } = useWebSocket();
    const { setGameState } = useGame();
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');

    const handleJoinGame = () => {
        const ws = connect('ws://localhost:8080');
        
        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'JOIN_GAME',
                roomId,
                playerName
            }));
        };
        
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'GAME_START') {
                setGameState({
                    playerName,
                    playerMark: 'O',
                    opponentName: message.opponentName,
                    roomId,
                    board: message.board
                });
                navigate('/game');
            } else if (message.type === 'JOIN_ERROR') {
                alert(message.message);
            }
        };
    };

    return (
        <div className="join-container">
            <div className="join-form">
                <h2>Join Game</h2>
                <div className="input-group">
                    <label>Your Name</label>
                    <input
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        type="text"
                    />
                </div>
                <div className="input-group">
                    <label>Room ID</label>
                    <input
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        type="text"
                    />
                </div>
                <button onClick={handleJoinGame} className="btn">
                    Join Game
                </button>
            </div>
        </div>
    );
};

export default JoinGame;