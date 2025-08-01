// 📄 src/utils/encryption.ts
import crypto from "crypto";

const CIPHER_KEY = process.env.CIPHER_KEY!;
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

if (!CIPHER_KEY || CIPHER_KEY.length !== 64) {
  throw new Error("❌ Clé de chiffrement invalide ou manquante (64 caractères hex attendus).");
}

const key = Buffer.from(CIPHER_KEY, "hex");

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}