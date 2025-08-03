"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containers = void 0;
// src/lib/cosmosClient.ts
const cosmos_1 = require("@azure/cosmos");
require("../config/env");
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DB_NAME;
if (!endpoint || !key || !databaseId) {
    throw new Error("❌ Variables d'environnement Cosmos DB manquantes.");
}
const client = new cosmos_1.CosmosClient({ endpoint, key });
const database = client.database(databaseId);
exports.containers = {
    assistants: database.container("assistants"),
    messages: database.container("messages"),
    projects: database.container("projects"),
    users: database.container("users"),
    conversations: database.container("conversations"),
    memory: database.container("memory"),
};
