"use strict";
// src/routes/apikey.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * Route protégée : retourne la clé API configurée dans .env.
 * Comme ce router est monté sous "/apikey", on définit ici `router.get('/')`,
 * ce qui donne au final "GET /apikey".
 */
router.get("/", (0, auth_1.validateAccessToken)("access_as_user"), (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});
exports.default = router;
