import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { text, voiceId } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // If voiceId is 'voice1', use OpenAI's text-to-speech
    if (voiceId === 'voice1') {
      const openai = new OpenAI({
        apiKey: process.env.OPEN_AI_KEY
      });

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const base64Audio = buffer.toString("base64");

      return res.status(200).json({
        audioData: base64Audio,
        status: 'success'
      });
    }
    // For other voice IDs, use the backend service
    else {
      const response = await fetch(
        `${process.env.BACKEND_API_URL}/voice/synthesize`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, voice_id: voiceId }),
        }
      );

      if (!response.ok) {
        throw new Error('Backend voice synthesis failed');
      }

      // The backend returns audio data directly
      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString('base64');

      return res.status(200).json({
        audioData: base64Audio,
        status: 'success'
      });
    }

  } catch (error) {
    console.error('Voice processing error:', error);
    return res.status(500).json({ error: 'Voice processing failed' });
  }
} 