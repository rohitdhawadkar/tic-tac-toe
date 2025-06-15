"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GameRoute_1 = __importDefault(require("./Routes/GameRoute"));
const GameServerManager_1 = require("./controller/GameServerManager");
const app = (0, express_1.default)();
const HTTP_PORT = 3000;
const WS_PORT = 8080;
// Initialize WebSocket server
const gameServer = GameServerManager_1.gameServerManager.createServer(WS_PORT);
// Middleware
app.use(express_1.default.json());
app.use("/api/room", GameRoute_1.default);
// Start HTTP server
app.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT}`);
    console.log(`WebSocket Server is running on port ${WS_PORT}`);
});
