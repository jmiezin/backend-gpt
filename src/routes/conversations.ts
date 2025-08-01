// 📄 src/routes/conversations.ts
import express, { Request, Response } from "express";
import crypto from "crypto";
import { containers } from "../lib/cosmosClient";
import { validateAccessToken } from "../middleware/auth"; // ✅ corrigé
import { getUserId } from "../utils/getUserId";

const router = express.Router();

// ✅ GET /conversations/project/:projectId
router.get(
  "/project/:projectId",
  validateAccessToken("access_as_user"),
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = getUserId(req);
    try {
      const query = {
        query:
          "SELECT * FROM c WHERE c.projectId = @projectId AND c.userId = @userId ORDER BY c.createdAt DESC",
        parameters: [
          { name: "@projectId", value: projectId },
          { name: "@userId", value: userId },
        ],
      };
      const { resources } = await containers.conversations.items
        .query(query)
        .fetchAll();
      res.status(200).json(resources);
    } catch (error) {
      console.error("❌ Failed to fetch conversations by project:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  }
);

// ✅ GET /conversations (toutes de l’utilisateur)
router.get(
  "/",
  validateAccessToken("access_as_user"),
  async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const query = {
        query:
          "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
        parameters: [{ name: "@userId", value: userId }],
      };
      const { resources } = await containers.conversations.items
        .query(query)
        .fetchAll();
      res.status(200).json(resources);
    } catch (error) {
      console.error("❌ Failed to fetch conversations for user:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  }
);

// ✅ POST /conversations
router.post(
  "/",
  validateAccessToken("access_as_user"),
  async (req: Request, res: Response) => {
    const { projectId, title } = req.body;
    try {
      const userId = getUserId(req);
      if (!title) {
        return res
          .status(400)
          .json({ error: "Champs requis manquants (title)" });
      }

      const newConversation: any = {
        id: crypto.randomUUID(),
        userId,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(projectId && { projectId }),
      };

      const { resource } = await containers.conversations.items.create(
        newConversation
      );
      res.status(201).json(resource);
    } catch (error) {
      console.error("❌ Failed to insert conversation:", error);
      res.status(500).json({ error: "Failed to insert conversation" });
    }
  }
);

export default router;