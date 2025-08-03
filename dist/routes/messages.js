"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📄 backend-universel/src/routes/messages.ts
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const cosmosClient_1 = require("../lib/cosmosClient");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * POST /api/messages
 * Crée un nouveau message dans la conversation donnée.
 */
router.post("/", (0, auth_1.validateAccessToken)("access_as_user"), async (req, res) => {
    const { conversationId, role, content, attachments } = req.body;
    const userId = req.auth.userId;
    if (!conversationId || !role || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const newMessage = {
            id: crypto_1.default.randomUUID(),
            conversationId,
            userId,
            role,
            content,
            attachments: attachments ?? [],
            createdAt: new Date().toISOString(),
        };
        const { resource } = await cosmosClient_1.containers.messages.items.create(newMessage);
        return res.status(201).json(resource);
    }
    catch (err) {
        console.error("❌ [POST /api/messages] Failed to insert message:", err);
        return res.status(500).json({ error: "Failed to insert message" });
    }
});
/**
 * GET /api/messages?conversationId=…
 * Récupère tous les messages d’une conversation, triés par date.
 */
router.get("/", (0, auth_1.validateAccessToken)("access_as_user"), async (req, res) => {
    const convId = req.query.conversationId;
    if (!convId) {
        return res
            .status(400)
            .json({ error: "conversationId query param missing" });
    }
    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.conversationId = @conversationId ORDER BY c.createdAt ASC",
            parameters: [{ name: "@conversationId", value: convId }],
        };
        const { resources } = await cosmosClient_1.containers.messages.items
            .query(querySpec)
            .fetchAll();
        return res.status(200).json(resources);
    }
    catch (err) {
        console.error("❌ [GET /api/messages] Failed to fetch messages:", err);
        return res.status(500).json({ error: "Failed to fetch messages" });
    }
});
exports.default = router;
