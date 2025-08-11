"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📄 backend-universel/src/server.ts
require("./config/env"); // charge .env dans process.env
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// → ton middleware d’auth
const auth_1 = require("./middleware/auth");
// ① Route OAuth PKCE callback (publique)
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// ② Tes routes “export default” (business)
const assistants_1 = __importDefault(require("./routes/assistants"));
const conversations_1 = __importDefault(require("./routes/conversations"));
const memory_1 = __importDefault(require("./routes/memory"));
const messages_1 = __importDefault(require("./routes/messages"));
const projects_1 = __importDefault(require("./routes/projects"));
const users_1 = __importDefault(require("./routes/users"));
const ngrokRoutes_1 = __importDefault(require("./routes/ngrokRoutes"));
// ③ Azure/OpenAI + permissions (business protégées)
const openaiRoutes_1 = __importDefault(require("./routes/openaiRoutes"));
const scanRoutes_1 = __importDefault(require("./routes/scanRoutes"));
const permissionsRoutes_1 = __importDefault(require("./routes/permissionsRoutes"));
const structureRoutes_1 = __importDefault(require("./routes/structureRoutes"));
const rag_1 = __importDefault(require("./routes/rag"));
const PORT = Number(process.env.PORT) || 8080;
const app = (0, express_1.default)();
// --- Middlewares globaux ---
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// --- 0️⃣ Route de santé publique (pas de token requis) ---
app.get("/ping", (_req, res) => {
    res.send("pong");
});
// --- ① Auth PKCE callback (publiques) ---
app.use("/auth", authRoutes_1.default);
// --- ② Montage du middleware d’auth avant toutes les routes business ---
app.use((0, auth_1.validateAccessToken)());
// --- ③ Business routes protégées par validateAccessToken() ---
app.use("/assistants", assistants_1.default);
app.use("/conversations", conversations_1.default);
app.use("/memory", memory_1.default);
// 🔧 attention : tu montes `/api/messages` pour éviter le conflit
app.use("/api/messages", messages_1.default);
app.use("/projects", projects_1.default);
app.use("/users", users_1.default);
app.use("/ngrok", ngrokRoutes_1.default);
// --- ④ Azure/OpenAI & co (également protégées) ---
app.use("/openai", openaiRoutes_1.default);
app.use("/scan", scanRoutes_1.default);
app.use("/permissions", permissionsRoutes_1.default);
app.use("/structure", structureRoutes_1.default);
app.use("/rag", rag_1.default);
// --- Gestion des erreurs 404 & 500 ---
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
});
// --- Démarrage du serveur ---
app.listen(PORT, "0.0.0.0", () => {
    console.log(`[✅ SERVEUR] En écoute sur http://0.0.0.0:${PORT}`);
});
