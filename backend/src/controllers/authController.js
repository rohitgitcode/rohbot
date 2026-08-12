import {
  signupUser,
  loginUser,
} from '../services/authService.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, email and password are required',
      });
    }

    const result = await signupUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email and password are required',
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

