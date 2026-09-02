import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id: userId.toString(), userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const sanitizeUser = (user) => {
  return {
    _id: user._id.toString(),
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    hasCompletedTour: user.hasCompletedTour ?? false,
  };
};

export const signupUser = async ({ name, email, password }) => {
  // Normalize input
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    hasCompletedTour: false,
  });

  const token = generateToken(user._id);
  return {
    token,
    user: sanitizeUser(user),
    isNewUser: true,
  };
};

export const completeUserTour = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { hasCompletedTour: true },
    { new: true }
  );

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    user: sanitizeUser(user),
  };
};

export const loginUser = async ({ email, password }) => {
  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password');

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Compare plain password with stored bcrypt hash
  const isPasswordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Generate authentication token
  const token = generateToken(user._id);

  return {
    token,
    user: sanitizeUser(user),
  };
};