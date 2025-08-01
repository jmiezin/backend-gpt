// src/routes/apikey.ts

import express, { Request, Response } from "express";
import { validateAccessToken } from "../middleware/auth";

const router = express.Router();

/**
 * Route protégée : retourne la clé API configurée dans .env.
 * Comme ce router est monté sous "/apikey", on définit ici `router.get('/')`,
 * ce qui donne au final "GET /apikey".
 */
router.get("/", validateAccessToken("access_as_user"), (req: Request, res: Response) => {
  res.json({ apiKey: process.env.API_KEY });
});

export default router;