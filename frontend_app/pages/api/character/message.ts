import { NextApiRequest, NextApiResponse } from 'next';
import { ElizaService } from '../../../eliza/ElizaService';

// Create an instance of ElizaService for server-side processing
let elizaService: ElizaService | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, character } = req.body;

    // Validate request parameters
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message parameter is required and must be a string' });
    }

    if (!character || typeof character !== 'string') {
      return res.status(400).json({ error: 'Character parameter is required and must be a string' });
    }

    // Initialize ElizaService if not already done
    if (!elizaService) {
      elizaService = new ElizaService();
      await elizaService.startEliza();
    }

    // Send the message to the character
    const response = await elizaService.sendMessage(message, character);

    // Return the response
    return res.status(200).json({ response });
  } catch (error: any) {
    console.error('Error in message API:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing the message',
      message: error.message 
    });
  }
} 