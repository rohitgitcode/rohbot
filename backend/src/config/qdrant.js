import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

if (!qdrantUrl) {
  console.warn(' QDRANT_URL is not defined in environment variables.');
}

export const qdrantClient = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey,
  checkCompatibility : false
});

export const COLLECTION_NAME = 'rohbot_knowledge_base_v2';

// Helper function to initialize collection if it doesn't exist
export const initQdrantCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
      
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384,
          distance: 'Cosine', // 1 identical , 0 not identical 
        },
      });

      // Multi-tenant isolation ke liye 'botId' payload index create kar rahe hain
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'botId',
        field_schema: 'keyword',
      });

      console.log(` Qdrant Collection '${COLLECTION_NAME}' created with botId index.`);
    } else {
      console.log(` Qdrant Collection '${COLLECTION_NAME}' is ready.`);
    }
  } catch (error) {
    console.error(' Error initializing Qdrant Collection:', error.message);
  }
};