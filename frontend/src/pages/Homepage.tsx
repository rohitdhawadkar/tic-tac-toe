import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const HomePage = () => {
    const navigate = useNavigate();
    
    return (
        <div className="home-container">
            <div className="home-form">
                <h1>Tic Tac Toe</h1>
                <div className="button-group">
                    <button
                        onClick={() => navigate('/create')}
                        className="CreateGame"
                    >
                        Create Game
                    </button>
                    <button
                        onClick={() => navigate('/join')}
                        className="JoinGame"
                    >
                        Join Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;