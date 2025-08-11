/**
 * Fonctions de découpage de texte en chunks pour le RAG
 */

export interface ChunkOptions {
  size?: number;
  overlap?: number;
}

export interface Chunk {
  text: string;
  index: number;
  start: number;
  end: number;
}

/**
 * Découpe un texte en chunks avec overlap
 * @param text - Le texte à découper
 * @param options - Options de chunking (size=500, overlap=50 par défaut)
 * @returns Array de chunks avec métadonnées
 */
export function chunkText(text: string, options: ChunkOptions = {}): Chunk[] {
  const { size = 500, overlap = 50 } = options;
  
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    const chunkText = text.slice(start, end);
    
    chunks.push({
      text: chunkText,
      index,
      start,
      end
    });

    // Si on a atteint la fin du texte, on sort
    if (end >= text.length) {
      break;
    }

    // Calcul du prochain start avec overlap
    start = end - overlap;
    index++;
  }

  return chunks;
}

/**
 * Découpe plusieurs textes en chunks
 * @param texts - Array de textes à découper
 * @param options - Options de chunking
 * @returns Array de chunks avec un sourceIndex pour identifier l'origine
 */
export function chunkTexts(texts: string[], options: ChunkOptions = {}): Array<Chunk & { sourceIndex: number }> {
  const allChunks: Array<Chunk & { sourceIndex: number }> = [];
  
  texts.forEach((text, sourceIndex) => {
    const chunks = chunkText(text, options);
    chunks.forEach(chunk => {
      allChunks.push({
        ...chunk,
        sourceIndex
      });
    });
  });

  return allChunks;
}