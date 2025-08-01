// 📄 src/lib/saveSalesforceToken.ts

import { containers } from "@/lib/cosmosClient"; 
import { encrypt } from "@/utils/encryption";    

export interface RawTokenData {
  access_token:   string;
  refresh_token:  string;
  instance_url:   string;
  token_type:     string;
  scope:          string;
  expires_in?:    string | number;
  issued_at?:     string | number;
  id?:            string;
}

export async function saveSalesforceToken(userId: string, token: RawTokenData) {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  const expiresInNum =
    typeof token.expires_in === "string"
      ? parseInt(token.expires_in, 10)
      : typeof token.expires_in === "number"
      ? token.expires_in
      : undefined;

  const expiresAtIso =
    typeof expiresInNum === "number"
      ? new Date(nowMs + expiresInNum * 1000).toISOString()
      : undefined;

  const encryptedToken = {
    access_token:  encrypt(token.access_token),
    refresh_token: encrypt(token.refresh_token),
    instance_url:  token.instance_url,
    token_type:    token.token_type,
    scope:         token.scope,
    expires_in:    expiresInNum,
    issued_at:     nowIso,
    expires_at:    expiresAtIso,
  };

  const container = containers.users; // ✅ utilise le container "users"

  let userDoc: any = null;
  try {
    const readRes = await container.item(userId, userId).read();
    userDoc = readRes.resource;
  } catch {
    // Pas de document existant
  }

  const doc = {
    id:                userId,
    userId,
    salesforceId:      token.id ?? userDoc?.salesforceId,
    salesforceToken:   encryptedToken,
    salesforceLoginAt: nowIso,
    updatedAt:         nowIso,
    createdAt:         userDoc?.createdAt || nowIso,
    ...userDoc,
  };

  await container.items.upsert(doc);
  console.log("✅ Token Salesforce enregistré pour :", userId);
}