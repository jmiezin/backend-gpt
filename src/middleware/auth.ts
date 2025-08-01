// 📄 src/middleware/auth.ts

import "../config/env";
import { Request, Response, NextFunction } from "express";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";

// Chargement des variables d'environnement
const tenantId = process.env.AZURE_TENANT_ID!;
const audience = process.env.AZURE_EXPECTED_AUDIENCE || "api://isonic.fr/gpt-backend";
const issuer = `https://sts.windows.net/${tenantId}/`;
const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;

// ✅ Middleware principal : vérifie l'accès via JWT
export function validateAccessToken(requiredScope?: string) {
  const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
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

  return (req: Request, res: Response, next: NextFunction) => {
    checkJwt(req, res, (err: any) => {
      if (err) {
        return res.status(401).json({ error: "Token invalide", details: err.message });
      }

      const decoded = (req as any).auth;
      if (!decoded) {
        return res.status(401).json({ error: "Token manquant ou invalide" });
      }

      // Ajoute .userId si absent
      if (!decoded.userId && decoded.oid) {
        decoded.userId = decoded.oid;
      }

      // Parse propre des scopes
      const scopes: string[] =
        typeof decoded.scp === "string"
          ? decoded.scp.split(" ")
          : Array.isArray(decoded.scp)
          ? decoded.scp
          : [];

      console.log("🔐 Scopes du token :", scopes);

      if (requiredScope && !scopes.includes(requiredScope)) {
        return res.status(403).json({ error: `Scope manquant : ${requiredScope}` });
      }

      // Réinjecte dans req.auth
      (req as any).auth = decoded;
      next();
    });
  };
}

// ✅ Fonction utilitaire : récupère l'utilisateur effectif (surcharge admin)
export function getEffectiveUserId(req: Request): string {
  const sub = (req as any).auth?.sub;
  const roles: string[] = (req as any).auth?.roles || [];

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

// ✅ Fonction utilitaire : vérifie si l'utilisateur a un rôle donné
export function hasRole(req: Request, role: string): boolean {
  const roles: string[] = (req as any).auth?.roles || [];
  return roles.includes(role);
}