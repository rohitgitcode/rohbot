import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User fetch karo (Exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
      }

      next(); // Safe hai, agle controller function pe jao
    } catch (error) {
      return res.status(401).json({ status: 'fail', message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Not authorized, no token provided' });
  }
};