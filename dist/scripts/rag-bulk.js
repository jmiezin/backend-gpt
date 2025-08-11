"use strict";
/**
 * RAG Bulk Loading Script
 * Reads all .txt files from ./docs directory and inserts them into the RAG system
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const embeddings_1 = require("../lib/embeddings");
const qdrant_1 = require("../lib/qdrant");
const chunker_1 = require("../lib/chunker");
/**
 * Get all .txt files from a directory recursively
 * @param dirPath - Directory path to scan
 * @returns Array of file paths
 */
function getTxtFiles(dirPath) {
    const txtFiles = [];
    if (!fs_1.default.existsSync(dirPath)) {
        console.warn(`Directory ${dirPath} does not exist.`);
        return txtFiles;
    }
    const items = fs_1.default.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path_1.default.join(dirPath, item);
        const stat = fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            // Recursively scan subdirectories
            txtFiles.push(...getTxtFiles(fullPath));
        }
        else if (stat.isFile() && path_1.default.extname(fullPath).toLowerCase() === '.txt') {
            txtFiles.push(fullPath);
        }
    }
    return txtFiles;
}
/**
 * Process a single file and return chunks with metadata
 * @param filePath - Path to the file
 * @returns Object containing chunks and payloads
 */
function processFile(filePath) {
    const content = fs_1.default.readFileSync(filePath, 'utf-8');
    const chunks = (0, chunker_1.chunkText)(content, { size: 500, overlap: 50 });
    const payloads = chunks.map((chunk, index) => ({
        text: chunk,
        chunkIndex: index,
        source: path_1.default.relative(process.cwd(), filePath),
    }));
    return { chunks, payloads };
}
/**
 * Main bulk loading function
 */
async function main() {
    try {
        console.log('🚀 Starting RAG bulk loading...');
        // Ensure collection exists
        console.log('📊 Ensuring Qdrant collection exists...');
        await (0, qdrant_1.ensureCollection)('rag_docs', 1536, 'Cosine');
        // Get all .txt files from docs directory
        const docsDir = path_1.default.join(process.cwd(), 'docs');
        console.log(`📁 Scanning for .txt files in: ${docsDir}`);
        const txtFiles = getTxtFiles(docsDir);
        if (txtFiles.length === 0) {
            console.log('⚠️  No .txt files found in ./docs directory.');
            console.log('   Create some .txt files in ./docs to bulk load them.');
            return;
        }
        console.log(`📄 Found ${txtFiles.length} .txt files:`);
        txtFiles.forEach((file, index) => {
            console.log(`   ${index + 1}. ${path_1.default.relative(process.cwd(), file)}`);
        });
        // Process all files
        let totalChunks = 0;
        const allChunks = [];
        const allPayloads = [];
        for (const filePath of txtFiles) {
            console.log(`\n📝 Processing: ${path_1.default.relative(process.cwd(), filePath)}`);
            try {
                const { chunks, payloads } = processFile(filePath);
                allChunks.push(...chunks);
                allPayloads.push(...payloads);
                totalChunks += chunks.length;
                console.log(`   ✅ Chunked into ${chunks.length} pieces`);
            }
            catch (error) {
                console.error(`   ❌ Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                continue;
            }
        }
        if (allChunks.length === 0) {
            console.log('⚠️  No chunks to process.');
            return;
        }
        console.log(`\n🔄 Generating embeddings for ${allChunks.length} chunks...`);
        const embeddings = await (0, embeddings_1.embed)(allChunks);
        console.log('💾 Inserting into Qdrant...');
        const inserted = await (0, qdrant_1.upsert)('rag_docs', embeddings, allPayloads);
        console.log(`\n✅ Bulk loading completed successfully!`);
        console.log(`   📊 Total files processed: ${txtFiles.length}`);
        console.log(`   📦 Total chunks created: ${totalChunks}`);
        console.log(`   💾 Total chunks inserted: ${inserted}`);
    }
    catch (error) {
        console.error('\n❌ Bulk loading failed:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}
// Run the script if called directly
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
