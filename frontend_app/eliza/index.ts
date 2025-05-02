// This file should not import ElizaService directly on the client side
import type { ElizaService } from './ElizaService';

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
  private isServer: boolean;
  private serverService: ElizaService | null = null;

  constructor() {
    // Determine if we're running on server or client side
    this.isServer = typeof window === 'undefined';
    
    // Set baseUrl based on environment
    if (this.isServer) {
      // On the server side, we need an absolute URL
      this.baseUrl = 'http://localhost:3000';
      // Dynamically import ElizaService only on server side
      import('./ElizaService').then(({ ElizaService }) => {
        this.serverService = new ElizaService();
      });
    } else {
      // On the client side, we can use a relative URL
      this.baseUrl = '';
    }
  }

  // Get list of available characters
  async getCharacters(): Promise<string[]> {
    if (this.isServer && this.serverService) {
      return this.serverService.getCharacters();
    }

    try {
      // Use a URL that will work in both browser and server
      const response = await fetch(`${this.baseUrl}/api/character/list`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch characters: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Log the response for debugging
      console.log('Character list API response:', data);
      
      // Ensure we have an array of characters
      if (data && Array.isArray(data.characters)) {
        return data.characters;
      } else {
        console.error('Invalid character list format:', data);
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
    if (this.isServer && this.serverService) {
      return this.serverService.sendMessage(message, character);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/character/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          character
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Rephrase text in the style of a character
  async rephraseWithCharacter(text: string, character: string): Promise<string> {
    if (this.isServer && this.serverService) {
      return this.serverService.sendMessage(`Rephrase this text in your style: ${text}`, character);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/character/rephrase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          character
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to rephrase text: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error rephrasing text:', error);
      throw error;
    }
  }

  // Get the plugin manager (server-side only)
  getPluginManager() {
    if (this.isServer && this.serverService) {
      return this.serverService.getPluginManager();
    }
    throw new Error('Plugin manager is only available on the server side');
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