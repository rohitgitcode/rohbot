import dotenv from 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// Database & Vector DB Config
import connectDB from './config/db.js';
import { initQdrantCollection } from './config/qdrant.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import botRoutes from './routes/botRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import widgetRoutes from './routes/widgetRoutes.js';

// Middlewares & Error Utilities
import { errorHandler } from './middleware/error.middleware.js';
import { ApiError } from './utils/ApiError.js';

// Initialize DBs
connectDB();
initQdrantCollection();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for Render and reverse proxies (Fixes Rate Limit / IP verification)
app.set('trust proxy', 1);

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve static widget bundle (e.g. widget.js for embed)
app.use(express.static(path.join(__dirname, '../public')));

// Rate Limiter for API endpoints
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});
app.use('/api/', globalLimiter);

app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'SaaS Chatbot API v1 Ready 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/public', widgetRoutes);

app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} not found on this server`));
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});