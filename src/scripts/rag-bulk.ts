#!/usr/bin/env ts-node

/**
 * Script de traitement bulk pour insérer tous les fichiers .txt du dossier docs
 * dans la base vectorielle Qdrant
 */

import fs from 'fs';
import path from 'path';
import '../config/env'; // Charger les variables d'environnement

import { chunkText } from '../lib/chunker';
import { embed } from '../lib/embeddings';
import { upsert, ensureCollection, QdrantPoint } from '../lib/qdrant';

const DOCS_FOLDER = './docs';

/**
 * Lit récursivement tous les fichiers .txt d'un dossier
 */
function findTxtFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`[BULK] Dossier ${dir} n'existe pas`);
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Récursion dans les sous-dossiers
      files.push(...findTxtFiles(fullPath));
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.txt') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Traite un fichier txt et retourne les points Qdrant
 */
async function processFile(filePath: string): Promise<QdrantPoint[]> {
  const relativePath = path.relative(process.cwd(), filePath);
  
  try {
    // Lecture du contenu
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.trim().length === 0) {
      console.log(`[BULK] ${relativePath} est vide, ignoré`);
      return [];
    }

    // Chunking
    const chunks = chunkText(content, { size: 500, overlap: 50 });
    
    if (chunks.length === 0) {
      console.log(`[BULK] ${relativePath} n'a produit aucun chunk, ignoré`);
      return [];
    }

    console.log(`[BULK] ${relativePath}: ${chunks.length} chunks générés`);

    // Génération des embeddings
    const chunkTexts = chunks.map(chunk => chunk.text);
    const embeddings = await embed(chunkTexts);

    // Création des points Qdrant
    const points: QdrantPoint[] = chunks.map((chunk, index) => {
      const pointId = `${Date.now()}_${Buffer.from(relativePath).toString('base64')}_${index}`;
      
      return {
        id: pointId,
        vector: embeddings[index],
        payload: {
          text: chunk.text,
          chunkIndex: chunk.index,
          source: 'bulk',
          filePath: relativePath,
          fileName: path.basename(filePath),
          fileSize: content.length,
          chunkStart: chunk.start,
          chunkEnd: chunk.end
        }
      };
    });

    return points;
  } catch (error) {
    console.error(`[BULK] Erreur lors du traitement de ${relativePath}:`, error);
    return [];
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('[BULK] Démarrage du traitement bulk...');
  
  try {
    // S'assurer que la collection existe
    await ensureCollection();
    
    // Trouver tous les fichiers .txt
    const txtFiles = findTxtFiles(DOCS_FOLDER);
    
    if (txtFiles.length === 0) {
      console.log(`[BULK] Aucun fichier .txt trouvé dans ${DOCS_FOLDER}`);
      return;
    }

    console.log(`[BULK] ${txtFiles.length} fichiers .txt trouvés`);

    let totalChunks = 0;
    let processedFiles = 0;

    // Traitement de chaque fichier
    for (const filePath of txtFiles) {
      const points = await processFile(filePath);
      
      if (points.length > 0) {
        await upsert(points);
        totalChunks += points.length;
        processedFiles++;
        
        console.log(`[BULK] ${path.relative(process.cwd(), filePath)}: ${points.length} chunks insérés`);
      }
    }

    console.log(`[BULK] Traitement terminé:`);
    console.log(`  - Fichiers traités: ${processedFiles}/${txtFiles.length}`);
    console.log(`  - Total chunks insérés: ${totalChunks}`);

  } catch (error) {
    console.error('[BULK] Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  main().catch((error) => {
    console.error('[BULK] Erreur non gérée:', error);
    process.exit(1);
  });
}

export { main as runBulkInsert };