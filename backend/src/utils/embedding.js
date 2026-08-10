import { pipeline } from '@xenova/transformers';

let extractor = null;

// Lazy-load the embedding pipeline once (Node.js RAM optimize karne ke liye)
export const getEmbeddingPipeline = async () => {
  if (!extractor) {
    // Standard HuggingFace model: 384 dimensions generate karta hai
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
};

// Plain text se vector array generate karne ke liye helper function
export const generateEmbedding = async (text) => {
  try {
    const pipe = await getEmbeddingPipeline();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    
    // Float32Array ko standard JavaScript Array me convert kar rahe hain
    return Array.from(output.data);
  } catch (error) {
    console.error('❌ Embedding Generation Error:', error.message);
    throw error;
  }
};