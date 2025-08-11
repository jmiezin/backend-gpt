/**
 * Qdrant client utilities for vector database operations
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';

export interface SearchResult {
  id: string;
  score: number;
  text: string;
  chunkIndex?: number;
  source?: string;
}

export interface UpsertPayload {
  text: string;
  chunkIndex: number;
  source?: string;
  [key: string]: unknown;
}

let qdrantClient: QdrantClient | null = null;

/**
 * Get or create Qdrant client instance
 */
function getQdrantClient(): QdrantClient {
  if (qdrantClient) {
    return qdrantClient;
  }

  const url = process.env.QDRANT_URL || 'http://localhost:6333';
  const apiKey = process.env.QDRANT_API_KEY;

  qdrantClient = new QdrantClient({
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
export async function ensureCollection(
  collectionName: string = 'rag_docs',
  vectorSize: number = 1536,
  distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine'
): Promise<void> {
  try {
    const client = getQdrantClient();
    
    // Check if collection exists
    const collections = await client.getCollections();
    const collectionExists = collections.collections.some(
      (collection: any) => collection.name === collectionName
    );
    
    if (!collectionExists) {
      console.log(`Creating collection '${collectionName}'...`);
      await client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance,
        },
      });
      console.log(`Collection '${collectionName}' created successfully.`);
    } else {
      console.log(`Collection '${collectionName}' already exists.`);
    }
  } catch (error) {
    console.error('Error ensuring collection:', error);
    throw new Error(`Failed to ensure collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if collection exists
 * @param collectionName - Name of the collection
 * @returns Promise resolving to boolean
 */
export async function collectionExists(collectionName: string = 'rag_docs'): Promise<boolean> {
  try {
    const client = getQdrantClient();
    const collections = await client.getCollections();
    return collections.collections.some(
      (collection: any) => collection.name === collectionName
    );
  } catch (error) {
    console.error('Error checking collection existence:', error);
    return false;
  }
}

/**
 * Upsert vectors into Qdrant collection
 * @param collectionName - Name of the collection
 * @param vectors - Array of embedding vectors
 * @param payloads - Array of payload objects
 * @returns Promise resolving to number of inserted points
 */
export async function upsert(
  collectionName: string,
  vectors: number[][],
  payloads: UpsertPayload[]
): Promise<number> {
  try {
    const client = getQdrantClient();
    
    if (vectors.length !== payloads.length) {
      throw new Error('Vectors and payloads arrays must have the same length');
    }
    
    const points = vectors.map((vector, index) => ({
      id: uuidv4(),
      vector,
      payload: payloads[index],
    }));
    
    await client.upsert(collectionName, {
      wait: true,
      points,
    });
    
    return points.length;
  } catch (error) {
    console.error('Error upserting vectors:', error);
    throw new Error(`Failed to upsert vectors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for similar vectors in Qdrant collection
 * @param collectionName - Name of the collection
 * @param queryVector - Query embedding vector
 * @param topK - Number of results to return (default: 5)
 * @returns Promise resolving to search results
 */
export async function search(
  collectionName: string,
  queryVector: number[],
  topK: number = 5
): Promise<SearchResult[]> {
  try {
    const client = getQdrantClient();
    
    const response = await client.search(collectionName, {
      vector: queryVector,
      limit: topK,
      with_payload: true,
    });
    
    return response.map((result: any) => ({
      id: result.id.toString(),
      score: result.score,
      text: (result.payload as any)?.text || '',
      chunkIndex: (result.payload as any)?.chunkIndex,
      source: (result.payload as any)?.source,
    }));
  } catch (error) {
    console.error('Error searching vectors:', error);
    throw new Error(`Failed to search vectors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}