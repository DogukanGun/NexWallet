import { NextApiRequest } from 'next';
import formidable from 'formidable';
import { mkdir } from 'fs/promises';
import path from 'path';

// Fix for the FormidableError - using a more compatible approach
export class FormidableError extends Error {
  httpCode: number;
  constructor(message: string, httpCode: number = 500) {
    super(message);
    this.name = 'FormidableError';
    this.httpCode = httpCode;
  }
}

// Configure formidable
export const parseForm = async (
  req: NextApiRequest
) => {
  // Create upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }

  // Configure formidable
  const form = formidable({
    maxFiles: 1,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    uploadDir,
    filename: (_name, _ext, part) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}-${part.originalFilename}`;
      return filename;
    },
    filter: (part) => {
      return part.name === 'voice' && (
        part.mimetype?.includes('audio/') || false
      );
    },
  });

  // Parse the form
  return new Promise<{fields: formidable.Fields, files: formidable.Files}>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
    });
  });
}; 