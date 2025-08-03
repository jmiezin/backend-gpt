"use strict";
// 📄 src/lib/authClient.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAzureAccessToken = void 0;
const identity_1 = require("@azure/identity");
/**
 * getAzureAccessToken
 *   - Renvoie un objet de la forme { token: string }
 *     en utilisant DefaultAzureCredential pour Azure AD.
 */
async function getAzureAccessToken() {
    // Le scope pour Azure OpenAI est toujours "https://cognitiveservices.azure.com/.default"
    const credential = new identity_1.DefaultAzureCredential();
    const accessToken = await credential.getToken("https://cognitiveservices.azure.com/.default");
    if (!accessToken)
        return null;
    return { token: accessToken.token };
}
exports.getAzureAccessToken = getAzureAccessToken;
