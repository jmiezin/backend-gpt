"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/copilot/chatRoutes.ts
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
/**
 * 1) On ajoute un GET "/" pour que GET /copilot/chat ne renvoie plus 404.
 *    Ça nous permet de tester la route via "GET /copilot/chat" dans l’interface.
 */
router.get("/", (req, res) => {
    return res.json({ message: "chatRoutes GET stub" });
});
/**
 * 2) On garde aussi le POST "/" existant si besoin :
 */
router.post("/", (req, res) => {
    return res.json({ message: "chatRoutes POST stub" });
});
exports.default = router;
