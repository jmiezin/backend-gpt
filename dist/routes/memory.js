"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const cosmosClient_1 = require("../lib/cosmosClient");
const router = express_1.default.Router();
// GET /memory/:conversationId
router.get("/:conversationId", async (req, res) => {
    const { conversationId } = req.params;
    try {
        const query = {
            query: "SELECT * FROM c WHERE c.conversationId = @conversationId ORDER BY c.createdAt ASC",
            parameters: [{ name: "@conversationId", value: conversationId }],
        };
        const { resources } = await cosmosClient_1.containers.memory.items.query(query).fetchAll();
        res.status(200).json(resources);
    }
    catch (error) {
        console.error("❌ Failed to fetch memory items:", error);
        res.status(500).json({ error: "Failed to fetch memory items" });
    }
});
// POST /memory
router.post("/", async (req, res) => {
    const { conversationId, userId, summary, type, embedding } = req.body;
    if (!conversationId || !userId || !summary || !type) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    try {
        const newMemory = {
            id: crypto_1.default.randomUUID(),
            conversationId,
            userId,
            summary,
            type,
            embedding,
            createdAt: new Date().toISOString(),
        };
        const { resource } = await cosmosClient_1.containers.memory.items.create(newMemory);
        res.status(201).json(resource);
    }
    catch (error) {
        console.error("❌ Failed to insert memory item:", error);
        res.status(500).json({ error: "Failed to insert memory item" });
    }
});
exports.default = router;
