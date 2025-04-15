import { NextApiRequest, NextApiResponse } from 'next';
import { getElizaService } from '../../../eliza';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, character } = req.body;

    // Validate request parameters
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text parameter is required and must be a string' });
    }

    if (!character || typeof character !== 'string') {
      return res.status(400).json({ error: 'Character parameter is required and must be a string' });
    }

    // Get the Eliza service
    const elizaService = getElizaService();

    // Rephrase the text with the selected character
    const rephrasedText = await elizaService.rephraseWithCharacter(text, character);

    // Return the rephrased text
    return res.status(200).json({ text: rephrasedText });
  } catch (error: any) {
    console.error('Error in character rephrasing API:', error);
    return res.status(500).json({ 
      error: 'An error occurred while rephrasing the text',
      message: error.message 
    });
  }
} 