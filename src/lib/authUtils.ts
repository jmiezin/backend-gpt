//src/lib/authUtils.ts
import { Request } from "express";

export function getEffectiveUserId(req: Request): string {
  const isAdmin = (req as any).auth?.roles?.includes("admin");
  const sub = (req as any).auth?.sub;

  const override = req.query.asUser;
  if (isAdmin && typeof override === "string" && override.trim() !== "") {
    return override.trim();
  }

  return sub;
}