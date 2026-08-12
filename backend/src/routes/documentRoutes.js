import express from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, deleteDocument, ingestUrl } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

import rateLimit from 'express-rate-limit';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { status: 'error', message: 'Upload limit reached for this hour. Please try again later.' }
});

router.use(protect);

// Endpoint: POST /api/documents/upload
router.post('/upload', uploadLimiter, upload.single('file'), uploadDocument);

// Endpoint: POST /api/documents/ingest-url
router.post('/ingest-url', uploadLimiter, ingestUrl);

// Endpoint: GET /api/documents?botId=...
router.get('/', getDocuments);

// Endpoint: DELETE /api/documents/:id
router.delete('/:id', deleteDocument);

export default router;