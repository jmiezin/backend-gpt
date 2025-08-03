"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
// 📄 src/utils/encryption.ts
const crypto_1 = __importDefault(require("crypto"));
const CIPHER_KEY = process.env.CIPHER_KEY;
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
if (!CIPHER_KEY || CIPHER_KEY.length !== 64) {
    throw new Error("❌ Clé de chiffrement invalide ou manquante (64 caractères hex attendus).");
}
const key = Buffer.from(CIPHER_KEY, "hex");
function encrypt(text) {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}
exports.encrypt = encrypt;
function decrypt(encryptedText) {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
}
exports.decrypt = decrypt;
