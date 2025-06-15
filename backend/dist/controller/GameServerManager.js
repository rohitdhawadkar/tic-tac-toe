"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameServerManager = void 0;
const GameServer_1 = require("./GameServer");
class GameServerManager {
    constructor() {
        this.activeServers = new Map();
    } // Private singleton
    static getInstance() {
        if (!GameServerManager.instance) {
            GameServerManager.instance = new GameServerManager();
        }
        return GameServerManager.instance;
    }
    createServer(port) {
        if (this.activeServers.has(port)) {
            throw new Error(`Port ${port} already in use`);
        }
        const gameServer = new GameServer_1.GameServer(port);
        this.activeServers.set(port, gameServer);
        // Auto-cleanup on close
        gameServer.on('close', () => {
            this.activeServers.delete(port);
        });
        return gameServer;
    }
    getServer(port) {
        return this.activeServers.get(port);
    }
}
exports.gameServerManager = GameServerManager.getInstance();
