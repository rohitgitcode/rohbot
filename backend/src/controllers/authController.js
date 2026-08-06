import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// JWT Token Generate karne ka Helper Function
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // 7 dino ke liye valid rahega
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'User already exists with this email' });
    }

    // Password Hash karo (Security Best Practice)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // User Create karo
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Token Generate karo
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Email and password are required' });
    }

    // User dhoondho aur password explicitly select karo
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    // Password Match Check karo
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    // Token generate karo
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};