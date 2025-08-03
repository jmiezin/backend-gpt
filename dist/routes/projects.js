"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const cosmosClient_1 = require("../lib/cosmosClient");
const router = express_1.default.Router();
// GET /projects/user/:userId
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const query = {
            query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
            parameters: [{ name: "@userId", value: userId }],
        };
        const { resources } = await cosmosClient_1.containers.projects.items.query(query).fetchAll();
        res.status(200).json(resources);
    }
    catch (error) {
        console.error("❌ Failed to fetch projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});
// POST /projects
router.post("/", async (req, res) => {
    const { userId, title } = req.body;
    if (!userId || !title) {
        res.status(400).json({ error: "Champs requis manquants (userId, title)" });
        return;
    }
    try {
        const newProject = {
            id: crypto_1.default.randomUUID(),
            userId,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const { resource } = await cosmosClient_1.containers.projects.items.create(newProject);
        res.status(201).json(resource);
    }
    catch (error) {
        console.error("❌ Failed to insert project:", error);
        res.status(500).json({ error: "Failed to insert project" });
    }
});
exports.default = router;
