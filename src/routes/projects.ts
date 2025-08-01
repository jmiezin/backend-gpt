import express, { Request, Response } from "express";
import crypto from "crypto";
import { containers } from "../lib/cosmosClient";

const router = express.Router();

// GET /projects/user/:userId
router.get("/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const query = {
      query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
      parameters: [{ name: "@userId", value: userId }],
    };
    const { resources } = await containers.projects.items.query(query).fetchAll();
    res.status(200).json(resources);
  } catch (error) {
    console.error("❌ Failed to fetch projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST /projects
router.post("/", async (req: Request, res: Response) => {
  const { userId, title } = req.body;
  if (!userId || !title) {
    res.status(400).json({ error: "Champs requis manquants (userId, title)" });
    return;
  }
  try {
    const newProject = {
      id: crypto.randomUUID(),
      userId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { resource } = await containers.projects.items.create(newProject);
    res.status(201).json(resource);
  } catch (error) {
    console.error("❌ Failed to insert project:", error);
    res.status(500).json({ error: "Failed to insert project" });
  }
});

export default router;
