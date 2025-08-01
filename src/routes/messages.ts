// 📄 backend-universel/src/routes/messages.ts
import express, { Request, Response } from "express";
import crypto from "crypto";
import { containers } from "../lib/cosmosClient";
import { validateAccessToken } from "../middleware/auth";

const router = express.Router();

/**
 * POST /api/messages
 * Crée un nouveau message dans la conversation donnée.
 */
router.post(
  "/",
  validateAccessToken("access_as_user"),
  async (req: Request, res: Response) => {
    const { conversationId, role, content, attachments } = req.body;
    const userId = (req as any).auth.userId as string;

    if (!conversationId || !role || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newMessage = {
        id: crypto.randomUUID(),
        conversationId,
        userId,
        role,
        content,
        attachments: attachments ?? [],
        createdAt: new Date().toISOString(),
      };
      const { resource } = await containers.messages.items.create(newMessage);
      return res.status(201).json(resource);
    } catch (err: any) {
      console.error("❌ [POST /api/messages] Failed to insert message:", err);
      return res.status(500).json({ error: "Failed to insert message" });
    }
  }
);

/**
 * GET /api/messages?conversationId=…
 * Récupère tous les messages d’une conversation, triés par date.
 */
router.get(
  "/",
  validateAccessToken("access_as_user"),
  async (req: Request, res: Response) => {
    const convId = req.query.conversationId as string | undefined;
    if (!convId) {
      return res
        .status(400)
        .json({ error: "conversationId query param missing" });
    }

    try {
      const querySpec = {
        query:
          "SELECT * FROM c WHERE c.conversationId = @conversationId ORDER BY c.createdAt ASC",
        parameters: [{ name: "@conversationId", value: convId }],
      };
      const { resources } = await containers.messages.items
        .query(querySpec)
        .fetchAll();

      return res.status(200).json(resources);
    } catch (err: any) {
      console.error("❌ [GET /api/messages] Failed to fetch messages:", err);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
);

export default router;