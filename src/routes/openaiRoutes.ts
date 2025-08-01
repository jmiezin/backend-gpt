// 📄 src/routes/openaiRoutes.ts

import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import { getEnvVar } from "../config/env";
import { validateAccessToken } from "../middleware/auth";

const router = Router();

// ─── Protéger toutes les routes /openai/* ─────────────────────────────────
router.use(validateAccessToken("openai.access"));
// ────────────────────────────────────────────────────────────────────────────

// Lecture des variables Azure OpenAI depuis .env
const endpoint = getEnvVar("AZURE_OPENAI_ENDPOINT").replace(/\/+$/, "");
const deployment = getEnvVar("AZURE_OPENAI_DEPLOYMENT");
const apiVersion = getEnvVar("AZURE_OPENAI_API_VERSION");
const apiKey = getEnvVar("AZURE_OPENAI_API_KEY");

/**
 * GET /openai/test-openai
 *   On envoie un prompt fixe “Dis Bonjour !” pour vérifier que ça fonctionne.
 */
router.get("/test-openai", async (_req: Request, res: Response) => {
  try {
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    const bodyPayload = {
      model: deployment,
      messages: [{ role: "user", content: "Dis Bonjour !" }],
      temperature: 0.2,
      max_tokens: 600,
    };

    const response = await fetch(url, {
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
    const reply: string = json?.choices?.[0]?.message?.content ?? "";
    return res.json({ reply });
  } catch (err: any) {
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
router.post("/ask", async (req: Request, res: Response) => {
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

    const response = await fetch(url, {
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
    const answer: string = json?.choices?.[0]?.message?.content ?? "";
    return res.json({ answer });
  } catch (err: any) {
    console.error("[openaiRoutes:ask] Erreur :", err);
    return res.status(500).json({
      error: "Erreur GPT",
      details: err.message,
    });
  }
});

export default router;