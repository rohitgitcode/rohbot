import Groq from 'groq-sdk';
import Chat from '../models/Chat.js';
import Bot from '../models/Bot.js';
import { searchRelevantContext } from '../services/ragService.js';
import { isGibberish } from '../utils/inputValidator.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Utility function to scrub any leaked reasoning blocks, internal logs, or thinking headers.
 */
const sanitizeAiResponse = (rawReply) => {
  if (!rawReply || typeof rawReply !== 'string') return '';

  let cleaned = rawReply;

  // 1. Remove XML/HTML style thinking or reasoning tags
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');

  // 2. Strip explicit reasoning/planning keywords and preamble blocks
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

  // 3. Remove remaining headers at the top
  cleaned = cleaned.replace(/^(Thinking Process|Plan|Self-Correction|Chain of Thought):?\s*/gi, '');

  return cleaned.trim();
};

// 1. Send Message / Continue Chat (RAG-Enabled)
export const sendMessage = async (req, res) => {
  try {
    const { message, chatId, botId } = req.body;
    const userId = req.user._id; // Extracted from authMiddleware

    if (!message) {
      return res.status(400).json({ status: 'fail', message: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ status: 'fail', message: 'Message too long. Please keep your question under 1000 characters.' });
    }

    if (isGibberish(message)) {
      return res.status(200).json({
        status: 'success',
        reply: "It looks like your message didn't contain recognizable words. Please ask a clear question related to your uploaded documents!",
        chatId: chatId || null
      });
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
        botId: botId || null,
        title: message.length > 30 ? message.substring(0, 30) + '...' : message,
        messages: [],
      });
    }

    // Determine target botId strictly from the saved thread to retain session binding
    const targetBotId = chat.botId || botId;

    // Fetch custom bot instructions if available
    let botInstruction = 'You are a helpful AI assistant.';
    if (targetBotId) {
      const bot = await Bot.findById(targetBotId);
      if (bot && bot.systemPrompt) {
        botInstruction = bot.systemPrompt;
      }
    }

    // Retrieve vector context from Qdrant Cloud
    let retrievedContext = '';
    if (targetBotId) {
      try {
        let retrievedChunks = await searchRelevantContext(message, targetBotId);
        
        // Strict Context Chunk Cap (top 3 chunks)
        if (Array.isArray(retrievedChunks)) {
          retrievedChunks = retrievedChunks.slice(0, 3);
          retrievedContext = retrievedChunks
            .map(c => typeof c === 'string' ? c : (c?.payload?.text || c?.text || ''))
            .filter(Boolean)
            .join('\n\n');
            
          // Fallback truncation just in case
          if (retrievedContext.length > 1500) {
            retrievedContext = retrievedContext.substring(0, 1500) + '...';
          }
        }

        console.log("🔍 RAG Query:", { botId: targetBotId, message, contextLength: retrievedContext.length });
      } catch (ragErr) {
        console.warn('⚠️ RAG Search Warning:', ragErr.message);
      }
    }

    const isCasualGreeting = (text) => {
      const cleanText = text.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '');
      const greetings = ['hi', 'hello', 'hy', 'hey', 'good morning', 'good evening', 'how are you', 'sup', 'thanks', 'thank you'];
      return greetings.includes(cleanText);
    };

    const isGreeting = isCasualGreeting(message);

    // Construct full System Prompt with Knowledge Base Context and Strict Output Constraints
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

    // Append user message to thread history
    chat.messages.push({ role: 'user', content: message });

    // Prepare message payload starting with the System Prompt
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Call Groq API with better model
    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'llama-3.1-8b-instant',
      max_tokens: 1500,
    });

    const rawAiResponse = chatCompletion.choices[0]?.message?.content || '';
    const cleanedReply = sanitizeAiResponse(rawAiResponse);

    // Append cleaned AI response to thread history
    chat.messages.push({ 
      role: 'assistant', 
      content: cleanedReply,
      hasContext: !!retrievedContext
    });

    // Save updated conversation thread in MongoDB
    await chat.save();

    res.status(200).json({
      status: 'success',
      chatId: chat._id,
      reply: cleanedReply,
      hasContext: !!retrievedContext,
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
    const { botId } = req.query;
    if (!botId) {
      return res.status(400).json({ status: 'fail', message: 'botId query parameter is required for workspace isolation' });
    }

    const query = { userId: req.user._id, botId };
    
    const chats = await Chat.find(query)
      .select('title createdAt updatedAt botId')
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

// 4. Delete Chat Thread
export const deleteChatThread = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ status: 'fail', message: 'Chat thread not found' });
    }
    res.status(200).json({ status: 'success', message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Bulk Delete Chat Threads
export const bulkDeleteChatThreads = async (req, res) => {
  try {
    const { threadIds } = req.body;
    
    if (!threadIds || !Array.isArray(threadIds)) {
      return res.status(400).json({ status: 'fail', message: 'threadIds array is required' });
    }

    const result = await Chat.deleteMany({ 
      _id: { $in: threadIds }, 
      userId: req.user._id 
    });

    res.status(200).json({ 
      status: 'success', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};