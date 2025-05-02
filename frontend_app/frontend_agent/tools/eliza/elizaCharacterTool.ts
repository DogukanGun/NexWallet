import { Tool } from '@langchain/core/tools';
import axios from 'axios';

export class ElizaCharacterTool extends Tool {
  name = 'eliza_character_tool';
  description = 'Rephrases text in the style of a selected character. Available characters include Pirate, Shakespeare, CryptoWizard, FriedrichMerz, DonaldTrump, ElonMusk, and KevinHart. Input should be a JSON string with fields "text" (the content to rephrase) and "character" (the character style to use).';
  
  constructor() {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      // Parse the input JSON
      const parsedInput = JSON.parse(input);
      const { text, character } = parsedInput;
      
      if (!text) {
        return "Error: No text provided to rephrase";
      }
      
      if (!character) {
        return "Error: No character specified.";
      }
      
      // Use absolute URL for API calls to ensure they work in all environments
      const apiUrl = typeof window !== 'undefined' 
        ? '/api/character/rephrase' // Client-side relative URL
        : 'http://localhost:3000/api/character/rephrase'; // Server-side absolute URL
      
      // Call the API endpoint to rephrase the text
      const response = await axios.post(apiUrl, {
        text,
        character
      });
      
      // Return the rephrased text from the API response
      return response.data.text;
    } catch (error: any) {
      console.error('Error in ElizaCharacterTool:', error);
      return `Error rephrasing text: ${error.message || 'Unknown error'}`;
    }
  }
} 