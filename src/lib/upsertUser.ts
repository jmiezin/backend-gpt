// 📄 src/lib/upsertUser.ts

import { containers } from "@/lib/cosmosClient";

const container = containers.users;

export async function upsertUser(azureUserId: string, data: Partial<any>) {
  const now = new Date().toISOString();

  let existing = null;
  try {
    const readRes = await container.item(azureUserId, azureUserId).read();
    existing = readRes.resource;
  } catch {
    // no existing user
  }

  const userDoc = {
    id: azureUserId,
    userId: azureUserId,
    ...existing,
    ...data,
    updatedAt: now,
    createdAt: existing?.createdAt || now,
  };

  await container.items.upsert(userDoc);
  return userDoc;
}