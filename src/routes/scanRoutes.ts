// 📄 src/routes/scanRoutes.ts

import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import { getEnvVar } from "../config/env";
import { validateAccessToken } from "../middleware/auth"; // ← on importe le middleware

const router = Router();

// ─── Protéger toute la route /scan ─────────────────────────────────────────
router.use(validateAccessToken("scan.access")); 
// ────────────────────────────────────────────────────────────────────────────

// On réutilise les mêmes variables d’Azure OpenAI
const endpoint = getEnvVar("AZURE_OPENAI_ENDPOINT").replace(/\/+$/, "");
const deployment = getEnvVar("AZURE_OPENAI_DEPLOYMENT");
const apiVersion = getEnvVar("AZURE_OPENAI_API_VERSION");
const apiKey = getEnvVar("AZURE_OPENAI_API_KEY");

/**
 * POST /scan
 *   Body attendu : { question: string }
 *   Renvoie { answer: string } en “mode scan” (max_tokens = 1200).
 */
router.post("/", async (req: Request, res: Response) => {
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
      max_tokens: 1200,
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
    console.error("[scanRoutes] Erreur :", err);
    return res.status(500).json({
      error: "Erreur scan OpenAI",
      details: err.message,
    });
  }
});

export default router;