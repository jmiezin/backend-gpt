// src/routes/users.ts
import express, { Request, Response } from "express";
import { containers } from "../lib/cosmosClient";
import { validateAccessToken } from "../middleware/auth";

interface UserDoc {
  id: string;
  name?: string;
  email?: string;
  // ajoutez ici d’autres champs métier si besoin
}

const router = express.Router();

// Appliquez la protection MSAL sur toutes les routes users
router.use(validateAccessToken());

// GET /users/:userId
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const auth = (req as any).auth;

  // 🔒 Optionnel : empêcher l'accès à un autre user
  if (auth.userId !== userId) {
    return res.status(403).json({ error: "Accès refusé pour cet utilisateur" });
  }

  const userToUpsert: UserDoc = {
    id: userId,
    name: auth.name || auth.preferred_username || "",
    email: auth.preferred_username || "",
    // ... d'autres champs éventuels (photo, rôle, etc.)
  };

  try {
    const { resource: user } = await containers.users.items.upsert(userToUpsert);
    return res.status(200).json(user);
  } catch (err: any) {
    console.error("[❌ UPSERT /users/:userId] Erreur :", err);
    return res.status(500).json({ error: "Erreur interne", raw: err.message });
  }
});

export default router;