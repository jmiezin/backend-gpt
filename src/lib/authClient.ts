// 📄 src/lib/authClient.ts

import { DefaultAzureCredential, AccessToken } from "@azure/identity";

/**
 * getAzureAccessToken
 *   - Renvoie un objet de la forme { token: string }
 *     en utilisant DefaultAzureCredential pour Azure AD.
 */
export async function getAzureAccessToken(): Promise<{ token: string } | null> {
  // Le scope pour Azure OpenAI est toujours "https://cognitiveservices.azure.com/.default"
  const credential = new DefaultAzureCredential();
  const accessToken: AccessToken | null = await credential.getToken(
    "https://cognitiveservices.azure.com/.default"
  );
  if (!accessToken) return null;
  return { token: accessToken.token };
}