"use strict";
// 📄 src/utils/env.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVar = void 0;
function getEnvVar(key) {
    const value = process.env[key];
    console.log(`[ENV] ${key} = ${value ?? '❌ NON DÉFINIE'}`);
    if (!value || value.trim() === '') {
        throw new Error(`❌ La variable d’environnement ${key} est manquante ou vide.`);
    }
    return value;
}
exports.getEnvVar = getEnvVar;
