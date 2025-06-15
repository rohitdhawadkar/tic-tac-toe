import { Router } from "express";

import { gameServerManager } from "../controller/GameServerManager";
const router: Router = Router();

router.post<{},{}>("/create-game-server",(req,res,next)=>{
  try {
    const port = req.body.port;
    const gameServer = gameServerManager.createServer(port);

    res.status(201).json({
      port,
      wsUrl: `ws://${req.hostname}:${port}`
    });
  } catch (error) {
    res.status(500).json({ error });
  }
})

export default router;
