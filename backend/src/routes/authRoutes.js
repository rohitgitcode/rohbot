import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Protected route sample (Me/Profile info fetch karne ke liye)
router.get('/me', protect, (req, res) => {
  res.json({
    status: 'success',
    user: req.user,
  });
});

export default router;