import { GameProvider } from './context/GameContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import CreateGame from './pages/CreateGame';
import JoinGame from './pages/JoinGame';
import GameBoard from './pages/GameBoard';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/game" element={<GameBoard />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
export { App };
