import { createContext, useContext, useState, ReactNode } from 'react';

type WebSocketContextType = {
  socket: WebSocket | null;
  connect: (url: string) => WebSocket;
  disconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const connect = (url: string) => {
    // Disconnect existing connection if any
    if (socket) {
      socket.close();
    }

    const newSocket = new WebSocket(url);
    setSocket(newSocket);
    return newSocket;
  };

  const disconnect = () => {
    socket?.close();
    setSocket(null);
  };

  return (
    <WebSocketContext.Provider value={{ socket, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
