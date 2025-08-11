"use strict";
/**
 * Simple text chunker that splits text into chunks with overlap
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkText = void 0;
/**
 * Splits text into chunks of specified size with overlap
 * @param text - The text to chunk
 * @param options - Chunking options
 * @returns Array of text chunks
 */
function chunkText(text, options = {}) {
    const { size = 500, overlap = 50 } = options;
    if (!text || text.length === 0) {
        return [];
    }
    if (text.length <= size) {
        return [text];
    }
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + size, text.length);
        const chunk = text.slice(start, end);
        chunks.push(chunk);
        // If we've reached the end, break
        if (end === text.length) {
            break;
        }
        // Move start position, accounting for overlap
        start = end - overlap;
        // Ensure we don't go backwards
        if (start < 0) {
            start = 0;
        }
    }
    return chunks;
}
exports.chunkText = chunkText;
