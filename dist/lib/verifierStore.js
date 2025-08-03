"use strict";
// 📄 backend/lib/verifierStore.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeVerifier = exports.storeVerifier = void 0;
// 🧠 Stock en mémoire des verifiers PKCE
const verifierStore = new Map();
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
function storeVerifier(sessionId, verifier) {
    verifierStore.set(sessionId, {
        verifier,
        createdAt: Date.now(),
    });
}
exports.storeVerifier = storeVerifier;
/**
 * 📤 Récupère un code_verifier associé à une session (et le supprime)
 * @param sessionId - identifiant unique de session
 * @returns le code_verifier ou null s’il n’existe pas
 */
function consumeVerifier(sessionId) {
    const entry = verifierStore.get(sessionId);
    if (!entry)
        return null;
    verifierStore.delete(sessionId);
    return entry.verifier;
}
exports.consumeVerifier = consumeVerifier;
