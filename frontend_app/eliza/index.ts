// This file should not import ElizaService directly on the client side

import axios from 'axios';

// Interface for character configuration
export interface CharacterConfig {
  name: string;
  version: string;
  description: string;
  system_prompt: string;
  initial_message: string;
  configuration: {
    modelProvider: string;
    modelName: string;
    temperature: number;
    max_tokens: number;
  };
  metadata: {
    author: string;
    tags: string[];
  };
}

// Client-side service for interacting with Eliza API
class ElizaClient {
  private baseUrl: string;

  constructor() {
    // Make sure we use the correct URL format for the browser environment
    this.baseUrl = '/api/eliza';
  }

  // Get list of available characters
  async getCharacters(): Promise<string[]> {
    try {
      // Use a relative URL that will work in the browser
      const response = await axios.get('/api/character/list');
      
      // Log the response for debugging
      console.log('Character list API response:', response.data);
      
      // Ensure we have an array of characters
      if (response.data && Array.isArray(response.data.characters)) {
        return response.data.characters;
      } else {
        console.error('Invalid character list format:', response.data);
        throw new Error('Invalid character list format received from API');
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      // Return empty array instead of throwing, so UI can fallback gracefully
      return [];
    }
  }

  // Send a message to a character
  async sendMessage(message: string, character: string): Promise<string> {
    try {
      const response = await axios.post('/api/character/message', {
        message,
        character
      });
      return response.data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Rephrase text in the style of a character
  async rephraseWithCharacter(text: string, character: string): Promise<string> {
    try {
      const response = await axios.post('/api/character/rephrase', {
        text,
        character
      });
      return response.data.text;
    } catch (error) {
      console.error('Error rephrasing text:', error);
      throw error;
    }
  }
}

// Create a singleton instance of ElizaClient
let elizaClientInstance: ElizaClient | null = null;

export function getElizaService(): ElizaClient {
  if (!elizaClientInstance) {
    elizaClientInstance = new ElizaClient();
  }
  
  return elizaClientInstance;
} 