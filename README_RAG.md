# RAG System Documentation

This project includes a minimal RAG (Retrieval-Augmented Generation) system built with TypeScript, Express, and Qdrant.

## Features

- **Document Indexing**: Upload and chunk text documents for semantic search
- **Semantic Search**: Find relevant document chunks using vector similarity
- **Bulk Loading**: Process all .txt files from a directory
- **Health Checks**: Monitor system status and Qdrant connectivity

## Prerequisites

1. **Qdrant** running on `http://localhost:6333` (or configure via `QDRANT_URL`)
2. **Azure OpenAI** or **OpenAI API** access for embeddings
3. **Node.js** v20+ and npm

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
```http
GET /rag/health
```

Response:
```json
{
  "ok": true,
  "qdrant": true
}
```

### Insert Documents
```http
POST /rag/insert
Content-Type: application/json

{
  "text": "Your document text here..."
}
```

Or for multiple documents:
```json
{
  "items": [
    { "text": "First document..." },
    { "text": "Second document..." }
  ]
}
```

Response:
```json
{
  "inserted": 5,
  "chunks": 5
}
```

### Search Documents
```http
POST /rag/search
Content-Type: application/json

{
  "query": "What is machine learning?",
  "topK": 5
}
```

Response:
```json
{
  "results": [
    {
      "score": 0.95,
      "text": "Machine learning is a subset of artificial intelligence...",
      "id": "uuid-here"
    }
  ]
}
```

## Bulk Loading

Process all `.txt` files from the `./docs` directory:

```bash
npm run rag:bulk
```

This will:
1. Scan the `./docs` directory for `.txt` files
2. Chunk each file (500 chars, 50 char overlap)
3. Generate embeddings
4. Insert into Qdrant

## Scripts

- `npm run rag:health` - Check system health
- `npm run rag:bulk` - Bulk load from ./docs directory
- `npm run build` - Build TypeScript
- `npm run dev` - Development mode
- `npm start` - Production mode

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QDRANT_URL` | Qdrant server URL | `http://localhost:6333` |
| `QDRANT_API_KEY` | Qdrant API key (optional) | - |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | - |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | - |
| `AZURE_OPENAI_EMBED_MODEL` | Embedding model name | `text-embedding-3-small` |
| `OPENAI_API_KEY` | OpenAI API key (fallback) | - |
| `PORT` | Server port | `8080` |

### Chunking Parameters

- **Chunk size**: 500 characters
- **Overlap**: 50 characters
- **Collection**: `rag_docs`
- **Vector dimensions**: 1536
- **Distance metric**: Cosine

## Project Structure

```
src/
├── lib/
│   ├── chunker.ts      # Text chunking utilities
│   ├── embeddings.ts   # Azure OpenAI/OpenAI embeddings
│   └── qdrant.ts       # Qdrant client and operations
├── routes/
│   └── rag.ts          # RAG API endpoints
├── scripts/
│   └── rag-bulk.ts     # Bulk loading script
└── server.ts           # Express server with RAG routes
```

## Usage Examples

1. **Check system status**:
   ```bash
   curl http://localhost:8080/rag/health
   ```

2. **Insert a document**:
   ```bash
   curl -X POST http://localhost:8080/rag/insert \
     -H "Content-Type: application/json" \
     -d '{"text": "Machine learning is a powerful technology..."}'
   ```

3. **Search for relevant content**:
   ```bash
   curl -X POST http://localhost:8080/rag/search \
     -H "Content-Type: application/json" \
     -d '{"query": "machine learning", "topK": 3}'
   ```

4. **Bulk load documents**:
   ```bash
   # Add .txt files to ./docs directory first
   npm run rag:bulk
   ```

## Troubleshooting

- **Collection not found**: The collection is created automatically on first insert
- **Embedding errors**: Check your API keys and endpoint configuration
- **Qdrant connection**: Ensure Qdrant is running and accessible
- **TypeScript errors**: Run `npm run build` to check for compilation issues