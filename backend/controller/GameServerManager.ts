import { GameServer } from './GameServer';

class GameServerManager {
  private static instance: GameServerManager;
  private activeServers: Map<number, GameServer> = new Map();

  private constructor() {} // Private singleton

  public static getInstance(): GameServerManager {
    if (!GameServerManager.instance) {
      GameServerManager.instance = new GameServerManager();
    }
    return GameServerManager.instance;
  }

  public createServer(port: number): GameServer {
    if (this.activeServers.has(port)) {
      throw new Error(`Port ${port} already in use`);
    }

    const gameServer = new GameServer(port);
    this.activeServers.set(port, gameServer);

    // Auto-cleanup on close
    gameServer.on('close', () => {
      this.activeServers.delete(port);
    });

    return gameServer;
  }

  public getServer(port: number): GameServer | undefined {
    return this.activeServers.get(port);
  }
}

export const gameServerManager = GameServerManager.getInstance();
