// 📄 src/lib/refreshSalesforceToken.ts
import fetch from "node-fetch";
import { getSalesforceToken } from "@/lib/getSalesforceToken";
import { saveSalesforceToken } from "@/lib/saveSalesforceToken";
import { decrypt } from "@/utils/encryption";

const TOKEN_URL = `${process.env.SF_LOGIN_URL}/services/oauth2/token`;

export async function refreshSalesforceToken(userId: string) {
  const current = await getSalesforceToken(userId);
  const decryptedRefreshToken = decrypt(current.refresh_token);

  const params = new URLSearchParams({
    grant_type:    "refresh_token",
    client_id:     process.env.SF_CLIENT_ID!,
    client_secret: process.env.SF_CLIENT_SECRET!,
    refresh_token: decryptedRefreshToken,
  });

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    params,
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error("❌ Erreur lors du refresh du token:", err);
    throw new Error("Erreur lors du refresh du token");
  }

  const data = await resp.json();

  await saveSalesforceToken(userId, {
    access_token:  data.access_token,
    refresh_token: current.refresh_token, // toujours stocké chiffré
    instance_url:  data.instance_url,
    token_type:    data.token_type,
    scope:         data.scope,
    expires_in:    data.expires_in,
    issued_at:     Date.now(),
    id:            current.id,
  });

  console.log(`🔄 refreshSalesforceToken: nouveau token enregistré pour ${userId}`);
  return data.access_token;
}