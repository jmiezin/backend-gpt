// 📄 src/utils/env.ts

export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[env] La variable ${key} est manquante dans le .env`);
  }
  return value;
}