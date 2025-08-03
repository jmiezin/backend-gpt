"use strict";
// 📄 src/middleware/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = exports.getEffectiveUserId = exports.validateAccessToken = void 0;
require("../config/env");
const express_jwt_1 = __importDefault(require("express-jwt"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
// Chargement des variables d'environnement
const tenantId = process.env.AZURE_TENANT_ID;
const audience = process.env.AZURE_EXPECTED_AUDIENCE || "api://isonic.fr/gpt-backend";
const issuer = `https://sts.windows.net/${tenantId}/`;
const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
// ✅ Middleware principal : vérifie l'accès via JWT
function validateAccessToken(requiredScope) {
    const checkJwt = (0, express_jwt_1.default)({
        secret: jwks_rsa_1.default.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri,
        }),
        audience,
        issuer,
        algorithms: ["RS256"],
        requestProperty: "auth", // injecte dans req.auth
    });
    return (req, res, next) => {
        checkJwt(req, res, (err) => {
            if (err) {
                return res.status(401).json({ error: "Token invalide", details: err.message });
            }
            const decoded = req.auth;
            if (!decoded) {
                return res.status(401).json({ error: "Token manquant ou invalide" });
            }
            // Ajoute .userId si absent
            if (!decoded.userId && decoded.oid) {
                decoded.userId = decoded.oid;
            }
            // Parse propre des scopes
            const scopes = typeof decoded.scp === "string"
                ? decoded.scp.split(" ")
                : Array.isArray(decoded.scp)
                    ? decoded.scp
                    : [];
            console.log("🔐 Scopes du token :", scopes);
            if (requiredScope && !scopes.includes(requiredScope)) {
                return res.status(403).json({ error: `Scope manquant : ${requiredScope}` });
            }
            // Réinjecte dans req.auth
            req.auth = decoded;
            next();
        });
    };
}
exports.validateAccessToken = validateAccessToken;
// ✅ Fonction utilitaire : récupère l'utilisateur effectif (surcharge admin)
function getEffectiveUserId(req) {
    const sub = req.auth?.sub;
    const roles = req.auth?.roles || [];
    if (!sub) {
        throw new Error("❌ JWT invalide : aucun identifiant utilisateur trouvé.");
    }
    const isAdmin = roles.includes("admin");
    const override = req.query.asUser;
    if (isAdmin && typeof override === "string" && override.trim() !== "") {
        console.log(`👤 Admin ${sub} utilise ?asUser=${override}`);
        return override.trim();
    }
    return sub;
}
exports.getEffectiveUserId = getEffectiveUserId;
// ✅ Fonction utilitaire : vérifie si l'utilisateur a un rôle donné
function hasRole(req, role) {
    const roles = req.auth?.roles || [];
    return roles.includes(role);
}
exports.hasRole = hasRole;
