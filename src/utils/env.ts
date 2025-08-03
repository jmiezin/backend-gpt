// 📄 src/utils/env.ts

export function getEnvVar(key: string): string {
  const value = process.env[key];
  console.log(`[ENV] ${key} = ${value ?? '❌ NON DÉFINIE'}`);
  if (!value || value.trim() === '') {
    throw new Error(`❌ La variable d’environnement ${key} est manquante ou vide.`);
  }
  return value;
}