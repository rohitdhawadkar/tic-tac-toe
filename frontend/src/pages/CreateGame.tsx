import { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import './CreateGame.css';

const CreateGame = () => {
    const { connect } = useWebSocket();
    const { setGameState } = useGame();
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');

    const handleCreateGame = () => {
        const ws = connect('ws://localhost:8080');
        
        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'CREATE_GAME',
                playerName
            }));
        };
        
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'GAME_CREATED') {
                setGameState({
                    playerName,
                    playerMark: 'X',
                    opponentName: '',
                    roomId: message.roomId,
                    board: message.board || Array(3).fill(Array(3).fill(null))
                });
                setRoomId(message.roomId);
            } else if (message.type === 'GAME_START') {
                setGameState({
                    playerName,
                    playerMark: 'X',
                    opponentName: message.opponentName,
                    roomId: message.roomId,
                    board: message.board
                });
                navigate('/game');
            }
        };
    };

    return (
        <div className="create-container">
            <div className="create-form">
                <h2>Create Game</h2>
                <div className="input-group">
                    <label>Your Name</label>
                    <input
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        type="text"
                    />
                </div>
                <button onClick={handleCreateGame} className="btn">
                    Create Game
                </button>
                
                {roomId && (
                    <div className="waiting-section">
                        <p>Waiting for player to join...</p>
                        <p>Room ID:</p>
                        <div className="room-id">{roomId}</div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(roomId)}
                            className="copy-btn"
                        >
                            Copy Room ID
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateGame;