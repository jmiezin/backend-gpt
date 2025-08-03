"use strict";
// 📄 src/lib/upsertUser.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertUser = void 0;
const cosmosClient_1 = require("@/lib/cosmosClient");
const container = cosmosClient_1.containers.users;
async function upsertUser(azureUserId, data) {
    const now = new Date().toISOString();
    let existing = null;
    try {
        const readRes = await container.item(azureUserId, azureUserId).read();
        existing = readRes.resource;
    }
    catch {
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
exports.upsertUser = upsertUser;
