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
// Add this to your server setup (before routes)
app.use((req, res, next) => {
  // Allow all content from your own domain and common CDNs
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://tic-tac-toe-94oy.onrender.com; " +
    "connect-src 'self' wss://tic-tac-toe-94oy.onrender.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'none'; " +
    "object-src 'none'"
  );
  next();
});
app.use("/api/room", GameRoute);

// Health check endpoint (required by Render)
// Add this WebSocket-specific CSP for HTML responses
app.get("/", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "connect-src 'self' wss://tic-tac-toe-94oy.onrender.com"
  );
  res.send("Tic Tac Toe Server - WebSocket Ready");
});

// Start combined server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (HTTP + WebSocket)`);
});
