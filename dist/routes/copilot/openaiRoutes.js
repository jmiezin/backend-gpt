"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//src/routes/copilote/openaiRoutes.ts
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// TODO: Implémenter openaiWrapper Copilot
router.get("/models", (req, res) => {
    res.json({ message: "openaiRoutes stub" });
});
exports.default = router;
