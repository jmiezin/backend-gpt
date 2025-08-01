// 📄 src/routes/permissionsRoutes.ts

import { Router } from "express";
import { validateAccessToken, getEffectiveUserId } from "../middleware/auth";
import { computePermissions } from "../lib/permissions";

const router = Router();

// ✅ Middleware de validation du scope correct
router.use(validateAccessToken("permissions.access"));

// ✅ Route corrigée pour être accessible depuis GET /permissions
router.get("/", async (req, res) => {
  try {
    const sub = getEffectiveUserId(req);
    const roles: string[] = (req as any).auth?.roles || [];
    const permissions = computePermissions(roles);

    res.status(200).json({ userId: sub, roles, permissions });
  } catch (err) {
    console.error("❌ Erreur dans /permissions :", err);
    res.status(500).json({ error: "Erreur interne lors de la récupération des permissions." });
  }
});

export default router;