"use strict";
/**
 * RAG (Retrieval-Augmented Generation) router
 * Provides endpoints for document indexing and semantic search
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRagRouter = void 0;
const express_1 = __importDefault(require("express"));
const embeddings_1 = require("../lib/embeddings");
const qdrant_1 = require("../lib/qdrant");
const chunker_1 = require("../lib/chunker");
const router = express_1.default.Router();
/**
 * Health check endpoint
 * GET /rag/health
 * Returns { ok: true, qdrant: true } if collection 'rag_docs' exists
 */
router.get('/health', async (req, res) => {
    try {
        const qdrantStatus = await (0, qdrant_1.collectionExists)('rag_docs');
        res.json({
            ok: true,
            qdrant: qdrantStatus,
        });
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            ok: false,
            qdrant: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * Insert documents endpoint
 * POST /rag/insert
 * Body: { text: string } | { items: { text: string }[] }
 */
router.post('/insert', async (req, res) => {
    try {
        const { text, items } = req.body;
        // Validate input
        if (!text && !items) {
            return res.status(400).json({
                error: 'Request body must contain either "text" or "items" field',
            });
        }
        // Normalize input to array of texts
        let texts = [];
        if (text) {
            texts = [text];
        }
        else if (items && Array.isArray(items)) {
            texts = items.map((item) => {
                if (typeof item.text === 'string') {
                    return item.text;
                }
                throw new Error('Each item must have a "text" field of type string');
            });
        }
        else {
            return res.status(400).json({
                error: 'Invalid input format. Expected { text: string } or { items: { text: string }[] }',
            });
        }
        // Ensure collection exists
        await (0, qdrant_1.ensureCollection)('rag_docs', 1536, 'Cosine');
        // Process each text: chunk, embed, and collect for batch insert
        const allChunks = [];
        const allPayloads = [];
        let totalChunks = 0;
        for (let textIndex = 0; textIndex < texts.length; textIndex++) {
            const currentText = texts[textIndex];
            // Chunk the text
            const chunks = (0, chunker_1.chunkText)(currentText, { size: 500, overlap: 50 });
            // Prepare chunks and payloads
            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                allChunks.push(chunks[chunkIndex]);
                allPayloads.push({
                    text: chunks[chunkIndex],
                    chunkIndex,
                    source: 'api',
                });
            }
            totalChunks += chunks.length;
        }
        // Generate embeddings for all chunks
        const embeddings = await (0, embeddings_1.embed)(allChunks);
        // Insert into Qdrant
        const inserted = await (0, qdrant_1.upsert)('rag_docs', embeddings, allPayloads);
        res.json({
            inserted,
            chunks: totalChunks,
        });
    }
    catch (error) {
        console.error('Insert error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * Search endpoint
 * POST /rag/search
 * Body: { query: string, topK?: number }
 */
router.post('/search', async (req, res) => {
    try {
        const { query, topK = 5 } = req.body;
        // Validate input
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: 'Query must be a non-empty string',
            });
        }
        if (topK && (typeof topK !== 'number' || topK <= 0)) {
            return res.status(400).json({
                error: 'topK must be a positive number',
            });
        }
        // Check if collection exists
        const exists = await (0, qdrant_1.collectionExists)('rag_docs');
        if (!exists) {
            return res.status(404).json({
                error: 'Collection "rag_docs" does not exist. Please insert some documents first.',
            });
        }
        // Generate embedding for the query
        const queryEmbedding = await (0, embeddings_1.embedSingle)(query);
        // Search in Qdrant
        const searchResults = await (0, qdrant_1.search)('rag_docs', queryEmbedding, topK);
        // Format results
        const results = searchResults.map((result) => ({
            score: result.score,
            text: result.text,
            id: result.id,
        }));
        res.json({
            results,
        });
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * Create and configure RAG router
 * @returns Express router instance
 */
function createRagRouter() {
    return router;
}
exports.createRagRouter = createRagRouter;
exports.default = router;
