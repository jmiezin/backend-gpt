//src/routes/copilote/openaiRoutes.ts
import express from "express";
const router = express.Router();
// TODO: Implémenter openaiWrapper Copilot
router.get("/models", (req, res) => {
  res.json({ message: "openaiRoutes stub" });
});
export default router;
