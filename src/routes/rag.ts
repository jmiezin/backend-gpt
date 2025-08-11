/**
 * Routes RAG - Endpoints pour le système de Retrieval Augmented Generation
 */

import { Router, Request, Response } from 'express';
import { chunkText } from '../lib/chunker';
import { embed, embedSingle } from '../lib/embeddings';
import { ensureCollection, upsert, search, collectionExists, QdrantPoint } from '../lib/qdrant';

const router = Router();

/**
 * GET /rag/health
 * Vérifie le statut du système RAG
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const qdrantOk = await collectionExists('rag_docs');
    
    res.json({
      ok: true,
      qdrant: qdrantOk
    });
  } catch (error) {
    console.error('[RAG] Erreur health check:', error);
    res.status(500).json({
      ok: false,
      qdrant: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * Interface pour le body de /rag/insert
 */
interface InsertRequestBody {
  text?: string;
  items?: { text: string }[];
}

/**
 * POST /rag/insert
 * Insère du texte dans la base vectorielle après chunking et embedding
 */
router.post('/insert', async (req: Request, res: Response) => {
  try {
    const body: InsertRequestBody = req.body;
    
    // Validation et normalisation du body
    let items: { text: string }[];
    
    if (body.text) {
      // Format: { text: "..." }
      items = [{ text: body.text }];
    } else if (body.items && Array.isArray(body.items)) {
      // Format: { items: [{ text: "..." }] }
      items = body.items;
    } else {
      return res.status(400).json({
        error: 'items or text required'
      });
    }

    // Validation des items
    if (!items.every(item => item && typeof item.text === 'string' && item.text.trim().length > 0)) {
      return res.status(400).json({
        error: 'Tous les items doivent avoir un champ text non vide'
      });
    }

    let totalChunks = 0;
    const allPoints: QdrantPoint[] = [];

    // Traitement de chaque item
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      
      // Chunking du texte
      const chunks = chunkText(item.text, { size: 500, overlap: 50 });
      
      if (chunks.length === 0) {
        continue;
      }

      // Génération des embeddings pour tous les chunks de cet item
      const chunkTexts = chunks.map(chunk => chunk.text);
      const embeddings = await embed(chunkTexts);

      // Création des points Qdrant
      chunks.forEach((chunk, chunkIndex) => {
        const pointId = `${Date.now()}_${itemIndex}_${chunkIndex}`;
        
        allPoints.push({
          id: pointId,
          vector: embeddings[chunkIndex],
          payload: {
            text: chunk.text,
            chunkIndex: chunk.index,
            source: 'api',
            itemIndex,
            originalLength: item.text.length
          }
        });
      });

      totalChunks += chunks.length;
    }

    // Insertion dans Qdrant
    if (allPoints.length > 0) {
      await upsert(allPoints);
    }

    res.json({
      inserted: allPoints.length,
      chunks: totalChunks
    });

  } catch (error) {
    console.error('[RAG] Erreur insertion:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur lors de l\'insertion'
    });
  }
});

/**
 * Interface pour le body de /rag/search
 */
interface SearchRequestBody {
  query: string;
  topK?: number;
}

/**
 * POST /rag/search
 * Recherche sémantique dans la base vectorielle
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 }: SearchRequestBody = req.body;

    // Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query requise et non vide'
      });
    }

    if (topK && (typeof topK !== 'number' || topK < 1 || topK > 100)) {
      return res.status(400).json({
        error: 'topK doit être un nombre entre 1 et 100'
      });
    }

    // Génération de l'embedding pour la query
    const queryEmbedding = await embedSingle(query);

    // Recherche dans Qdrant
    const searchResults = await search(queryEmbedding, topK);

    // Formatage des résultats
    const results = searchResults.map(result => ({
      id: result.id,
      score: result.score,
      text: result.payload?.text ?? null
    }));

    res.json({
      query,
      count: results.length,
      results
    });

  } catch (error) {
    console.error('[RAG] Erreur recherche:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur lors de la recherche'
    });
  }
});

/**
 * Fonction pour créer et configurer le router RAG
 * @returns Router Express configuré
 */
export function createRagRouter(): Router {
  return router;
}

export default router;