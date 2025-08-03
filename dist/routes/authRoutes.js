"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📄 src/routes/authRoutes.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // ⚠️ Assure que .env est chargé, utile si ce fichier est importé isolément
const express_1 = __importDefault(require("express"));
const msal_node_1 = require("@azure/msal-node");
const router = express_1.default.Router();
// 🔐 Vérification des variables critiques
const { AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID, BACKEND_API_SCOPES, BACKEND_REDIRECT_URI, FRONTEND_URI, } = process.env;
if (!AZURE_AD_CLIENT_ID || !AZURE_AD_CLIENT_SECRET || !AZURE_AD_TENANT_ID) {
    throw new Error("❌ Client ID, Tenant ID ou Client Secret manquant dans .env");
}
if (!BACKEND_API_SCOPES || !BACKEND_REDIRECT_URI || !FRONTEND_URI) {
    throw new Error("❌ BACKEND_API_SCOPES, BACKEND_REDIRECT_URI ou FRONTEND_URI manquant dans .env");
}
// ① Configuration MSAL pour le client confidentiel
const cca = new msal_node_1.ConfidentialClientApplication({
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
router.get("/callback", async (req, res) => {
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
        const tokenRequest = {
            code: code,
            scopes: JSON.parse(BACKEND_API_SCOPES),
            redirectUri: BACKEND_REDIRECT_URI,
            codeVerifier,
        };
        const tokenResponse = await cca.acquireTokenByCode(tokenRequest);
        res.cookie("access_token", tokenResponse.accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.redirect(FRONTEND_URI);
    }
    catch (err) {
        console.error("❌ Token exchange failed:", err);
        res.status(500).send("Token exchange failed");
    }
});
exports.default = router;
