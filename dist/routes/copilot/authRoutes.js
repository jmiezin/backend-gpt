"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//src/routes/copilote/authRoutes.ts
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// TODO: Implémenter auth Copilot
router.get("/profile", (req, res) => {
    res.json({ message: "authRoutes stub" });
});
exports.default = router;
