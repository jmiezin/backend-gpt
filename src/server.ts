// 📄 backend-universel/src/server.ts
import "./config/env";               // charge .env dans process.env
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// → ton middleware d’auth
import { validateAccessToken } from "./middleware/auth";

// ① Route OAuth PKCE callback (publique)
import authRoutes from "./routes/authRoutes";

// ② Tes routes “export default” (business)
import assistantsRoutes from "./routes/assistants";
import conversationsRoutes from "./routes/conversations";
import memoryRoutes from "./routes/memory";
import messagesRoutes from "./routes/messages";
import projectsRoutes from "./routes/projects";
import usersRoutes from "./routes/users";
import ngrokRoutes from "./routes/ngrokRoutes";

// ③ Azure/OpenAI + permissions (business protégées)
import openaiRoutes from "./routes/openaiRoutes";
import scanRoutes from "./routes/scanRoutes";
import permissionsRoutes from "./routes/permissionsRoutes";
import structureRoutes from "./routes/structureRoutes";

const PORT = Number(process.env.PORT) || 3010;
const app = express();

// --- Middlewares globaux ---
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --- 0️⃣ Route de santé publique (pas de token requis) ---
app.get("/ping", (_req, res) => {
  res.send("pong");
});

// --- ① Auth PKCE callback (publiques) ---
app.use("/auth", authRoutes);

// --- ② Montage du middleware d’auth avant toutes les routes business ---
app.use(validateAccessToken());

// --- ③ Business routes protégées par validateAccessToken() ---
app.use("/assistants", assistantsRoutes);
app.use("/conversations", conversationsRoutes);
app.use("/memory", memoryRoutes);

// 🔧 attention : tu montes `/api/messages` pour éviter le conflit
app.use("/api/messages", messagesRoutes);

app.use("/projects", projectsRoutes);
app.use("/users", usersRoutes);
app.use("/ngrok", ngrokRoutes);

// --- ④ Azure/OpenAI & co (également protégées) ---
app.use("/openai", openaiRoutes);
app.use("/scan", scanRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/structure", structureRoutes);

// --- Gestion des erreurs 404 & 500 ---
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Démarrage du serveur ---
app.listen(PORT, () => {
  console.log(`[✅ SERVEUR] En écoute sur http://localhost:${PORT}`);
});
