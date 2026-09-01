import Groq from 'groq-sdk';
import Chat from '../models/Chat.js';
import Bot from '../models/Bot.js';
import { searchRelevantContext } from '../services/ragService.js';
import { isGibberish } from '../utils/inputValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Helper: Sanitizes reasoning tokens & preamble leaks from LLM responses
 */
const sanitizeAiResponse = (rawReply) => {
  if (!rawReply || typeof rawReply !== 'string') return '';

  let cleaned = rawReply;

  // 1. Remove XML/HTML style thinking tags (<think>...</think>)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');

  // 2. Strip explicit reasoning preamble blocks
  const reasoningKeywords = [
    'the user is asking',
    'i need to check',
    'the context lists sections',
    'therefore, i must follow',
    'plan:',
    'i must strictly follow'
  ];

  const lowerCleaned = cleaned.toLowerCase();
  const hasReasoningLeak = reasoningKeywords.some(keyword => lowerCleaned.includes(keyword));

  if (hasReasoningLeak) {
    const lines = cleaned.split('\n');
    const answerStartIndex = lines.findIndex(line => {
      const trimmed = line.trim();
      return (
        trimmed.startsWith('Based on') ||
        trimmed.startsWith('According to') ||
        trimmed.startsWith('Here') ||
        trimmed.startsWith('The provided') ||
        trimmed.startsWith('Section') ||
        trimmed.startsWith('Chapter') ||
        trimmed.startsWith('1.') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('-')
      );
    });

    if (answerStartIndex !== -1) {
      cleaned = lines.slice(answerStartIndex).join('\n');
    }
  }

  // 3. Remove thinking headers
  cleaned = cleaned.replace(/^(Thinking Process|Plan|Self-Correction|Chain of Thought):?\s*/gi, '');

  return cleaned.trim();
};

const isCasualGreeting = (text) => {
  const cleanText = text.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '');
  const greetings = ['hi', 'hello', 'hy', 'hey', 'good morning', 'good evening', 'how are you', 'sup', 'thanks', 'thank you'];
  return greetings.includes(cleanText);
};

// ==========================================
// 1. Send Message / Continue Chat (RAG AI)
// ==========================================
export const sendMessage = asyncHandler(async (req, res) => {
  const { message, chatId, botId } = req.body;
  const userId = req.user._id;

  // Validations
  if (!message) {
    throw new ApiError(400, 'Message is required');
  }

  if (message.length > 1000) {
    throw new ApiError(400, 'Message too long. Please keep your question under 1000 characters.');
  }

  // Gibberish Filter (Graceful Handling)
  if (isGibberish(message)) {
    return res.status(200).json({
      success: true,
      reply: "It looks like your message didn't contain recognizable words. Please ask a clear question related to your uploaded documents!",
      chatId: chatId || null
    });
  }

  let chat;

  // Check thread existence & user ownership
  if (chatId) {
    chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      throw new ApiError(404, 'Chat thread not found or unauthorized access');
    }
  } else {
    chat = new Chat({
      userId,
      botId: botId || null,
      title: message.length > 30 ? message.substring(0, 30) + '...' : message,
      messages: [],
    });
  }

  const targetBotId = chat.botId || botId;

  // Fetch custom bot instructions
  let botInstruction = 'You are a helpful AI assistant.';
  if (targetBotId) {
    const bot = await Bot.findById(targetBotId);
    if (bot && bot.systemPrompt) {
      botInstruction = bot.systemPrompt;
    }
  }

  // Retrieve vector context (Non-fatal try/catch for RAG fallback)
  let retrievedContext = '';
  if (targetBotId) {
    try {
      let retrievedChunks = await searchRelevantContext(message, targetBotId);
      if (Array.isArray(retrievedChunks)) {
        retrievedChunks = retrievedChunks.slice(0, 3);
        retrievedContext = retrievedChunks
          .map(c => typeof c === 'string' ? c : (c?.payload?.text || c?.text || ''))
          .filter(Boolean)
          .join('\n\n');

        if (retrievedContext.length > 1500) {
          retrievedContext = retrievedContext.substring(0, 1500) + '...';
        }
      }
    } catch (ragErr) {
      console.warn('⚠️ RAG Search Warning (Falling back to baseline LLM):', ragErr.message);
    }
  }

  const isGreeting = isCasualGreeting(message);

  // Build System Prompt
  const systemPrompt = isGreeting
    ? `${botInstruction}\n\nThe user is greeting you or making casual conversation. Respond politely, naturally, and concisely. Do not complain about missing documents.`
    : `
${botInstruction}

You are an advanced, intelligent AI Assistant. You have access to the "Relevant Knowledge Base Context" below.

Relevant Knowledge Base Context:
${retrievedContext ? retrievedContext : 'NO_CONTEXT_FOUND'}

CRITICAL OUTPUT & FORMATTING RULES:
1. Provide a comprehensive, clear, and high-quality answer to the user's question based primarily on the provided context.
2. If the context does not contain the full answer, you may supplement it with your own general knowledge, but try to remain relevant to the workspace topic. Be helpful and natural.
3. Use Markdown formatting (bolding, lists, code blocks, etc.) to structure your response beautifully and make it easy to read.
4. DIRECT FINAL RESPONSE ONLY: NEVER include your internal thinking process, chain-of-thought, self-corrections, or analysis in your reply. Do not use <think> tags.
5. Be polite and professional.
`.trim();

  // Prepare history & call Groq API
  chat.messages.push({ role: 'user', content: message });

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const chatCompletion = await groq.chat.completions.create({
    messages: apiMessages,
    model: 'qwen/qwen3.6-27b',
    max_tokens: 1500,
  });

  const rawAiResponse = chatCompletion.choices[0]?.message?.content || '';
  const cleanedReply = sanitizeAiResponse(rawAiResponse);

  chat.messages.push({
    role: 'assistant',
    content: cleanedReply,
    hasContext: !!retrievedContext
  });

  await chat.save();

  return res.status(200).json({
    success: true,
    chatId: chat._id,
    reply: cleanedReply,
    hasContext: !!retrievedContext,
    chatHistory: chat.messages,
  });
});

// ==========================================
// 2. Get All User Chats for Sidebar
// ==========================================
export const getUserChats = asyncHandler(async (req, res) => {
  const { botId } = req.query;
  if (!botId) {
    throw new ApiError(400, 'botId query parameter is required for workspace isolation');
  }

  const chats = await Chat.find({ userId: req.user._id, botId })
    .select('title createdAt updatedAt botId')
    .sort({ updatedAt: -1 });

  return res.status(200).json({
    success: true,
    results: chats.length,
    data: { chats },
  });
});

// ==========================================
// 3. Get Specific Chat History by ID
// ==========================================
export const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });

  if (!chat) {
    throw new ApiError(404, 'Chat thread not found or unauthorized access');
  }

  return res.status(200).json({
    success: true,
    data: { chat },
  });
});

// ==========================================
// 4. Delete Single Chat Thread
// ==========================================
export const deleteChatThread = asyncHandler(async (req, res) => {
  const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!chat) {
    throw new ApiError(404, 'Chat thread not found or unauthorized access');
  }

  return res.status(200).json({
    success: true,
    message: 'Thread deleted successfully',
  });
});

// ==========================================
// 5. Bulk Delete Chat Threads
// ==========================================
export const bulkDeleteChatThreads = asyncHandler(async (req, res) => {
  const { threadIds } = req.body;

  if (!threadIds || !Array.isArray(threadIds)) {
    throw new ApiError(400, 'threadIds array is required');
  }

  const result = await Chat.deleteMany({
    _id: { $in: threadIds },
    userId: req.user._id
  });

  return res.status(200).json({
    success: true,
    deletedCount: result.deletedCount,
    message: `${result.deletedCount} threads deleted successfully`
  });
});