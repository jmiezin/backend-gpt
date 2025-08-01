// src/routes/ngrokRoutes.ts
import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { validateAccessToken } from "../middleware/auth"; // ✅ Middleware qui prend un scope en argument

const router = Router();

// ✅ Middleware global qui protège toutes les routes de ce routeur
router.use(validateAccessToken("access:ngrok"));

const storeFile = path.resolve("ngrok-tunnel.json");

// 📥 GET /ngrok/read — retourne le contenu du fichier JSON
router.get("/read", async (_req, res) => {
  try {
    const json = await fs.readFile(storeFile, "utf-8");
    res.json(JSON.parse(json));
  } catch {
    res.status(404).json({ message: "Aucun fichier trouvé." });
  }
});

// 📝 POST /ngrok/write — enregistre l'URL dans le fichier JSON
router.post("/write", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "'url' est requis (string)" });
  }

  try {
    await fs.writeFile(storeFile, JSON.stringify({ url }, null, 2), "utf-8");
    res.json({ status: "ok", saved: url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;