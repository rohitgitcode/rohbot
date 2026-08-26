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
import { processAndEmbedDocument, deleteDocumentVectors } from '../services/ragService.js';
import { parsePdfMultimodal } from '../services/pdfParserService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';

// ===================================================
// 1. Upload File & Ingest to Vector Knowledge Base
// ===================================================
export const uploadDocument = asyncHandler(async (req, res) => {
  const { botId } = req.body;
  const file = req.file;

  // 1. Validations
  if (!file) {
    throw new ApiError(400, 'Please attach a file in form-data');
  }
  if (!botId || !mongoose.Types.ObjectId.isValid(botId)) {
    throw new ApiError(400, 'Valid 24-character MongoDB Bot ID is required');
  }

  // 2. Save Initial Document Record in MongoDB
  const document = await Document.create({
    botId,
    userId: req.user?._id || botId,
    filename: file.originalname,
    fileType: file.originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'txt',
    status: 'processing',
  });

  // 3. Process Text & Push Embeddings to Qdrant
  let extractedText = '';
  if (document.fileType === 'pdf') {
    extractedText = await parsePdfMultimodal(file.buffer);
  } else {
    extractedText = file.buffer.toString('utf-8');
  }

  const { characterCount, chunkCount } = await processAndEmbedDocument({
    extractedText,
    botId,
    documentId: document._id,
  });

  // 4. Update Document Status to 'ready'
  document.characterCount = characterCount;
  document.chunkCount = chunkCount;
  document.status = 'ready';
  await document.save();

  return res.status(201).json({
    success: true,
    message: 'Document uploaded and embedded into Knowledge Base successfully!',
    data: { document },
  });
});

// ===================================================
// 2. Scrape Web URL & Ingest to Vector Knowledge Base
// ===================================================
export const ingestUrl = asyncHandler(async (req, res) => {
  const { url, botId } = req.body;

  // 1. Validations
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    throw new ApiError(400, 'Please provide a valid HTTP/HTTPS URL');
  }
  if (!botId || !mongoose.Types.ObjectId.isValid(botId)) {
    throw new ApiError(400, 'Valid 24-character MongoDB Bot ID is required');
  }

  // 2. Fetch HTML with Timeout
  let response;
  try {
    response = await axios.get(url, {
      timeout: 10000, // 10 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
  } catch (fetchErr) {
    throw new ApiError(400, `Failed to fetch URL: ${fetchErr.message}`);
  }

  // 3. Parse HTML with Cheerio
  const $ = cheerio.load(response.data);

  // Remove scripts, styles, navigation, headers, footers
  $('script, style, noscript, iframe, nav, header, footer, aside').remove();

  let title = $('title').text().trim();
  if (!title) {
    try {
      const urlObj = new URL(url);
      title = urlObj.hostname;
    } catch {
      title = 'Web Page';
    }
  }

  // Extract readable text from main/article/body
  let content = $('main').text() || $('article').text() || $('body').text();
  content = content.replace(/\s+/g, ' ').trim();

  if (!content) {
    throw new ApiError(400, 'Could not extract readable text from this URL');
  }

  // 4. Save Document Record in MongoDB
  const document = await Document.create({
    botId,
    userId: req.user?._id || botId,
    filename: title,
    fileType: 'url',
    sourceUrl: url,
    status: 'processing',
  });

  // 5. Process Text & Push Embeddings to Qdrant
  const { characterCount, chunkCount } = await processAndEmbedDocument({
    extractedText: content,
    botId,
    documentId: document._id,
  });

  // 6. Update Document Status
  document.characterCount = characterCount;
  document.chunkCount = chunkCount;
  document.status = 'ready';
  await document.save();

  return res.status(201).json({
    success: true,
    message: 'URL ingested and embedded into Knowledge Base successfully!',
    data: { document },
  });
});

// ===================================================
// 3. Get All Knowledge Base Documents for a Bot
// ===================================================
export const getDocuments = asyncHandler(async (req, res) => {
  const { botId } = req.query;

  if (!botId || !mongoose.Types.ObjectId.isValid(botId)) {
    throw new ApiError(400, 'Valid botId query parameter is required');
  }

  const documents = await Document.find({ botId }).sort('-createdAt');

  return res.status(200).json({
    success: true,
    results: documents.length,
    data: { documents },
  });
});

// ===================================================
// 4. Delete Document (MongoDB + Qdrant Cleanup)
// ===================================================
export const deleteDocument = asyncHandler(async (req, res) => {
  const docId = req.params.id;

  if (!docId || !mongoose.Types.ObjectId.isValid(docId)) {
    throw new ApiError(400, 'Valid Document ID is required');
  }

  const document = await Document.findById(docId);
  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  // 1. Delete from MongoDB
  await document.deleteOne();

  // 2. Delete embeddings from Qdrant Vector DB
  await deleteDocumentVectors(docId);

  return res.status(200).json({
    success: true,
    message: 'Document and associated vector embeddings deleted successfully',
  });
});