import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";

const router = Router();
const PROJECT_ROOT = path.resolve(__dirname, "../.."); // Deux niveaux au-dessus

router.get("/", (_req: Request, res: Response) => {
  const depth = 3;
  const result: Record<string, string[]> = {};

  function scan(dir: string, currentDepth = 0) {
    if (currentDepth > depth) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(PROJECT_ROOT, fullPath);
      if (!result[currentDepth]) result[currentDepth] = [];
      result[currentDepth].push(relPath);
      if (entry.isDirectory()) scan(fullPath, currentDepth + 1);
    });
  }

  scan(PROJECT_ROOT);
  res.json({ structure: result });
});

export default router;
