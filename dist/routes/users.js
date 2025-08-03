"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/users.ts
const express_1 = __importDefault(require("express"));
const cosmosClient_1 = require("../lib/cosmosClient");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Appliquez la protection MSAL sur toutes les routes users
router.use((0, auth_1.validateAccessToken)());
// GET /users/:userId
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    const auth = req.auth;
    // 🔒 Optionnel : empêcher l'accès à un autre user
    if (auth.userId !== userId) {
        return res.status(403).json({ error: "Accès refusé pour cet utilisateur" });
    }
    const userToUpsert = {
        id: userId,
        name: auth.name || auth.preferred_username || "",
        email: auth.preferred_username || "",
        // ... d'autres champs éventuels (photo, rôle, etc.)
    };
    try {
        const { resource: user } = await cosmosClient_1.containers.users.items.upsert(userToUpsert);
        return res.status(200).json(user);
    }
    catch (err) {
        console.error("[❌ UPSERT /users/:userId] Erreur :", err);
        return res.status(500).json({ error: "Erreur interne", raw: err.message });
    }
});
exports.default = router;
