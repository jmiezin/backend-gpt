// src/routes/salesforceRoutes.ts
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import { storeVerifier, consumeVerifier } from "../lib/verifierStore";
import { saveSalesforceToken } from "../lib/saveSalesforceToken";
import { upsertUser } from "../lib/upsertUser";

dotenv.config();

const {
  SF_CLIENT_ID,
  SF_CLIENT_SECRET,
  SF_LOGIN_URL,
  SF_REDIRECT_URI,
  SF_SCOPE,
} = process.env;

const salesforceRoutes = express.Router();

salesforceRoutes.use((req, _res, next) => {
  console.log(`[OAuth] ${req.method} ${req.originalUrl}`);
  next();
});

// GET /salesforce/launcher
salesforceRoutes.get("/launcher", (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).send("Missing sessionId");

  const verifier = crypto.randomUUID();
  storeVerifier(sessionId, verifier);
  const challenge = verifier;

  const authUrl = new URL(`${SF_LOGIN_URL}/services/oauth2/authorize`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", SF_CLIENT_ID!);
  authUrl.searchParams.set("redirect_uri", SF_REDIRECT_URI!);
  authUrl.searchParams.set("scope", SF_SCOPE!);
  authUrl.searchParams.set("state", sessionId);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "plain");

  return res.redirect(authUrl.toString());
});

// GET /salesforce/callback
salesforceRoutes.get("/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query as any;

  const sendScript = (json: any) => {
    const encoded = JSON.stringify(json);
    return res.send(`
      <script>
        window.opener.postMessage(${encoded}, "*");
        setTimeout(() => window.close(), 100);
      </script>
    `);
  };

  if (error) {
    console.error("[callback] OAuth error:", error, error_description);
    return sendScript({ success: false, error, description: error_description });
  }

  const sessionId = state;
  const verifier = consumeVerifier(sessionId);
  if (!verifier) {
    return sendScript({ success: false, error: "missing_verifier", state });
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: SF_CLIENT_ID!,
    client_secret: SF_CLIENT_SECRET!,
    redirect_uri: SF_REDIRECT_URI!,
    code_verifier: verifier,
  });

  try {
    const tokenRes = await axios.post(
      `${SF_LOGIN_URL}/services/oauth2/token`,
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    await upsertUser(sessionId, { salesforceId: tokenRes.data.id });
    await saveSalesforceToken(sessionId, tokenRes.data);
    return sendScript({ success: true, state: sessionId });

  } catch (e: any) {
    console.error("[callback] exchange failed", e.response?.data || e.message);
    return sendScript({ success: false, error: "exchange_failed", details: e.response?.data });
  }
});

export default salesforceRoutes;