import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { withAuth } from '../../../middleware/withAuth';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    
    if (!files.audio || !files.audio[0]) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFile = files.audio[0];
    const tools = fields.tools ? JSON.parse(fields.tools[0]) : [];

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFile.filepath);

    // Make request to your backend voice processing endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: audioBuffer.toString('base64'),
        tools: tools,
      }),
    });

    const data = await response.json();

    // Clean up the temporary file
    fs.unlinkSync(audioFile.filepath);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error processing voice message:', error);
    return res.status(500).json({ error: 'Error processing voice message' });
  }
}

export default withAuth(handler); 