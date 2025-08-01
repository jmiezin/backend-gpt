//src/utils/getUserId.ts
import { Request } from "express";

export function getUserId(req: Request): string {
  const auth = (req as any).auth;
  if (!auth || (!auth.userId && !auth.oid)) {
    throw new Error("Non autorisé : userId manquant dans le token");
  }
  return auth.userId || auth.oid;
}