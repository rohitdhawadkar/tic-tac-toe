"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GameServerManager_1 = require("../controller/GameServerManager");
const router = (0, express_1.Router)();
router.post("/create-game-server", (req, res, next) => {
    try {
        const port = req.body.port;
        const gameServer = GameServerManager_1.gameServerManager.createServer(port);
        res.status(201).json({
            port,
            wsUrl: `ws://${req.hostname}:${port}`
        });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
exports.default = router;
