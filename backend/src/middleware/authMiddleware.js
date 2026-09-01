// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// export const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
      
//       if (!token) {
//         return res.status(401).json({ status: 'fail', message: 'Not authorized, token missing' });
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
//       // Fallback check for id, userId, or _id
//       const userId = decoded.id || decoded.userId || decoded._id;

//       if (!userId) {
//         return res.status(401).json({ status: 'fail', message: 'Invalid token payload' });
//       }

//       req.user = await User.findById(userId).select('-password');

//       if (!req.user) {
//         return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
//       }

//       return next();
//     } catch (error) {
//       return res.status(401).json({ status: 'fail', message: 'Not authorized, token failed or expired' });
//     }
//   }

//   return res.status(401).json({ status: 'fail', message: 'Not authorized, no token provided' });
// };


import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        console.error('[AUTH DEBUG] Bearer token extracted is empty');
        return res.status(401).json({ status: 'fail', message: 'Not authorized, token missing' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH DEBUG] Decoded payload:', decoded);

      const userId = decoded.id || decoded.userId || decoded._id;
      if (!userId) {
        console.error('[AUTH DEBUG] No user ID field found in decoded payload');
        return res.status(401).json({ status: 'fail', message: 'Invalid token payload' });
      }

      req.user = await User.findById(userId).select('-password');
      console.log('[AUTH DEBUG] User lookup result:', req.user ? req.user._id : 'null');

      if (!req.user) {
        return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
      }

      return next();
    } catch (error) {
      console.error('[AUTH DEBUG] Token verification failed:', error.message);
      return res.status(401).json({ 
        status: 'fail', 
        message: 'Not authorized, token failed or expired',
        details: error.message 
      });
    }
  }

  console.error('[AUTH DEBUG] No Authorization header with Bearer found');
  return res.status(401).json({ status: 'fail', message: 'Not authorized, no token provided' });
};