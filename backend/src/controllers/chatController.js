import Groq from 'groq-sdk';
import Chat from '../models/Chat.js';

// 1. Send Message / Continue Chat
export const sendMessage = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { message, chatId } = req.body;
    const userId = req.user._id; // Extracted from authMiddleware

    if (!message) {
      return res.status(400).json({ status: 'fail', message: 'Message is required' });
    }

    let chat;

    // Check if continuing an existing thread or creating a new one
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) {
        return res.status(404).json({ status: 'fail', message: 'Chat thread not found' });
      }
    } else {
      // Create new chat session with an initial auto-generated title
      chat = new Chat({
        userId,
        title: message.length > 30 ? message.substring(0, 30) + '...' : message,
        messages: [],
      });
    }

    // Append user message to thread history
    chat.messages.push({ role: 'user', content: message });

    // Call Groq API with Qwen 2.5 32B model
    const chatCompletion = await groq.chat.completions.create({
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      model: 'qwen/qwen3.6-27b',
    });

    const aiResponseText = chatCompletion.choices[0]?.message?.content || '';

    // Append AI response to thread history
    chat.messages.push({ role: 'assistant', content: aiResponseText });

    // Save updated conversation thread in MongoDB
    await chat.save();

    res.status(200).json({
      status: 'success',
      chatId: chat._id,
      reply: aiResponseText,
      chatHistory: chat.messages,
    });
  } catch (error) {
    console.error('Groq Qwen Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate AI response' });
  }
};

// 2. Get All User Chats (For Sidebar List)
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({ status: 'success', chats });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Get Specific Chat History by ID
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ status: 'fail', message: 'Chat thread not found' });
    }
    res.status(200).json({ status: 'success', chat });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};