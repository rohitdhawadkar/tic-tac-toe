import { createContext, useContext, useState, ReactNode } from 'react';

type GameState = {
  playerName: string;
  playerMark: 'X' | 'O';
  opponentName: string;
  roomId: string;
  board: (string | null)[][];
};

type GameContextType = {
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
