//src/routes/copilote/authRoutes.ts
import express from "express";
const router = express.Router();
// TODO: Implémenter auth Copilot
router.get("/profile", (req, res) => {
  res.json({ message: "authRoutes stub" });
});
export default router;
