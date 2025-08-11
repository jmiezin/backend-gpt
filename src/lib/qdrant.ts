/**
 * Module Qdrant - Client et helpers pour la collection RAG
 */

import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION_NAME = 'rag_docs';
const VECTOR_SIZE = 1536;
const DISTANCE = 'Cosine';

let qdrantClient: QdrantClient | null = null;

/**
 * Initialise et retourne le client Qdrant
 */
function getQdrantClient(): QdrantClient {
  if (!qdrantClient) {
    const url = process.env.QDRANT_URL || 'http://localhost:6333';
    const apiKey = process.env.QDRANT_API_KEY;

    qdrantClient = new QdrantClient({
      url,
      apiKey,
    });

    console.log(`[QDRANT] Client initialisé avec URL: ${url}`);
  }

  return qdrantClient;
}

/**
 * Vérifie si une collection existe
 * @param collectionName - Nom de la collection
 */
export async function collectionExists(collectionName: string = COLLECTION_NAME): Promise<boolean> {
  try {
    const client = getQdrantClient();
    const info = await client.getCollection(collectionName);
    return !!info;
  } catch (error) {
    return false;
  }
}

/**
 * Crée la collection si elle n'existe pas
 * @param collectionName - Nom de la collection
 */
export async function ensureCollection(collectionName: string = COLLECTION_NAME): Promise<void> {
  try {
    const client = getQdrantClient();
    const exists = await collectionExists(collectionName);
    
    if (!exists) {
      await client.createCollection(collectionName, {
        vectors: {
          size: VECTOR_SIZE,
          distance: DISTANCE as any,
        },
      });
      console.log(`[QDRANT] Collection '${collectionName}' créée`);
    } else {
      console.log(`[QDRANT] Collection '${collectionName}' existe déjà`);
    }
  } catch (error) {
    console.error(`[QDRANT] Erreur lors de la création de la collection '${collectionName}':`, error);
    throw new Error(`Échec de création de la collection: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Interface pour un point Qdrant
 */
export interface QdrantPoint {
  id: string | number;
  vector: number[];
  payload?: Record<string, any>;
}

/**
 * Interface pour les résultats de recherche
 */
export interface SearchResult {
  id: string | number;
  score: number;
  payload?: Record<string, any>;
}

/**
 * Insère des points dans la collection
 * @param points - Array de points à insérer
 * @param collectionName - Nom de la collection
 */
export async function upsert(points: QdrantPoint[], collectionName: string = COLLECTION_NAME): Promise<void> {
  try {
    const client = getQdrantClient();
    
    // S'assurer que la collection existe
    await ensureCollection(collectionName);
    
    // Préparer les points pour Qdrant
    const qdrantPoints = points.map(point => ({
      id: point.id,
      vector: point.vector,
      payload: point.payload || {},
    }));

    await client.upsert(collectionName, {
      wait: true,
      points: qdrantPoints,
    });

    console.log(`[QDRANT] ${points.length} points insérés dans '${collectionName}'`);
  } catch (error) {
    console.error(`[QDRANT] Erreur lors de l'insertion dans '${collectionName}':`, error);
    throw new Error(`Échec d'insertion des points: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Recherche dans la collection
 * @param vector - Vecteur de recherche
 * @param topK - Nombre de résultats à retourner
 * @param collectionName - Nom de la collection
 */
export async function search(
  vector: number[], 
  topK: number = 5, 
  collectionName: string = COLLECTION_NAME
): Promise<SearchResult[]> {
  try {
    const client = getQdrantClient();
    
    const searchResult = await client.search(collectionName, {
      vector,
      limit: topK,
      with_payload: true,
    });

    return searchResult.map(point => ({
      id: point.id,
      score: point.score,
      payload: point.payload,
    }));
  } catch (error) {
    console.error(`[QDRANT] Erreur lors de la recherche dans '${collectionName}':`, error);
    throw new Error(`Échec de la recherche: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Supprime tous les points d'une collection
 * @param collectionName - Nom de la collection
 */
export async function clearCollection(collectionName: string = COLLECTION_NAME): Promise<void> {
  try {
    const client = getQdrantClient();
    
    await client.delete(collectionName, {
      filter: {}, // Supprime tous les points
    });

    console.log(`[QDRANT] Collection '${collectionName}' vidée`);
  } catch (error) {
    console.error(`[QDRANT] Erreur lors du vidage de '${collectionName}':`, error);
    throw new Error(`Échec du vidage de la collection: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Obtient des informations sur la collection
 * @param collectionName - Nom de la collection
 */
export async function getCollectionInfo(collectionName: string = COLLECTION_NAME) {
  try {
    const client = getQdrantClient();
    return await client.getCollection(collectionName);
  } catch (error) {
    console.error(`[QDRANT] Erreur lors de la récupération d'info sur '${collectionName}':`, error);
    return null;
  }
}

/**
 * Teste la connexion à Qdrant
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = getQdrantClient();
    await client.getCollections();
    return true;
  } catch (error) {
    console.error('[QDRANT] Test de connexion échoué:', error);
    return false;
  }
}