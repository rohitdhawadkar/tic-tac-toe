import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import GameRoute from "./Routes/GameRoute";
import { GameServer } from "./controller/GameServer"; // Your existing GameServer class

const app = express();
const PORT =  10000; // Render uses 10000 by default

// Create HTTP server
const httpServer = createServer(app);

// Create WebSocket server attached to HTTP server
const wss = new WebSocketServer({ server: httpServer });

// Initialize your game server
const gameServer = new GameServer(wss); // Modify GameServer to accept WebSocketServer instance

// Middleware
app.use(express.json());
app.use("/api/room", GameRoute);

// Health check endpoint (required by Render)
app.get("/", (req, res) => {
  res.send("Tic Tac Toe Server - WebSocket running on same port");
});

// Start combined server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (HTTP + WebSocket)`);
});
