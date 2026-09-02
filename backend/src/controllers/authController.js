import { signupUser, loginUser, completeUserTour } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, 'Name, email and password are required');
    }

    const result = await signupUser({ name, email, password });

    return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        ...result,
    });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }
    // 2. Service Call
    const result = await loginUser({ email, password });

    // 3. Success Response
    return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        ...result,
    });
});

// @desc    Complete product tour
// @route   PATCH /api/auth/complete-tour
export const completeTour = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const result = await completeUserTour(userId);

    return res.status(200).json({
        success: true,
        message: 'Product tour completed successfully',
        ...result,
    });
});