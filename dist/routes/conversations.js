"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📄 src/routes/conversations.ts
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const cosmosClient_1 = require("../lib/cosmosClient");
const auth_1 = require("../middleware/auth"); // ✅ corrigé
const getUserId_1 = require("../utils/getUserId");
const router = express_1.default.Router();
// ✅ GET /conversations/project/:projectId
router.get("/project/:projectId", (0, auth_1.validateAccessToken)("access_as_user"), async (req, res) => {
    const { projectId } = req.params;
    const userId = (0, getUserId_1.getUserId)(req);
    try {
        const query = {
            query: "SELECT * FROM c WHERE c.projectId = @projectId AND c.userId = @userId ORDER BY c.createdAt DESC",
            parameters: [
                { name: "@projectId", value: projectId },
                { name: "@userId", value: userId },
            ],
        };
        const { resources } = await cosmosClient_1.containers.conversations.items
            .query(query)
            .fetchAll();
        res.status(200).json(resources);
    }
    catch (error) {
        console.error("❌ Failed to fetch conversations by project:", error);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});
// ✅ GET /conversations (toutes de l’utilisateur)
router.get("/", (0, auth_1.validateAccessToken)("access_as_user"), async (req, res) => {
    try {
        const userId = (0, getUserId_1.getUserId)(req);
        const query = {
            query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
            parameters: [{ name: "@userId", value: userId }],
        };
        const { resources } = await cosmosClient_1.containers.conversations.items
            .query(query)
            .fetchAll();
        res.status(200).json(resources);
    }
    catch (error) {
        console.error("❌ Failed to fetch conversations for user:", error);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});
// ✅ POST /conversations
router.post("/", (0, auth_1.validateAccessToken)("access_as_user"), async (req, res) => {
    const { projectId, title } = req.body;
    try {
        const userId = (0, getUserId_1.getUserId)(req);
        if (!title) {
            return res
                .status(400)
                .json({ error: "Champs requis manquants (title)" });
        }
        const newConversation = {
            id: crypto_1.default.randomUUID(),
            userId,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(projectId && { projectId }),
        };
        const { resource } = await cosmosClient_1.containers.conversations.items.create(newConversation);
        res.status(201).json(resource);
    }
    catch (error) {
        console.error("❌ Failed to insert conversation:", error);
        res.status(500).json({ error: "Failed to insert conversation" });
    }
});
exports.default = router;
