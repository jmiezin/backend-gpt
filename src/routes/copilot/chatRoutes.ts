// src/routes/copilot/chatRoutes.ts
import express from "express";
const router = express.Router();

/**
 * 1) On ajoute un GET "/" pour que GET /copilot/chat ne renvoie plus 404.
 *    Ça nous permet de tester la route via "GET /copilot/chat" dans l’interface.
 */
router.get("/", (req, res) => {
  return res.json({ message: "chatRoutes GET stub" });
});

/**
 * 2) On garde aussi le POST "/" existant si besoin :
 */
router.post("/", (req, res) => {
  return res.json({ message: "chatRoutes POST stub" });
});

export default router;