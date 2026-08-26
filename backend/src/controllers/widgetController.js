import Groq from 'groq-sdk';
import Bot from '../models/Bot.js';
import { searchRelevantContext } from '../services/ragService.js';
import { isGibberish } from '../utils/inputValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Utility function to scrub any leaked reasoning blocks, internal logs, or thinking headers.
 */
const sanitizeAiResponse = (rawReply) => {
    if (!rawReply || typeof rawReply !== 'string') return '';
    let cleaned = rawReply;
    
    // 1. Remove XML/HTML style thinking tags
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

// ============================================================
// Public Chat API (For Embedded Website Widgets)
// ============================================================
export const publicChat = asyncHandler(async (req, res) => {
    const { botId, message, sessionId, history = [] } = req.body;

    // 1. Request Validations
    if (!botId) {
        throw new ApiError(400, 'botId is required for public chat');
    }

    if (!message) {
        throw new ApiError(400, 'Message is required');
    }

    if (message.length > 1000) {
        throw new ApiError(400, 'Message too long. Please keep your question under 1000 characters.');
    }

    // 2. Gibberish Detection (Graceful UI Response)
    if (isGibberish(message)) {
        return res.status(200).json({
            success: true,
            reply: "It looks like your message didn't contain recognizable words. Please ask a clear question related to our knowledge base!",
            sessionId: sessionId || `session_${Date.now()}`
        });
    }

    // 3. Bot Existence & Status Check
    const bot = await Bot.findById(botId);
    if (!bot) {
        throw new ApiError(404, 'Widget bot not found or inactive');
    }

    if (!bot.isActive) {
        throw new ApiError(403, 'This widget has been disabled by the owner.');
    }

    // 4. Greeting Check & Context Retrieval (RAG)
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|howdy)[\s\p{P}]*$/i.test(message.trim());
    let retrievedContext = '';

    if (!isGreeting) {
        try {
            const results = await searchRelevantContext(message, botId);
            if (Array.isArray(results)) {
                retrievedContext = results
                    .map(c => typeof c === 'string' ? c : (c?.payload?.text || c?.text || ''))
                    .filter(Boolean)
                    .map((r, i) => `Excerpt ${i + 1}:\n${r}`)
                    .join('\n\n');
            }
        } catch (ragErr) {
            console.warn('⚠️ Public Widget RAG Warning:', ragErr.message);
        }
    }

    const botInstruction = bot.systemPrompt || 'You are a helpful assistant.';

    // 5. Build Guardrailed System Prompt
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

    const apiMessages = [
        { role: 'system', content: systemPrompt }
    ];

    // 6. Append context history to retain conversational state
    if (Array.isArray(history)) {
        history.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'bot' || msg.role === 'assistant') {
                apiMessages.push({
                    role: msg.role === 'bot' ? 'assistant' : msg.role,
                    content: msg.content
                });
            }
        });
    }

    // Append current user message
    apiMessages.push({ role: 'user', content: message });

    // 7. Invoke Groq LLM
    const chatCompletion = await groq.chat.completions.create({
        messages: apiMessages,
        model: 'qwen/qwen3.6-27b',
        max_tokens: 800,
        reasoning_format: 'hidden',
    });

    const rawAiResponse = chatCompletion.choices[0]?.message?.content || '';
    const cleanedReply = sanitizeAiResponse(rawAiResponse);

    // 8. Track Message Usage Atomically
    await Bot.findByIdAndUpdate(botId, {
        $inc: { 'usage.messageCount': 1 }
    });

    return res.status(200).json({
        success: true,
        reply: cleanedReply,
        hasContext: !!retrievedContext,
        sessionId: sessionId || `session_${Date.now()}`
    });
});