import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get list of character files directly - fix path to the correct location
    const charactersDir = path.join(process.cwd(), 'eliza', 'characters');
    
    // Log the path for debugging
    console.log('Characters directory path:', charactersDir);
    
    // Check if directory exists
    if (!fs.existsSync(charactersDir)) {
      console.error('Characters directory not found:', charactersDir);
      return res.status(500).json({ 
        error: 'Characters directory not found',
        path: charactersDir
      });
    }
    
    const files = fs.readdirSync(charactersDir);
    console.log('Character files found:', files);
    
    // Extract character names from filenames
    const characters = files
      .filter(file => file.endsWith('.character.json'))
      .map(file => {
        // Read the character file to get the name
        const characterPath = path.join(charactersDir, file);
        try {
          const characterContent = fs.readFileSync(characterPath, 'utf8');
          const characterData = JSON.parse(characterContent);
          console.log(`Character data for ${file}:`, characterData.name);
          return characterData.name;
        } catch (err) {
          console.error(`Error reading character file ${file}:`, err);
          // Return the file name without extension as fallback
          const fallbackName = file.replace('.character.json', '');
          console.log(`Using fallback name for ${file}:`, fallbackName);
          return fallbackName;
        }
      });

    console.log('Returning character list:', characters);
    
    // Return the list of characters
    return res.status(200).json({ characters });
  } catch (error: any) {
    console.error('Error in character list API:', error);
    return res.status(500).json({ 
      error: 'An error occurred while retrieving the character list',
      message: error.message 
    });
  }
} 