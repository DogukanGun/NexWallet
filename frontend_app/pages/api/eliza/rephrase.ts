import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// OpenAI API integration (use environment variable for API key)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

    // Load the character file
    const charactersDir = path.join(process.cwd(), 'eliza', 'characters');
    const characterFiles = fs.readdirSync(charactersDir);
    
    // Find the character file by name (case-insensitive)
    const characterFile = characterFiles.find(file => 
      file.toLowerCase().includes(character.toLowerCase()) && file.endsWith('.character.json')
    );
    
    if (!characterFile) {
      return res.status(404).json({ error: `Character '${character}' not found` });
    }
    
    // Read the character config
    const characterPath = path.join(charactersDir, characterFile);
    const characterConfig = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    // Create a custom prompt for the rephrasing
    const prompt = `Please rephrase the following text in your unique style. Maintain the same meaning but express it as if you were speaking:\n\n"${text}"`;
    
    // Use OpenAI API to generate a response
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: characterConfig.configuration.modelName || 'gpt-4',
        messages: [
          { role: 'system', content: characterConfig.system_prompt },
          { role: 'user', content: prompt }
        ],
        temperature: characterConfig.configuration.temperature || 0.7,
        max_tokens: characterConfig.configuration.max_tokens || 800
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    // Extract the assistant's response
    const generatedText = response.data.choices[0].message.content;
    
    // Return the response
    return res.status(200).json({ text: generatedText });
  } catch (error: any) {
    console.error('Error in rephrase API:', error);
    return res.status(500).json({ 
      error: 'An error occurred while rephrasing the text',
      message: error.message 
    });
  }
} 