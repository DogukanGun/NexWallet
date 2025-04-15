import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface CharacterInfo {
  filename: string;
  name?: string;
  description?: string;
  fileSize?: number;
  error?: string;
  exists?: boolean;
}

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
    // Get information about the working directory
    const cwd = process.cwd();
    const elizaDir = path.join(cwd, 'eliza');
    const charactersDir = path.join(elizaDir, 'characters');
    
    // Check if directories exist
    const elizaDirExists = fs.existsSync(elizaDir);
    const charactersDirExists = fs.existsSync(charactersDir);
    
    // Get files listing if available
    let characterFiles: string[] = [];
    let characterData: CharacterInfo[] = [];
    
    if (charactersDirExists) {
      characterFiles = fs.readdirSync(charactersDir);
      
      // Get more details about each character file
      characterData = characterFiles
        .filter(file => file.endsWith('.character.json'))
        .map(file => {
          const characterPath = path.join(charactersDir, file);
          try {
            const content = fs.readFileSync(characterPath, 'utf8');
            const data = JSON.parse(content);
            return {
              filename: file,
              name: data.name,
              description: data.description,
              fileSize: content.length
            };
          } catch (err) {
            return {
              filename: file,
              error: (err as Error).message,
              exists: fs.existsSync(characterPath)
            };
          }
        });
    }
    
    // Return all the debug information
    return res.status(200).json({
      environment: {
        nodeVersion: process.version,
        cwd: cwd
      },
      directories: {
        elizaDir,
        charactersDir,
        elizaDirExists,
        charactersDirExists
      },
      files: {
        count: characterFiles.length,
        list: characterFiles
      },
      characters: characterData
    });
  } catch (error: any) {
    console.error('Error in character debug API:', error);
    return res.status(500).json({ 
      error: 'An error occurred while retrieving debug information',
      message: error.message 
    });
  }
} 