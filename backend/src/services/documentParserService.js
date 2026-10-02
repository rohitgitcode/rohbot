import path from 'path';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { parsePdfMultimodal } from './pdfParserService.js';

export const SUPPORTED_FILE_EXTENSIONS = ['pdf', 'docx', 'csv', 'xlsx', 'txt', 'md'];

/**
 * Detect supported file type from filename
 */
export const getFileTypeFromFilename = (filename = '') => {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  return SUPPORTED_FILE_EXTENSIONS.includes(ext) ? ext : null;
};

/**
 * Multi-format document parser supporting PDF, DOCX, CSV, XLSX, TXT, and MD
 */
export const parseDocument = async (fileBuffer, fileType) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('File buffer is empty');
  }

  const normalizedType = (fileType || '').toLowerCase().trim();

  switch (normalizedType) {
    case 'pdf': {
      return await parsePdfMultimodal(fileBuffer);
    }

    case 'docx': {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return (result.value || '').trim();
    }

    case 'xlsx': {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetTexts = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;
        const csvContent = XLSX.utils.sheet_to_csv(sheet);
        if (csvContent && csvContent.trim()) {
          sheetTexts.push(`### Sheet: ${sheetName}\n${csvContent.trim()}`);
        }
      }
      return sheetTexts.join('\n\n').trim();
    }

    case 'csv': {
      const rawText = fileBuffer.toString('utf-8').replace(/^\uFEFF/, '');
      return rawText.trim();
    }

    case 'md':
    case 'txt':
    default: {
      const text = fileBuffer.toString('utf-8').replace(/^\uFEFF/, '');
      return text.trim();
    }
  }
};
