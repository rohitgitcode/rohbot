import express from 'express';
import {
  createBot,
  getUserBots,
  getBotById,
  updateBot,
  deleteBot,
} from '../controllers/botController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔒 All Bot CRUD routes are protected (C1 JWT Token mandatory)
router.use(protect);

router.route('/')
  .post(createBot)
  .get(getUserBots);

router.route('/:id')
  .get(getBotById)
  .put(updateBot)
  .delete(deleteBot);

export default router;