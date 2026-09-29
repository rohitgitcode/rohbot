import Bot from '../models/Bot.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { DEFAULT_SYSTEM_PROMPT } from '../constants/prompts.js';

// 1. Create a New Bot 
export const createBot = asyncHandler(async (req, res) => {
  const { name, systemPrompt, appearance, allowedDomains } = req.body;

  const bot = await Bot.create({
    userId: req.user._id, // Auth middleware se logged-in user ki ID
    name: name || 'My Custom Assistant',
    systemPrompt: (systemPrompt && systemPrompt.trim()) ? systemPrompt.trim() : DEFAULT_SYSTEM_PROMPT,
    appearance,
    allowedDomains, 
  }); 

  return res.status(201).json({
    success: true,
    message: 'Bot created successfully', 
    data: { bot },
  });
});

// 2. Get All Bots for Logged-In User
export const getUserBots = asyncHandler(async (req, res) => {
  // Sort by latest created first
  const bots = await Bot.find({ userId: req.user._id }).sort('-createdAt');

  return res.status(200).json({
    success: true,
    results: bots.length,
    data: { bots },
  });
});

// 3. Get Single Bot by ID (Ownership Checked)
export const getBotById = asyncHandler(async (req, res) => {
  const bot = await Bot.findOne({
    _id: req.params.id,
    userId: req.user._id, // Ensures user cannot view someone else's bot
  });

  if (!bot) {
    throw new ApiError(404, 'Bot not found or unauthorized access');
  }

  return res.status(200).json({
    success: true,
    data: { bot },
  });
});

// 4. Update Bot Configuration & Theme
export const updateBot = asyncHandler(async (req, res) => {
  const { name, systemPrompt, appearance, allowedDomains, isActive } = req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (systemPrompt !== undefined) {
    updateFields.systemPrompt = systemPrompt.trim() ? systemPrompt.trim() : DEFAULT_SYSTEM_PROMPT;
  }
  if (appearance !== undefined) updateFields.appearance = appearance;
  if (allowedDomains !== undefined) updateFields.allowedDomains = allowedDomains;
  if (isActive !== undefined) updateFields.isActive = isActive;

  const bot = await Bot.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    updateFields,
    { new: true, runValidators: true }
  );

  if (!bot) {
    throw new ApiError(404, 'Bot not found or unauthorized access');
  }

  return res.status(200).json({
    success: true,
    message: 'Bot updated successfully',
    data: { bot },
  });
});

// 5. Delete Bot
export const deleteBot = asyncHandler(async (req, res) => {
  const bot = await Bot.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!bot) {
    throw new ApiError(404, 'Bot not found or unauthorized access');
  }

  return res.status(200).json({
    success: true,
    message: 'Bot deleted successfully',
  });
});