"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSalesforceToken = void 0;
// 📄 src/lib/refreshSalesforceToken.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
const getSalesforceToken_1 = require("@/lib/getSalesforceToken");
const saveSalesforceToken_1 = require("@/lib/saveSalesforceToken");
const encryption_1 = require("@/utils/encryption");
const TOKEN_URL = `${process.env.SF_LOGIN_URL}/services/oauth2/token`;
async function refreshSalesforceToken(userId) {
    const current = await (0, getSalesforceToken_1.getSalesforceToken)(userId);
    const decryptedRefreshToken = (0, encryption_1.decrypt)(current.refresh_token);
    const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.SF_CLIENT_ID,
        client_secret: process.env.SF_CLIENT_SECRET,
        refresh_token: decryptedRefreshToken,
    });
    const resp = await (0, node_fetch_1.default)(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });
    if (!resp.ok) {
        const err = await resp.text();
        console.error("❌ Erreur lors du refresh du token:", err);
        throw new Error("Erreur lors du refresh du token");
    }
    const data = await resp.json();
    await (0, saveSalesforceToken_1.saveSalesforceToken)(userId, {
        access_token: data.access_token,
        refresh_token: current.refresh_token,
        instance_url: data.instance_url,
        token_type: data.token_type,
        scope: data.scope,
        expires_in: data.expires_in,
        issued_at: Date.now(),
        id: current.id,
    });
    console.log(`🔄 refreshSalesforceToken: nouveau token enregistré pour ${userId}`);
    return data.access_token;
}
exports.refreshSalesforceToken = refreshSalesforceToken;
