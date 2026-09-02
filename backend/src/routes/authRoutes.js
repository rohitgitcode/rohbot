import express from 'express';
import { signup, login, completeTour } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.patch('/complete-tour', protect, completeTour);
router.post('/complete-tour', protect, completeTour);

// Protected route sample (Me/Profile info fetch karne ke liye)
router.get('/me', protect, (req, res) => {
  res.json({
    status: 'success',
    user: req.user,
  });
});

export default router;