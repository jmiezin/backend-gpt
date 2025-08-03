"use strict";
// 📄 src/routes/openaiRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ─── Protéger toutes les routes /openai/* ─────────────────────────────────
router.use((0, auth_1.validateAccessToken)("openai.access"));
// ────────────────────────────────────────────────────────────────────────────
// Lecture des variables Azure OpenAI depuis .env
const endpoint = (0, env_1.getEnvVar)("AZURE_OPENAI_ENDPOINT").replace(/\/+$/, "");
const deployment = (0, env_1.getEnvVar)("AZURE_OPENAI_DEPLOYMENT");
const apiVersion = (0, env_1.getEnvVar)("AZURE_OPENAI_API_VERSION");
const apiKey = (0, env_1.getEnvVar)("AZURE_OPENAI_API_KEY");
/**
 * GET /openai/test-openai
 *   On envoie un prompt fixe “Dis Bonjour !” pour vérifier que ça fonctionne.
 */
router.get("/test-openai", async (_req, res) => {
    try {
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        const bodyPayload = {
            model: deployment,
            messages: [{ role: "user", content: "Dis Bonjour !" }],
            temperature: 0.2,
            max_tokens: 600,
        };
        const response = await (0, node_fetch_1.default)(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(bodyPayload),
        });
        if (!response.ok) {
            const text = await response.text().catch(() => response.statusText);
            throw new Error(`Azure OpenAI HTTP ${response.status} – ${text}`);
        }
        const json = await response.json();
        const reply = json?.choices?.[0]?.message?.content ?? "";
        return res.json({ reply });
    }
    catch (err) {
        console.error("[openaiRoutes:test-openai] Erreur :", err);
        return res.status(500).json({
            error: "Erreur test OpenAI",
            details: err.message,
        });
    }
});
/**
 * POST /openai/ask
 *   Body attendu : { question: string }
 *   Renvoie { answer: string }.
 */
router.post("/ask", async (req, res) => {
    const { question } = req.body;
    if (typeof question !== "string") {
        return res
            .status(400)
            .json({ error: "Le champ 'question' est requis (type string)." });
    }
    try {
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        const bodyPayload = {
            model: deployment,
            messages: [{ role: "user", content: question }],
            temperature: 0.2,
            max_tokens: 600,
        };
        const response = await (0, node_fetch_1.default)(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(bodyPayload),
        });
        if (!response.ok) {
            const text = await response.text().catch(() => response.statusText);
            throw new Error(`Azure OpenAI HTTP ${response.status} – ${text}`);
        }
        const json = await response.json();
        const answer = json?.choices?.[0]?.message?.content ?? "";
        return res.json({ answer });
    }
    catch (err) {
        console.error("[openaiRoutes:ask] Erreur :", err);
        return res.status(500).json({
            error: "Erreur GPT",
            details: err.message,
        });
    }
});
exports.default = router;
