// import Document from '../models/Document.js';
// import Bot from '../models/Bot.js';
// import { processAndEmbedDocument } from '../services/ragService.js';

// export const uploadDocument = async (req, res) => {
//   try {
//     const { botId } = req.body;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ status: 'fail', message: 'Please upload a file' });
//     }

//     // Verify Bot Ownership
//     const bot = await Bot.findOne({ _id: botId, userId: req.user._id });
//     if (!bot) {
//       return res.status(404).json({ status: 'fail', message: 'Bot not found or unauthorized' });
//     }

//     // Create Document record in DB (Status: Processing)
//     const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'txt';
//     const documentRecord = await Document.create({
//       botId,
//       userId: req.user._id,
//       filename: file.originalname,
//       fileType,
//       status: 'processing',
//     });

//     // Run RAG Ingestion Pipeline
//     try {
//       const { characterCount, chunkCount } = await processAndEmbedDocument({
//         fileBuffer: file.buffer,
//         fileType,
//         botId,
//         documentId: documentRecord._id,
//       });

//       // Update Document Record Status
//       documentRecord.characterCount = characterCount;
//       documentRecord.chunkCount = chunkCount;
//       documentRecord.status = 'ready';
//       await documentRecord.save();

//       res.status(201).json({
//         status: 'success',
//         message: 'Document uploaded and embedded into Knowledge Base successfully!',
//         data: { document: documentRecord },
//       });
//     } catch (embeddingError) {
//       documentRecord.status = 'failed';
//       await documentRecord.save();
//       throw embeddingError;
//     }
//   } catch (error) {
//     res.status(500).json({ status: 'error', message: error.message });
//   }
// };


import Document from '../models/Document.js';
import { processAndEmbedDocument } from '../services/ragService.js';
import mongoose from 'mongoose';

export const uploadDocument = async (req, res) => {
  try {
    const { botId } = req.body;
    const file = req.file;

    // 1. Basic Validation
    if (!file) {
      return res.status(400).json({ status: 'error', message: 'Please attach a file in form-data' });
    }
    if (!botId || !mongoose.Types.ObjectId.isValid(botId)) {
      return res.status(400).json({ status: 'fail', message: 'Valid 24-character MongoDB Bot ID is required' });
    }

    // 2. Save Document Record in MongoDB
    const document = await Document.create({
      botId,
      userId: req.user?._id || botId, // Fallback if user middleware isn't attached
      filename: file.originalname,
      fileType: file.originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'txt',
      status: 'processing',
    });

    // 3. Process Text & Push Embeddings to Qdrant
    const { characterCount, chunkCount } = await processAndEmbedDocument({
      fileBuffer: file.buffer,
      fileType: document.fileType,
      botId,
      documentId: document._id,
    });

    // 4. Update Document Status
    document.characterCount = characterCount;
    document.chunkCount = chunkCount;
    document.status = 'ready';
    await document.save();

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded and embedded into Knowledge Base successfully!',
      data: { document },
    });
  } catch (error) {
    // Exact Error Details Output in Terminal
    console.error('❌ Upload Controller Detailed Error:', error);

    res.status(400).json({
      status: 'error',
      message: error.message || 'Bad Request',
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { botId } = req.query;
    if (!botId || !mongoose.Types.ObjectId.isValid(botId)) {
      return res.status(400).json({ status: 'fail', message: 'Valid botId query parameter is required' });
    }

    const documents = await Document.find({ botId }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: { documents },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};