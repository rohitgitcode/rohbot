import express from 'express';
import { sendMessage, getUserChats, getChatById } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔒 Saare chat routes Protected hain (JWT Token zaroori hai)

// 1. Send Message (Nayi chat ya existing chat dono handle karta hai)
router.post('/message', protect, sendMessage);

// 2. Get All User Chats (Sidebar ke liye)
router.get('/', protect, getUserChats);

// 3. Get Specific Chat by ID (Purani conversation load karne ke liye)
router.get('/:id', protect, getChatById);

export default router;