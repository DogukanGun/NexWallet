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
    // Get the list of character files
    const charactersDir = path.join(process.cwd(), 'eliza', 'characters');
    const characterFiles = fs.readdirSync(charactersDir);
    
    // Filter to only include .character.json files and extract character names
    const characters = characterFiles
      .filter(file => file.endsWith('.character.json'))
      .map(file => {
        // Remove the .character.json extension to get the character name
        const characterName = file.replace('.character.json', '');
        
        // Try to read the character file to get more details
        try {
          const characterPath = path.join(charactersDir, file);
          const characterData = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
          return {
            id: characterName,
            name: characterData.name || characterName,
            description: characterData.description || ''
          };
        } catch (error) {
          // If can't read file, just return the name
          return {
            id: characterName,
            name: characterName,
            description: ''
          };
        }
      });
    
    // Return the list of character names
    return res.status(200).json({ characters: characters.map(char => char.id) });
  } catch (error: any) {
    console.error('Error fetching character list:', error);
    return res.status(500).json({ 
      error: 'An error occurred while fetching the character list',
      message: error.message 
    });
  }
} 