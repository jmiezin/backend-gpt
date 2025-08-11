/**
 * Embeddings utilities using Azure OpenAI or OpenAI API
 */

import { OpenAI } from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client with Azure or standard OpenAI configuration
 */
function getOpenAIClient(): OpenAI {
  if (openaiClient) {
    return openaiClient;
  }

  // Try Azure OpenAI first
  if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBED_MODEL || 'text-embedding-3-small'}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      },
    });
  } else if (process.env.OPENAI_API_KEY) {
    // Fallback to standard OpenAI
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else {
    throw new Error('No OpenAI API key found. Please set AZURE_OPENAI_API_KEY or OPENAI_API_KEY in environment variables.');
  }

  return openaiClient;
}

/**
 * Generate embeddings for an array of texts
 * @param texts - Array of texts to embed
 * @returns Promise resolving to array of embedding vectors (number[][])
 */
export async function embed(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    const client = getOpenAIClient();
    const model = process.env.AZURE_OPENAI_EMBED_MODEL || 'text-embedding-3-small';
    
    const response = await client.embeddings.create({
      model,
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embedding for a single text
 * @param text - Text to embed
 * @returns Promise resolving to embedding vector (number[])
 */
export async function embedSingle(text: string): Promise<number[]> {
  const embeddings = await embed([text]);
  return embeddings[0];
}