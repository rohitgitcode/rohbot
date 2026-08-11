import express from 'express';
import { sendMessage, getUserChats, getChatById, deleteChatThread, bulkDeleteChatThreads } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

import rateLimit from 'express-rate-limit';

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15,
  message: { status: 'error', message: 'Too many requests! Please wait a minute before sending another message.' }
});

// 🔒 Saare chat routes Protected hain (JWT Token zaroori hai)

// 1. Send Message (Nayi chat ya existing chat dono handle karta hai)
router.post('/message', protect, chatLimiter, sendMessage);

// 2. Get All User Chats (Sidebar ke liye)
router.get('/', protect, getUserChats);

// 3. Get Specific Chat by ID (Purani conversation load karne ke liye)
router.get('/:id', protect, getChatById);

// 4. Delete Specific Chat by ID
router.delete('/:id', protect, deleteChatThread);

// 5. Bulk Delete Chat Threads
router.post('/bulk-delete', protect, bulkDeleteChatThreads);

export default router;