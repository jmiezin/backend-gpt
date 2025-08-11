/**
 * Module d'embeddings utilisant Azure OpenAI
 */

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Initialise le client OpenAI avec les credentials Azure
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;

    if (!endpoint || !apiKey) {
      throw new Error(
        'Variables d\'environnement manquantes: AZURE_OPENAI_ENDPOINT et AZURE_OPENAI_API_KEY sont requis'
      );
    }

    openaiClient = new OpenAI({
      apiKey,
      baseURL: `${endpoint}/openai/deployments`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: {
        'api-key': apiKey,
      },
    });
  }

  return openaiClient;
}

/**
 * Génère les embeddings pour un tableau de textes
 * @param texts - Array de textes à transformer en embeddings
 * @returns Array d'embeddings (vecteurs de nombres)
 */
export async function embed(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    const client = getOpenAIClient();
    const model = process.env.AZURE_OPENAI_EMBED_MODEL || 'text-embedding-3-small';

    // Azure OpenAI peut traiter plusieurs textes en une seule requête
    const response = await client.embeddings.create({
      model,
      input: texts,
    });

    // Extraire les embeddings dans l'ordre
    const embeddings: number[][] = response.data.map(item => item.embedding);
    
    console.log(`[EMBEDDINGS] ${texts.length} textes traités avec le modèle ${model}`);
    
    return embeddings;
  } catch (error) {
    console.error('[EMBEDDINGS] Erreur lors de la génération des embeddings:', error);
    throw new Error(`Échec de génération des embeddings: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Génère l'embedding pour un seul texte
 * @param text - Texte à transformer en embedding
 * @returns Vecteur d'embedding
 */
export async function embedSingle(text: string): Promise<number[]> {
  const embeddings = await embed([text]);
  return embeddings[0];
}

/**
 * Teste la configuration des embeddings
 * @returns true si la configuration fonctionne
 */
export async function testEmbeddings(): Promise<boolean> {
  try {
    const testEmbedding = await embedSingle('Test de configuration des embeddings');
    return testEmbedding.length === 1536; // Dimension attendue pour text-embedding-3-small
  } catch (error) {
    console.error('[EMBEDDINGS] Test échoué:', error);
    return false;
  }
}