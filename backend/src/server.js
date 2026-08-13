import dotenv from 'dotenv/config';
import express from 'express';
import cors from 'cors';
// import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import botRoutes from './routes/botRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import widgetRoutes from './routes/widgetRoutes.js';
import { initQdrantCollection } from './config/qdrant.js';
import path from 'path';
import { fileURLToPath } from 'url';


initQdrantCollection(); 

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewaress
app.use(cors());
app.use(express.json());

import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api/', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/public', widgetRoutes);

// Serve static files from public directory (for widget.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Base Route
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'SaaS Chatbot API v1 Ready' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});