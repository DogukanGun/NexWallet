import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

export interface ElizaConfig {
  runtime: {
    port: number;
    host: string;
    character_directory: string;
    debug: boolean;
    keep_alive: boolean;
    api: {
      enabled: boolean;
      cors: boolean;
      auth: boolean;
    };
  };
  logs: {
    level: string;
    file: boolean;
  };
  plugins: string[];
}

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

export class ElizaService {
  private elizaProcess: ChildProcess | null = null;
  private config: ElizaConfig;
  private baseUrl: string;
  private characters: Map<string, CharacterConfig> = new Map();
  private isRunning: boolean = false;

  constructor() {
    // Load config
    const configPath = path.join(process.cwd(), 'eliza', 'config.json');
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.baseUrl = `http://${this.config.runtime.host}:${this.config.runtime.port}`;
    
    // Load characters
    this.loadCharacters();
  }

  private loadCharacters() {
    const charactersDir = path.join(process.cwd(), 'eliza', 'characters');
    const files = fs.readdirSync(charactersDir);
    
    files.forEach(file => {
      if (file.endsWith('.character.json')) {
        const characterPath = path.join(charactersDir, file);
        const character = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
        this.characters.set(character.name.toLowerCase(), character);
      }
    });
  }

  public async startEliza(): Promise<boolean> {
    if (this.isRunning) {
      console.log('Eliza is already running');
      return true;
    }
    
    return new Promise((resolve) => {
      try {
        this.elizaProcess = spawn('npx', ['elizaos', 'start', '--config=./eliza/config.json'], {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        let output = '';
        this.elizaProcess.stdout?.on('data', (data) => {
          output += data.toString();
          console.log(`Eliza stdout: ${data}`);
          
          if (output.includes('Server running at')) {
            this.isRunning = true;
            resolve(true);
          }
        });

        this.elizaProcess.stderr?.on('data', (data) => {
          console.error(`Eliza stderr: ${data}`);
        });

        this.elizaProcess.on('close', (code) => {
          console.log(`Eliza process exited with code ${code}`);
          this.isRunning = false;
        });

        // After 5 seconds, assume it's started
        setTimeout(() => {
          if (!this.isRunning) {
            this.isRunning = true;
            resolve(true);
          }
        }, 5000);
      } catch (error) {
        console.error('Failed to start Eliza:', error);
        resolve(false);
      }
    });
  }

  public async stopEliza(): Promise<void> {
    if (this.elizaProcess) {
      this.elizaProcess.kill();
      this.elizaProcess = null;
      this.isRunning = false;
    }
  }

  public async getCharacters(): Promise<string[]> {
    return Array.from(this.characters.keys());
  }

  public async sendMessage(message: string, character: string): Promise<string> {
    if (!this.isRunning) {
      await this.startEliza();
    }

    try {
      // Convert character name to lowercase for case-insensitive matching
      const characterLower = character.toLowerCase();
      
      // Check if the character exists
      if (!this.characters.has(characterLower)) {
        throw new Error(`Character '${character}' not found`);
      }

      // Send message to Eliza API
      const response = await axios.post(`${this.baseUrl}/api/message`, {
        message,
        character: characterLower
      });

      return response.data.response;
    } catch (error) {
      console.error('Error sending message to Eliza:', error);
      throw error;
    }
  }

  // Helper method to rephrase text in the style of a character
  public async rephraseWithCharacter(text: string, character: string): Promise<string> {
    if (!this.isRunning) {
      await this.startEliza();
    }

    try {
      // Convert character name to lowercase for case-insensitive matching
      const characterLower = character.toLowerCase();
      
      // Check if the character exists
      if (!this.characters.has(characterLower)) {
        throw new Error(`Character '${character}' not found`);
      }

      // Get the character's system prompt
      const characterConfig = this.characters.get(characterLower);
      if (!characterConfig) {
        throw new Error(`Character '${character}' configuration not found`);
      }

      // Create a custom prompt for the rephrasing
      const prompt = `${characterConfig.system_prompt}\n\nPlease rephrase the following text in your style:\n${text}`;

      // Send the prompt to Eliza API
      const response = await axios.post(`${this.baseUrl}/api/message`, {
        message: prompt,
        character: characterLower
      });

      return response.data.response;
    } catch (error) {
      console.error('Error rephrasing with Eliza character:', error);
      throw error;
    }
  }
} 