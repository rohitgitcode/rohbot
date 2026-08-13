import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { publicChat } from '../controllers/widgetController.js';

const router = express.Router();

// Specific open CORS for public widget routes
const publicCors = cors({ origin: '*' });

// Strict IP rate limiting to prevent spam
const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // max 20 requests per minute per IP
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});

router.post('/chat', publicCors, publicLimiter, publicChat);

export default router;
