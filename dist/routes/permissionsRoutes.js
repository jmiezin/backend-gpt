"use strict";
// 📄 src/routes/permissionsRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const permissions_1 = require("../lib/permissions");
const router = (0, express_1.Router)();
// ✅ Middleware de validation du scope correct
router.use((0, auth_1.validateAccessToken)("permissions.access"));
// ✅ Route corrigée pour être accessible depuis GET /permissions
router.get("/", async (req, res) => {
    try {
        const sub = (0, auth_1.getEffectiveUserId)(req);
        const roles = req.auth?.roles || [];
        const permissions = (0, permissions_1.computePermissions)(roles);
        res.status(200).json({ userId: sub, roles, permissions });
    }
    catch (err) {
        console.error("❌ Erreur dans /permissions :", err);
        res.status(500).json({ error: "Erreur interne lors de la récupération des permissions." });
    }
});
exports.default = router;
