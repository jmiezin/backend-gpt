// 📄 src/routes/assistants.ts

import express, { Request, Response } from "express";
import { containers } from "../lib/cosmosClient";
import crypto from "crypto";
import { validateAccessToken } from "../middleware/auth"; // ✅ Import du middleware d'authentification

const router = express.Router();

// 🔐 Middleware : protection de toutes les routes avec le scope assistants.access
router.use(validateAccessToken("assistants.access"));

// GET /assistants
router.get("/", async (_req: Request, res: Response) => {
  try {
    const container = (containers as any).assistants;
    const { resources } = await container.items
      .query("SELECT * FROM c ORDER BY c.createdAt DESC")
      .fetchAll();

    res.status(200).json(resources);
  } catch (error) {
    console.error("❌ Failed to fetch assistants:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des assistants" });
  }
});

// POST /assistants
router.post("/", async (req: Request, res: Response) => {
  const { name, description, instructions, userId } = req.body;
  if (!name || !description || !instructions || !userId) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const container = (containers as any).assistants;
    const newAssistant = {
      id: crypto.randomUUID(),
      name,
      description,
      instructions,
      userId,
      createdAt: new Date().toISOString(),
    };

    const { resource } = await container.items.create(newAssistant);
    res.status(201).json(resource);
  } catch (error) {
    console.error("❌ Failed to create assistant:", error);
    res.status(500).json({ error: "Erreur lors de la création de l'assistant" });
  }
});

export default router;