import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import { parseForm } from '@/lib/parse-form';
import lighthouse from '@lighthouse-web3/sdk';

interface EncryptedResponse {
  encrypted_voice: string;
  original_filename: string;
  id: string;
}

interface LighthouseResponse {
  data: {
    Name: string;
    Hash: string;
    Size: string;
  }
}

interface CloneResponse {
  message: string;
  [key: string]: any;
}

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
  const shareForTraining = req.headers['x-share-for-training'] === 'true';
  let parsedFiles;

  try {
    // Parse the multipart form data
    const { files } = await parseForm(req);
    parsedFiles = files;
    
    // Get the voice file
    const voiceFile = files.voice?.[0];
    if (!voiceFile) {
      return res.status(400).json({ message: 'Voice file is required' });
    }
    
    // Create a new FormData to send to the backend
    const formData = new FormData();
    
    // Read the file and append it to FormData
    const fileContent = fs.readFileSync(voiceFile.filepath); // Read as a buffer

    if (shareForTraining) {
      // If shareForTraining is true, first get the encrypted version
      formData.append('audio_file', fileContent, {
        filename: voiceFile.originalFilename || 'voice.wav',
        contentType: voiceFile.mimetype || 'audio/wav',
      });

      // Call the encryption endpoint
      const encryptResponse = await fetch(`${process.env.BACKEND_API_URL}/voice/share-for-training`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        },
      });

      if (!encryptResponse.ok) {
        const errorText = await encryptResponse.text();
        throw new Error(`Failed to encrypt voice: ${errorText}`);
      }

      const encryptedData = await encryptResponse.json() as EncryptedResponse;

      // Upload encrypted data to IPFS using Lighthouse
      const apiKey = process.env.LIGHTHOUSE_API_KEY;
      if (!apiKey) {
        throw new Error('Lighthouse API key not found');
      }

      // Prepare data for Lighthouse
      const jsonData = {
        encrypted_voice: encryptedData.encrypted_voice,
        original_filename: encryptedData.original_filename,
        timestamp: new Date().toISOString()
      };

      // Upload to Lighthouse
      const response = await lighthouse.uploadText(
        JSON.stringify(jsonData),
        apiKey,
        encryptedData.original_filename
      ) as LighthouseResponse;

      // Save the voice with the IPFS hash
      const ipfsResponse = await fetch(`${process.env.BACKEND_API_URL}/voice/save/ipfs/${response.data.Hash}/${encryptedData.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!ipfsResponse.ok) {
        const errorText = await ipfsResponse.text();
        throw new Error(`Failed to save IPFS voice: ${errorText}`);
      }

      const data = await ipfsResponse.json() as CloneResponse;

      return res.status(200).json({
        message: data.message,
      });

    } else {
      // If not sharing for training, proceed with normal voice cloning
      formData.append('audio_file', fileContent, {
        filename: voiceFile.originalFilename || 'voice.wav',
        contentType: voiceFile.mimetype || 'audio/wav',
      });
      formData.append('share_for_training', 'false');
      
      // Call the backend API
      const cloneResponse = await fetch(`${process.env.BACKEND_API_URL}/voice/clone`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        },
      });

      if (!cloneResponse.ok) {
        const errorText = await cloneResponse.text();
        throw new Error(`Failed to clone voice: ${errorText}`);
      }

      const data = await cloneResponse.json() as CloneResponse;
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error('Error processing voice:', error);
    return res.status(500).json({ 
      message: 'Failed to process voice', 
      error: error instanceof Error ? error.message : String(error) 
    });
  } finally {
    // Clean up temporary file
    if (parsedFiles?.voice?.[0]?.filepath) {
      fs.unlinkSync(parsedFiles.voice[0].filepath);
    }
  }
}
