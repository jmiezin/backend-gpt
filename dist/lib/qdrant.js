"use strict";
/**
 * Qdrant client utilities for vector database operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.upsert = exports.collectionExists = exports.ensureCollection = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const uuid_1 = require("uuid");
let qdrantClient = null;
/**
 * Get or create Qdrant client instance
 */
function getQdrantClient() {
    if (qdrantClient) {
        return qdrantClient;
    }
    const url = process.env.QDRANT_URL || 'http://localhost:6333';
    const apiKey = process.env.QDRANT_API_KEY;
    qdrantClient = new js_client_rest_1.QdrantClient({
        url,
        apiKey,
    });
    return qdrantClient;
}
/**
 * Ensure collection exists with correct configuration
 * @param collectionName - Name of the collection
 * @param vectorSize - Size of the vectors (default: 1536)
 * @param distance - Distance metric (default: 'Cosine')
 */
async function ensureCollection(collectionName = 'rag_docs', vectorSize = 1536, distance = 'Cosine') {
    try {
        const client = getQdrantClient();
        // Check if collection exists
        const collections = await client.getCollections();
        const collectionExists = collections.collections.some((collection) => collection.name === collectionName);
        if (!collectionExists) {
            console.log(`Creating collection '${collectionName}'...`);
            await client.createCollection(collectionName, {
                vectors: {
                    size: vectorSize,
                    distance,
                },
            });
            console.log(`Collection '${collectionName}' created successfully.`);
        }
        else {
            console.log(`Collection '${collectionName}' already exists.`);
        }
    }
    catch (error) {
        console.error('Error ensuring collection:', error);
        throw new Error(`Failed to ensure collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
exports.ensureCollection = ensureCollection;
/**
 * Check if collection exists
 * @param collectionName - Name of the collection
 * @returns Promise resolving to boolean
 */
async function collectionExists(collectionName = 'rag_docs') {
    try {
        const client = getQdrantClient();
        const collections = await client.getCollections();
        return collections.collections.some((collection) => collection.name === collectionName);
    }
    catch (error) {
        console.error('Error checking collection existence:', error);
        return false;
    }
}
exports.collectionExists = collectionExists;
/**
 * Upsert vectors into Qdrant collection
 * @param collectionName - Name of the collection
 * @param vectors - Array of embedding vectors
 * @param payloads - Array of payload objects
 * @returns Promise resolving to number of inserted points
 */
async function upsert(collectionName, vectors, payloads) {
    try {
        const client = getQdrantClient();
        if (vectors.length !== payloads.length) {
            throw new Error('Vectors and payloads arrays must have the same length');
        }
        const points = vectors.map((vector, index) => ({
            id: (0, uuid_1.v4)(),
            vector,
            payload: payloads[index],
        }));
        await client.upsert(collectionName, {
            wait: true,
            points,
        });
        return points.length;
    }
    catch (error) {
        console.error('Error upserting vectors:', error);
        throw new Error(`Failed to upsert vectors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
exports.upsert = upsert;
/**
 * Search for similar vectors in Qdrant collection
 * @param collectionName - Name of the collection
 * @param queryVector - Query embedding vector
 * @param topK - Number of results to return (default: 5)
 * @returns Promise resolving to search results
 */
async function search(collectionName, queryVector, topK = 5) {
    try {
        const client = getQdrantClient();
        const response = await client.search(collectionName, {
            vector: queryVector,
            limit: topK,
            with_payload: true,
        });
        return response.map((result) => ({
            id: result.id.toString(),
            score: result.score,
            text: result.payload?.text || '',
            chunkIndex: result.payload?.chunkIndex,
            source: result.payload?.source,
        }));
    }
    catch (error) {
        console.error('Error searching vectors:', error);
        throw new Error(`Failed to search vectors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
exports.search = search;
