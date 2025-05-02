import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get list of character files
    const charactersDir = path.join(process.cwd(), 'eliza', 'characters');
    const files = fs.readdirSync(charactersDir);
    
    // Extract character names from filenames
    const characters = files
      .filter(file => file.endsWith('.character.json'))
      .map(file => {
        // Read the character file to get the name
        const characterPath = path.join(charactersDir, file);
        const characterData = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
        return characterData.name;
      });

    // Return the list of characters
    return res.status(200).json({ characters });
  } catch (error: any) {
    console.error('Error in characters API:', error);
    return res.status(500).json({ 
      error: 'An error occurred while retrieving the character list',
      message: error.message 
    });
  }
} 