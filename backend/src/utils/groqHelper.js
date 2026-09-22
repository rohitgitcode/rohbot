import Groq from 'groq-sdk';

export const getGroqClient = () => {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Get available models from Groq API
 */
export const getAvailableModels = async () => {
  try {
    const groq = getGroqClient();
    const list = await groq.models.list();
    return (list.data || []).map(m => m.id);
  } catch (err) {
    console.warn('⚠️ [Groq] Could not list models:', err.message);
    return [];
  }
};

/**
 * Robust Groq Chat Completion with multi-model fallback
 */
export const createChatCompletionWithFallback = async ({ messages, maxTokens = 1500, temperature = 0.7 }) => {
  const groq = getGroqClient();
  const available = await getAvailableModels();

  if (available.length > 0) {
    console.log(`📋 [Groq] Available Models (${available.length}):`, available.join(', '));
  }
  
  // Build a prioritized list of candidate models
  const candidates = [];
  if (process.env.GROQ_MODEL) candidates.push(process.env.GROQ_MODEL);

  const preferred = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
    'deepseek-r1-distill-llama-70b'
  ];

  if (available.length > 0) {
    // 1. Add known preferred models that are in available list
    for (const m of preferred) {
      if (available.includes(m) && !candidates.includes(m)) {
        candidates.push(m);
      }
    }
    // 2. Add any other general text models from available list
    for (const m of available) {
      if (!candidates.includes(m) && !m.includes('whisper') && !m.includes('guard') && !m.includes('vision')) {
        candidates.push(m);
      }
    }
  }

  // 3. If candidates is still empty (e.g. list API failed), use default preferred
  if (candidates.length === 0) {
    for (const m of preferred) {
      if (!candidates.includes(m)) candidates.push(m);
    }
  }

  let lastError = null;
  for (const model of candidates) {
    try {
      console.log(`🤖 [Groq] Calling model: '${model}'...`);
      const completion = await groq.chat.completions.create({
        messages,
        model,
        max_tokens: maxTokens,
        temperature,
      });
      console.log(`✅ [Groq] Successful completion from: '${model}'`);
      return completion;
    } catch (err) {
      console.warn(`⚠️ [Groq] Model '${model}' failed: ${err.message}. Trying next available model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq candidate models failed to generate response');
};
