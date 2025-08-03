"use strict";
// 📄 src/lib/saveSalesforceToken.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSalesforceToken = void 0;
const cosmosClient_1 = require("@/lib/cosmosClient");
const encryption_1 = require("@/utils/encryption");
async function saveSalesforceToken(userId, token) {
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const expiresInNum = typeof token.expires_in === "string"
        ? parseInt(token.expires_in, 10)
        : typeof token.expires_in === "number"
            ? token.expires_in
            : undefined;
    const expiresAtIso = typeof expiresInNum === "number"
        ? new Date(nowMs + expiresInNum * 1000).toISOString()
        : undefined;
    const encryptedToken = {
        access_token: (0, encryption_1.encrypt)(token.access_token),
        refresh_token: (0, encryption_1.encrypt)(token.refresh_token),
        instance_url: token.instance_url,
        token_type: token.token_type,
        scope: token.scope,
        expires_in: expiresInNum,
        issued_at: nowIso,
        expires_at: expiresAtIso,
    };
    const container = cosmosClient_1.containers.users; // ✅ utilise le container "users"
    let userDoc = null;
    try {
        const readRes = await container.item(userId, userId).read();
        userDoc = readRes.resource;
    }
    catch {
        // Pas de document existant
    }
    const doc = {
        id: userId,
        userId,
        salesforceId: token.id ?? userDoc?.salesforceId,
        salesforceToken: encryptedToken,
        salesforceLoginAt: nowIso,
        updatedAt: nowIso,
        createdAt: userDoc?.createdAt || nowIso,
        ...userDoc,
    };
    await container.items.upsert(doc);
    console.log("✅ Token Salesforce enregistré pour :", userId);
}
exports.saveSalesforceToken = saveSalesforceToken;
