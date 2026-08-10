import Groq from 'groq-sdk';
import Chat from '../models/Chat.js';
import Bot from '../models/Bot.js';
import { searchRelevantContext } from '../services/ragService.js';

// 1. Send Message / Continue Chat (RAG-Enabled)
export const sendMessage = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { message, chatId, botId } = req.body;
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
        const retrievedChunks = await searchRelevantContext(message, targetBotId);
        retrievedContext = Array.isArray(retrievedChunks) 
          ? retrievedChunks.map(c => typeof c === 'string' ? c : (c?.payload?.text || c?.text || '')).filter(Boolean).join('\n\n')
          : '';
        console.log("🔍 RAG Query:", { botId: targetBotId, message, contextLength: retrievedContext.length })
      } catch (ragErr) {
        console.warn('⚠️ RAG Search Warning:', ragErr.message);
      }
    }

    // Construct full System Prompt with Knowledge Base Context
    const systemPrompt = `
${botInstruction}

You are a strict Document Grounded Assistant. Your primary knowledge base is provided in the "Relevant Knowledge Base Context" block below.

Relevant Knowledge Base Context:
${retrievedContext ? retrievedContext : 'NO_CONTEXT_FOUND'}

CRITICAL STRICT RULES:
1. You MUST ONLY answer questions using the explicit facts and information provided in the "Relevant Knowledge Base Context" above.
2. If the user's question cannot be directly answered using ONLY the context provided above (or if context is NO_CONTEXT_FOUND), you MUST politely refuse to answer.
3. You MUST use exactly this response when refusing: "I am sorry, but I don't have information about that in the uploaded document knowledge base."
4. DO NOT use your general pre-trained knowledge or external facts (e.g., general networking, world leaders, news, general tech) to answer questions outside the context.
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

    // Call Groq API with Qwen model
    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'qwen/qwen3.6-27b',
    });

    const rawAiResponse = chatCompletion.choices[0]?.message?.content || '';

    // Clean out internal reasoning <think>...</think> tags from thinking models
    const cleanedReply = rawAiResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Append cleaned AI response to thread history
    chat.messages.push({ role: 'assistant', content: cleanedReply });

    // Save updated conversation thread in MongoDB
    await chat.save();

    res.status(200).json({
      status: 'success',
      chatId: chat._id,
      reply: cleanedReply,
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