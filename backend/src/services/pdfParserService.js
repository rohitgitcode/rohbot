import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import Groq from 'groq-sdk';
import { extractText } from 'unpdf';

// Dynamically load pdf-poppler ONLY on Windows to avoid crashing on Linux/Render
let pdfPoppler = null;
if (process.platform === 'win32') {
  try {
    const popplerModule = await import('pdf-poppler');
    pdfPoppler = popplerModule.default || popplerModule;
  } catch (err) {
    console.warn('[PDF Processor] Failed to load pdf-poppler:', err.message);
  }
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PROMPT = `
You are an expert document OCR and layout analyzer.
Parse the provided document page into clean, structured Markdown text adhering to these rules:
1. TABLES: Convert all tables into clean Markdown table format (| Header | Header |). Maintain exact row/column alignment.
2. IMAGES/CHARTS/DIAGRAMS: Describe any charts, diagrams, or images in detail inside a block: [Image Description: ...].
3. TEXT & HEADINGS: Keep natural heading hierarchy (#, ##, ###) and paragraph text intact.
Do not add any conversational meta-commentary, return ONLY the formatted markdown content.
`;

export const parsePdfMultimodal = async (fileBuffer) => {
  const tempDir = os.tmpdir();
  const sessionId = uuidv4();
  const pdfPath = path.join(tempDir, `${sessionId}.pdf`);
  const imageFiles = [];

  try {
    const uint8Array = new Uint8Array(fileBuffer);
    const extractedData = await extractText(uint8Array);
    const pageTexts = extractedData.text || [];

    // Fallback if running on Linux (or if poppler is unavailable)
    if (!pdfPoppler) {
      console.log(`[PDF Parser] Running on ${process.platform} — using unpdf text extraction.`);
      if (Array.isArray(pageTexts)) {
        return pageTexts.join('\n\n').trim();
      }
      return (pageTexts || '').trim();
    }

    // 1. Write the PDF to a temporary file for poppler (Windows)
    await fs.writeFile(pdfPath, fileBuffer);

    // 2. Convert PDF pages to images
    const opts = {
      format: 'jpeg',
      out_dir: tempDir,
      out_prefix: sessionId,
      page: null, // all pages
    };

    await pdfPoppler.convert(pdfPath, opts);

    // 3. Find generated images
    const files = await fs.readdir(tempDir);
    const regex = new RegExp(`^${sessionId}-0*(\\d+)\\.jpg$`);

    for (const file of files) {
      if (regex.test(file)) {
        imageFiles.push(file);
      }
    }

    // Sort correctly by page number
    imageFiles.sort((a, b) => {
      const aNum = parseInt(a.match(regex)[1], 10);
      const bNum = parseInt(b.match(regex)[1], 10);
      return aNum - bNum;
    });

    if (imageFiles.length === 0) {
      throw new Error('No images were generated from the PDF.');
    }

    // 4. Hybrid Strategy & Parallel Batching
    const needsVision = (text) => {
      if (!text || text.trim().length < 50) return true;

      const lower = text.toLowerCase();
      if (/(?:figure|table|chart|diagram|image)\s+\d+/i.test(lower)) return true;

      const lines = text.split('\n');
      let tableLikeLines = 0;
      for (const line of lines) {
        if (line.split(/\s{3,}/).length >= 3) {
          tableLikeLines++;
        }
      }
      return tableLikeLines >= 3;
    };

    let fullMarkdown = '';
    const BATCH_SIZE = 5;

    const processPage = async (imageFile, index) => {
      const pageText = pageTexts[index] || '';

      if (!needsVision(pageText)) {
        console.log(`[Hybrid PDF] Page ${index + 1} processed via local text extraction.`);
        return pageText.trim();
      }

      console.log(`[Multimodal PDF] Processing page ${index + 1} with Vision API...`);
      const imgPath = path.join(tempDir, imageFile);
      const imgBuffer = await fs.readFile(imgPath);
      const base64Image = imgBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;

      try {
        const completion = await groq.chat.completions.create({
          model: 'qwen/qwen3.6-27b',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: PROMPT },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        });
        return completion.choices[0]?.message?.content?.trim() || '';
      } catch (err) {
        console.warn(`[Multimodal PDF] Vision API failed for page ${index + 1}, falling back to local text. Error: ${err.message}`);
        return pageText.trim();
      }
    };

    for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
      const batch = imageFiles.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((file, batchIdx) => processPage(file, i + batchIdx));

      const results = await Promise.all(batchPromises);

      for (const res of results) {
        fullMarkdown += `\n\n${res}\n\n`;
      }

      console.log(`⚡ Processed ${Math.min(i + BATCH_SIZE, imageFiles.length)}/${imageFiles.length} pages`);
    }

    return fullMarkdown.trim();
  } catch (err) {
    console.error('Multimodal Parse Error:', err);
    throw err;
  } finally {
    // 5. Cleanup temp files
    await fs.unlink(pdfPath).catch(() => {});
    for (const f of imageFiles) {
      await fs.unlink(path.join(tempDir, f)).catch(() => {});
    }
  }
};