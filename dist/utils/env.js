"use strict";
// 📄 src/utils/env.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVar = void 0;
function getEnvVar(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`[env] La variable ${key} est manquante dans le .env`);
    }
    return value;
}
exports.getEnvVar = getEnvVar;
