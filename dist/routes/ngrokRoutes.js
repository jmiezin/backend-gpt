"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/ngrokRoutes.ts
const express_1 = require("express");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth"); // ✅ Middleware qui prend un scope en argument
const router = (0, express_1.Router)();
// ✅ Middleware global qui protège toutes les routes de ce routeur
router.use((0, auth_1.validateAccessToken)("access:ngrok"));
const storeFile = path_1.default.resolve("ngrok-tunnel.json");
// 📥 GET /ngrok/read — retourne le contenu du fichier JSON
router.get("/read", async (_req, res) => {
    try {
        const json = await promises_1.default.readFile(storeFile, "utf-8");
        res.json(JSON.parse(json));
    }
    catch {
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
        await promises_1.default.writeFile(storeFile, JSON.stringify({ url }, null, 2), "utf-8");
        res.json({ status: "ok", saved: url });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
