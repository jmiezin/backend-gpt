// 📄 src/config/env.ts

import dotenv from 'dotenv';
dotenv.config();

// ✅ Logs pour vérifier les variables Azure OpenAI
console.log("[ENV] Chargement des variables d’environnement Azure OpenAI :");
console.log("AZURE_TENANT_ID =", process.env.AZURE_TENANT_ID);
console.log("AZURE_OPENAI_ENDPOINT =", process.env.AZURE_OPENAI_ENDPOINT);
console.log("AZURE_OPENAI_DEPLOYMENT =", process.env.AZURE_OPENAI_DEPLOYMENT);
console.log("AZURE_OPENAI_API_VERSION =", process.env.AZURE_OPENAI_API_VERSION);

// ----------------------------------------------------------------------------
// 🚫 Vérifie si les deux modes d'auth (clé API + Azure AD) sont fournis
// ----------------------------------------------------------------------------
// if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_TENANT_ID) {
//   console.error(
//     "[❌ ERREUR] Les deux modes d'authentification sont définis (clé API + Azure AD). Utilisez-en un seul."
//   );
//   process.exit(1);
// }

// ⚠️ Alerte si aucune méthode d’auth définie
if (!process.env.AZURE_TENANT_ID && !process.env.AZURE_OPENAI_API_KEY) {
  console.warn(
    "[⚠️ WARNING] Aucune méthode d’authentification définie pour Azure OpenAI (ni AZURE_TENANT_ID, ni AZURE_OPENAI_API_KEY)."
  );
}

export function getEnvVar(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`❌ La variable d’environnement ${name} est manquante ou vide.`);
  }
  return v;
}