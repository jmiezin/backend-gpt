/**
 * RAG Bulk Loading Script
 * Reads all .txt files from ./docs directory and inserts them into the RAG system
 */

import fs from 'fs';
import path from 'path';
import { embed } from '../lib/embeddings';
import { ensureCollection, upsert } from '../lib/qdrant';
import { chunkText } from '../lib/chunker';

/**
 * Get all .txt files from a directory recursively
 * @param dirPath - Directory path to scan
 * @returns Array of file paths
 */
function getTxtFiles(dirPath: string): string[] {
  const txtFiles: string[] = [];
  
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory ${dirPath} does not exist.`);
    return txtFiles;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      txtFiles.push(...getTxtFiles(fullPath));
    } else if (stat.isFile() && path.extname(fullPath).toLowerCase() === '.txt') {
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
function processFile(filePath: string): {
  chunks: string[];
  payloads: Array<{ text: string; chunkIndex: number; source: string }>;
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const chunks = chunkText(content, { size: 500, overlap: 50 });
  
  const payloads = chunks.map((chunk, index) => ({
    text: chunk,
    chunkIndex: index,
    source: path.relative(process.cwd(), filePath),
  }));
  
  return { chunks, payloads };
}

/**
 * Main bulk loading function
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting RAG bulk loading...');
    
    // Ensure collection exists
    console.log('📊 Ensuring Qdrant collection exists...');
    await ensureCollection('rag_docs', 1536, 'Cosine');
    
    // Get all .txt files from docs directory
    const docsDir = path.join(process.cwd(), 'docs');
    console.log(`📁 Scanning for .txt files in: ${docsDir}`);
    const txtFiles = getTxtFiles(docsDir);
    
    if (txtFiles.length === 0) {
      console.log('⚠️  No .txt files found in ./docs directory.');
      console.log('   Create some .txt files in ./docs to bulk load them.');
      return;
    }
    
    console.log(`📄 Found ${txtFiles.length} .txt files:`);
    txtFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${path.relative(process.cwd(), file)}`);
    });
    
    // Process all files
    let totalChunks = 0;
    const allChunks: string[] = [];
    const allPayloads: Array<{ text: string; chunkIndex: number; source: string }> = [];
    
    for (const filePath of txtFiles) {
      console.log(`\n📝 Processing: ${path.relative(process.cwd(), filePath)}`);
      
      try {
        const { chunks, payloads } = processFile(filePath);
        allChunks.push(...chunks);
        allPayloads.push(...payloads);
        totalChunks += chunks.length;
        
        console.log(`   ✅ Chunked into ${chunks.length} pieces`);
      } catch (error) {
        console.error(`   ❌ Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        continue;
      }
    }
    
    if (allChunks.length === 0) {
      console.log('⚠️  No chunks to process.');
      return;
    }
    
    console.log(`\n🔄 Generating embeddings for ${allChunks.length} chunks...`);
    const embeddings = await embed(allChunks);
    
    console.log('💾 Inserting into Qdrant...');
    const inserted = await upsert('rag_docs', embeddings, allPayloads);
    
    console.log(`\n✅ Bulk loading completed successfully!`);
    console.log(`   📊 Total files processed: ${txtFiles.length}`);
    console.log(`   📦 Total chunks created: ${totalChunks}`);
    console.log(`   💾 Total chunks inserted: ${inserted}`);
    
  } catch (error) {
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