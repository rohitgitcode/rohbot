import express from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(protect);

// Endpoint: POST /api/documents/upload
router.post('/upload', upload.single('file'), uploadDocument);

// Endpoint: GET /api/documents?botId=...
router.get('/', getDocuments);

export default router;