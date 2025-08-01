import express, { Request, Response } from "express";
import crypto from "crypto";
import { containers } from "../lib/cosmosClient";

const router = express.Router();

// GET /memory/:conversationId
router.get("/:conversationId", async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  try {
    const query = {
      query: "SELECT * FROM c WHERE c.conversationId = @conversationId ORDER BY c.createdAt ASC",
      parameters: [{ name: "@conversationId", value: conversationId }],
    };
    const { resources } = await containers.memory.items.query(query).fetchAll();
    res.status(200).json(resources);
  } catch (error) {
    console.error("❌ Failed to fetch memory items:", error);
    res.status(500).json({ error: "Failed to fetch memory items" });
  }
});

// POST /memory
router.post("/", async (req: Request, res: Response) => {
  const { conversationId, userId, summary, type, embedding } = req.body;
  if (!conversationId || !userId || !summary || !type) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const newMemory = {
      id: crypto.randomUUID(),
      conversationId,
      userId,
      summary,
      type,
      embedding,
      createdAt: new Date().toISOString(),
    };
    const { resource } = await containers.memory.items.create(newMemory);
    res.status(201).json(resource);
  } catch (error) {
    console.error("❌ Failed to insert memory item:", error);
    res.status(500).json({ error: "Failed to insert memory item" });
  }
});

export default router;
