// 📄 backend/lib/verifierStore.ts

type PKCEEntry = {
  verifier: string;
  createdAt: number;
};

// 🧠 Stock en mémoire des verifiers PKCE
const verifierStore = new Map<string, PKCEEntry>();

/**
 * 🔁 Nettoyage automatique toutes les minutes
 * Supprime les entries de plus de 10 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, entry] of verifierStore) {
    if (now - entry.createdAt > 10 * 60 * 1000) {
      console.log(`🗑️ Expiration PKCE pour session ${sessionId}`);
      verifierStore.delete(sessionId);
    }
  }
}, 60 * 1000);

/**
 * 📥 Enregistre un code_verifier en mémoire
 * @param sessionId - identifiant unique de session
 * @param verifier - code_verifier PKCE
 */
export function storeVerifier(sessionId: string, verifier: string): void {
  verifierStore.set(sessionId, {
    verifier,
    createdAt: Date.now(),
  });
}

/**
 * 📤 Récupère un code_verifier associé à une session (et le supprime)
 * @param sessionId - identifiant unique de session
 * @returns le code_verifier ou null s’il n’existe pas
 */
export function consumeVerifier(sessionId: string): string | null {
  const entry = verifierStore.get(sessionId);
  if (!entry) return null;
  verifierStore.delete(sessionId);
  return entry.verifier;
}