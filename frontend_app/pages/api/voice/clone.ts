import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import { parseForm } from '@/lib/parse-form';

export const config = {
  api: {
    bodyParser: false, // Disabling built-in bodyParser
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Parse the multipart form data
    const { files } = await parseForm(req);
    
    // Get the voice file
    const voiceFile = files.voice?.[0];
    if (!voiceFile) {
      return res.status(400).json({ message: 'Voice file is required' });
    }
    
    // Create a new FormData to send to the backend
    const formData = new FormData();
    
    // Read the file and append it to FormData
    const fileContent = fs.readFileSync(voiceFile.filepath); // Read as a buffer
    formData.append('audio_file', fileContent, {
      filename: voiceFile.originalFilename || 'voice.wav',
      contentType: voiceFile.mimetype || 'audio/wav',
    });
    
    // Add shareForTraining parameter if present
    const shareForTraining = req.headers['x-share-for-training'] === 'true';
    formData.append('share_for_training', String(shareForTraining));
    
    // Call the backend API
    const cloneResponse = await fetch(`${process.env.BACKEND_API_URL}/voice/clone`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
    });
    
    // Clean up temporary file
    fs.unlinkSync(voiceFile.filepath);
    
    if (!cloneResponse.ok) {
      const errorText = await cloneResponse.text();
      throw new Error(`Failed to clone voice: ${errorText}`);
    }
    
    const data = await cloneResponse.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Error cloning voice:', error);
    return res.status(500).json({ 
      message: 'Failed to clone voice', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
