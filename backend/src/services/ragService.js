import { extractText } from 'unpdf';
import { v4 as uuidv4 } from 'uuid';
import { qdrantClient, COLLECTION_NAME } from '../config/qdrant.js';
import { generateEmbedding } from '../utils/embedding.js';

// 1. Text Chunking Helper (with Unicode Boundary Protection)
const chunkText = (text, chunkSize = 500, overlap = 50) => {
  const chunks = [];
  // Use Array.from to correctly handle UTF-16 surrogate pairs (emojis, complex characters)
  const characters = Array.from(text);
  let start = 0;

  while (start < characters.length) {
    const end = start + chunkSize;
    // Join characters back to string and ensure it's well-formed
    const chunk = characters.slice(start, end).join('').toWellFormed().trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }

  return chunks;
};

// 2. Main Document Ingestion Pipeline
export const processAndEmbedDocument = async ({ fileBuffer, fileType, botId, documentId }) => {
  let rawText = '';

  if (fileType === 'pdf') {
    const uint8Array = new Uint8Array(fileBuffer);
    const { text } = await extractText(uint8Array);
    rawText = Array.isArray(text) ? text.join('\n') : text;
  } else if (fileType === 'txt') {
    rawText = fileBuffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type');
  }

  // Clean raw text: sanitize broken surrogates & control characters
  rawText = rawText
    .toWellFormed() // Repair lone Unicode surrogates
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Remove non-printable control characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  if (!rawText || rawText.length === 0) {
    throw new Error('No readable text found in document');
  }

  const chunks = chunkText(rawText);

  const points = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkTextContent = chunks[i];
    const vector = await generateEmbedding(chunkTextContent);

    points.push({
      id: uuidv4(),
      vector: vector,
      payload: {
        botId: botId.toString(),
        documentId: documentId.toString(),
        content: chunkTextContent,
        chunkIndex: i,
      },
    });
  }

  // Batch Upsert Vectors to Qdrant Cloud
  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    points: points,
  });

  // Log exact vector point count upserted into Qdrant
  console.log(`✅ [RAG Ingestion] Successfully upserted ${points.length} vectors to collection '${COLLECTION_NAME}' for botId: ${botId.toString()}`);

  return {
    characterCount: rawText.length,
    chunkCount: chunks.length,
  };
};

// 3. Search Vector Context for C2 User Query
export const searchRelevantContext = async (userQuery, botId, limit = 3) => {
  try {
    const queryVector = await generateEmbedding(userQuery);

    const searchResult = await qdrantClient.query(COLLECTION_NAME, {
      query: queryVector,
      limit: limit,
      with_payload: true,
      filter: {
        must: [
          {
            key: 'botId',
            match: {
              value: botId.toString(),
            },
          },
        ],
      },
    });

    let points = [];
    if (searchResult && Array.isArray(searchResult.points)) {
      points = searchResult.points;
    } else if (searchResult && searchResult.result && Array.isArray(searchResult.result.points)) {
      points = searchResult.result.points;
    } else if (Array.isArray(searchResult)) {
      points = searchResult;
    }

    console.log(`🔍 [RAG Search] Collection: '${COLLECTION_NAME}'`);
    console.log(`🎯 [RAG Search] Target botId: '${botId.toString()}'`);
    console.log(`✅ [RAG Search] Matched chunks count: ${points.length}`);

    if (points.length === 0) {
      console.warn(`⚠️ [RAG Search Warning] No context chunks found for query in botId: '${botId.toString()}'`);
    }

    // Extract text content safely from payload
    const textChunks = points
      .filter(p => p && p.payload)
      .map(p => {
        const payload = p.payload;
        // Priority to 'content' as we confirmed in documentController.js/ragService.js upsert
        return payload.content || payload.text || payload.pageContent || payload.chunk || '';
      })
      .filter(str => typeof str === 'string' && str.trim().length > 0);

    return textChunks;
  } catch (error) {
    console.error(`❌ [RAG Search Error] Failed to retrieve context from Qdrant:`, error.message);
    return []; // Return empty array rather than failing the whole chat flow
  }
}; 