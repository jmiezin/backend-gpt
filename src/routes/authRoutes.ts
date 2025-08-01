// 📄 src/routes/authRoutes.ts
import dotenv from "dotenv";
dotenv.config(); // ⚠️ Assure que .env est chargé, utile si ce fichier est importé isolément

import express, { Request, Response } from "express";
import {
  ConfidentialClientApplication,
  AuthorizationCodeRequest
} from "@azure/msal-node";

const router = express.Router();

// 🔐 Vérification des variables critiques
const {
  AZURE_AD_CLIENT_ID,
  AZURE_AD_CLIENT_SECRET,
  AZURE_AD_TENANT_ID,
  BACKEND_API_SCOPES,
  BACKEND_REDIRECT_URI,
  FRONTEND_URI,
} = process.env;

if (!AZURE_AD_CLIENT_ID || !AZURE_AD_CLIENT_SECRET || !AZURE_AD_TENANT_ID) {
  throw new Error("❌ Client ID, Tenant ID ou Client Secret manquant dans .env");
}

if (!BACKEND_API_SCOPES || !BACKEND_REDIRECT_URI || !FRONTEND_URI) {
  throw new Error("❌ BACKEND_API_SCOPES, BACKEND_REDIRECT_URI ou FRONTEND_URI manquant dans .env");
}

// ① Configuration MSAL pour le client confidentiel
const cca = new ConfidentialClientApplication({
  auth: {
    clientId: AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}`,
    clientSecret: AZURE_AD_CLIENT_SECRET,
  },
});

/**
 * GET /auth/callback
 * Route d’échange du code PKCE contre des tokens
 */
router.get("/callback", async (req: Request, res: Response) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`Error: ${error} – ${error_description}`);
  }
  if (!code) {
    return res.status(400).send("No authorization code provided");
  }

  const codeVerifier = req.cookies.pkce_verifier;
  if (!codeVerifier) {
    return res.status(400).send("PKCE code_verifier missing");
  }

  try {
    const tokenRequest: AuthorizationCodeRequest = {
      code: code as string,
      scopes: JSON.parse(BACKEND_API_SCOPES),
      redirectUri: BACKEND_REDIRECT_URI,
      codeVerifier,
    };

    const tokenResponse = await cca.acquireTokenByCode(tokenRequest);

    res.cookie("access_token", tokenResponse!.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect(FRONTEND_URI);
  } catch (err) {
    console.error("❌ Token exchange failed:", err);
    res.status(500).send("Token exchange failed");
  }
});

export default router;