import Bot from '../models/Bot.js';

// 1. Create a New Bot (C1 Dashboard)
export const createBot = async (req, res) => {
  try {
    const { name, systemPrompt, appearance, allowedDomains } = req.body;

    const bot = await Bot.create({
      userId: req.user._id, // Auth middleware se logged-in C1 user ki ID
      name: name || 'My Custom Assistant',
      systemPrompt,
      appearance,
      allowedDomains,
    });

    res.status(201).json({
      status: 'success',
      data: { bot },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 2. Get All Bots for Logged-In C1 User
export const getUserBots = async (req, res) => {
  try {
    // Sort by latest created first
    const bots = await Bot.find({ userId: req.user._id }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bots.length,
      data: { bots },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 3. Get Single Bot by ID (Ownership Checked)
export const getBotById = async (req, res) => {
  try {
    const bot = await Bot.findOne({
      _id: req.params.id,
      userId: req.user._id, // Ensures C1 cannot view someone else's bot
    });

    if (!bot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bot not found or unauthorized access',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { bot },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 4. Update Bot Configuration & Theme
export const updateBot = async (req, res) => {
  try {
    const { name, systemPrompt, appearance, allowedDomains, isActive } = req.body;

    const bot = await Bot.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, systemPrompt, appearance, allowedDomains, isActive },
      { new: true, runValidators: true }
    );

    if (!bot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bot not found or unauthorized access',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { bot },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 5. Delete Bot
export const deleteBot = async (req, res) => {
  try {
    const bot = await Bot.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!bot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bot not found or unauthorized access',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Bot deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};