import Groq from 'groq-sdk';
import Bot from '../models/Bot.js';
import { searchRelevantContext } from '../services/ragService.js';
import { isGibberish } from '../utils/inputValidator.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sanitizeAiResponse = (rawReply) => {
  if (!rawReply || typeof rawReply !== 'string') return '';
  let cleaned = rawReply;
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');
  
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
  
  cleaned = cleaned.replace(/^(Thinking Process|Plan|Self-Correction|Chain of Thought):?\s*/gi, '');
  return cleaned.trim();
};

export const publicChat = async (req, res) => {
  try {
    const { botId, message, sessionId } = req.body;

    if (!botId) {
      return res.status(400).json({ status: 'fail', message: 'botId is required for public chat' });
    }
    
    if (!message) {
      return res.status(400).json({ status: 'fail', message: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ status: 'fail', message: 'Message too long. Please keep your question under 1000 characters.' });
    }

    if (isGibberish(message)) {
      return res.status(200).json({
        status: 'success',
        reply: "It looks like your message didn't contain recognizable words. Please ask a clear question related to our knowledge base!",
        sessionId
      });
    }

    const bot = await Bot.findById(botId);
    if (!bot) {
      return res.status(404).json({ status: 'fail', message: 'Widget bot not found or inactive' });
    }

    if (!bot.isActive) {
      return res.status(403).json({ status: 'fail', message: 'This widget has been disabled.' });
    }

    // Attempt to RAG search
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|howdy)[\s\p{P}]*$/i.test(message.trim());
    let retrievedContext = '';
    
    if (!isGreeting) {
      const results = await searchRelevantContext(message, botId);
      retrievedContext = results.map((r, i) => `Excerpt ${i + 1}:\n${r.text}`).join('\n\n');
    }

    const botInstruction = bot.systemPrompt || 'You are a helpful assistant.';
    
    const systemPrompt = isGreeting
      ? `${botInstruction}\n\nThe user is greeting you or making casual conversation. Respond politely, naturally, and concisely. Do not complain about missing documents.`
      : `
${botInstruction}

You are a strict Document Grounded Assistant. Your primary knowledge base is provided in the "Relevant Knowledge Base Context" block below.

Relevant Knowledge Base Context:
${retrievedContext ? retrievedContext : 'NO_CONTEXT_FOUND'}

CRITICAL OUTPUT & FORMATTING RULES:
1. DIRECT FINAL RESPONSE ONLY: NEVER include your internal thinking process, chain-of-thought, self-corrections, or analysis in your reply.
2. NO THINKING HEADERS: NEVER write headers like "Thinking Process:", "Self-Correction:", "Excerpt 1:", or "Drafting Response:".
3. NO REASONING TAGS: Do NOT wrap any text inside <think> or <reasoning> tags.
4. STRICT RAG GROUNDING:
   - You MUST ONLY answer questions using the explicit facts and information provided in the "Relevant Knowledge Base Context" above.
   - If the user's question cannot be directly answered using ONLY the context provided above (or if context is NO_CONTEXT_FOUND), you MUST politely refuse to answer using exactly this response:
     "I am sorry, but I don't have information about that in the uploaded document knowledge base."
   - DO NOT use your general pre-trained knowledge or external facts to answer questions outside the context.
5. RAG & OUTLINE HANDLING:
   - If the user asks for detailed explanations, but the retrieved context only contains section titles, indexes, or table-of-contents headings:
     a. List the relevant section headings found in the context clearly.
     b. Politely inform the user that the current context contains the document outline/index and suggest importing the specific chapter/sub-page for full details.
   - NEVER output internal reasoning, self-questioning, or chain-of-thought analysis.
`.trim();

    // In a full implementation, you would store this chat thread via sessionId. 
    // For this widget MVP, we will only pass the latest user message.
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'qwen/qwen3.6-27b',
      max_tokens: 800,
      reasoning_format: 'hidden',
    });

    const rawAiResponse = chatCompletion.choices[0]?.message?.content || '';
    const cleanedReply = sanitizeAiResponse(rawAiResponse);

    // Update bot usage stats (simplified)
    await Bot.findByIdAndUpdate(botId, {
      $inc: { 'usage.messageCount': 1 }
    });

    res.status(200).json({
      status: 'success',
      reply: cleanedReply,
      hasContext: !!retrievedContext,
      sessionId: sessionId || `session_${Date.now()}`
    });

  } catch (error) {
    console.error('Widget Chat Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
