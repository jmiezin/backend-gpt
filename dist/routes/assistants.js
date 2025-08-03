"use strict";
// 📄 src/routes/assistants.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cosmosClient_1 = require("../lib/cosmosClient");
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../middleware/auth"); // ✅ Import du middleware d'authentification
const router = express_1.default.Router();
// 🔐 Middleware : protection de toutes les routes avec le scope assistants.access
router.use((0, auth_1.validateAccessToken)("assistants.access"));
// GET /assistants
router.get("/", async (_req, res) => {
    try {
        const container = cosmosClient_1.containers.assistants;
        const { resources } = await container.items
            .query("SELECT * FROM c ORDER BY c.createdAt DESC")
            .fetchAll();
        res.status(200).json(resources);
    }
    catch (error) {
        console.error("❌ Failed to fetch assistants:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des assistants" });
    }
});
// POST /assistants
router.post("/", async (req, res) => {
    const { name, description, instructions, userId } = req.body;
    if (!name || !description || !instructions || !userId) {
        return res.status(400).json({ error: "Champs requis manquants" });
    }
    try {
        const container = cosmosClient_1.containers.assistants;
        const newAssistant = {
            id: crypto_1.default.randomUUID(),
            name,
            description,
            instructions,
            userId,
            createdAt: new Date().toISOString(),
        };
        const { resource } = await container.items.create(newAssistant);
        res.status(201).json(resource);
    }
    catch (error) {
        console.error("❌ Failed to create assistant:", error);
        res.status(500).json({ error: "Erreur lors de la création de l'assistant" });
    }
});
exports.default = router;
