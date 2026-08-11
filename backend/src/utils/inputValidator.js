/**
 * Validates if the user input is a gibberish string or keyboard smash.
 * @param {string} text 
 * @returns {boolean} True if gibberish is detected
 */
export const isGibberish = (text) => {
  if (!text || typeof text !== 'string') return true;

  // Clean the text to just alphabetic characters for analysis
  const cleanText = text.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (cleanText.length === 0) return false;

  // 1. Long continuous string without spaces (keyboard smash)
  const words = text.trim().split(/\s+/);
  const hasExtremelyLongWord = words.some(word => word.length > 20);

  // 2. Consonant/Vowel Ratio (Long strings without vowels)
  // Look for 6 or more consecutive consonants
  const tooManyConsonants = /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(cleanText);

  // 3. Repeating characters (e.g. "aaaaa")
  // Look for 5 or more of the same character in a row
  const repeatedChars = /(.)\1{4,}/i.test(cleanText);

  return hasExtremelyLongWord || tooManyConsonants || repeatedChars;
};
