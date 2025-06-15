import express from "express";
import GameRoute from "./Routes/GameRoute";
import { gameServerManager } from "./controller/GameServerManager";

const app = express();
const HTTP_PORT = 3000;
const WS_PORT = 8080;

// Initialize WebSocket server
const gameServer = gameServerManager.createServer(WS_PORT);

// Middleware
app.use(express.json());
app.use("/api/room", GameRoute);

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`HTTP Server is running on port ${HTTP_PORT}`);
  console.log(`WebSocket Server is running on port ${WS_PORT}`);
});
