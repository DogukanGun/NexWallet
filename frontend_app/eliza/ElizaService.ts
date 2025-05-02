import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { PluginManager } from './plugins/PluginManager';
<<<<<<< HEAD
=======
import { ElizaPlugin } from './plugins/PluginInterface';
>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f

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
  private pluginManager: PluginManager;
  // OpenAI API key from environment variable
  private openaiApiKey: string | undefined = process.env.OPENAI_API_KEY;

  constructor() {
    // Load config
    const configPath = path.join(process.cwd(), 'eliza', 'config.json');
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.baseUrl = `http://${this.config.runtime.host}:${this.config.runtime.port}`;
    
    // Initialize plugin manager
    this.pluginManager = new PluginManager(this);
    
    // Load characters
    this.loadCharacters();
  }

  private async loadPlugins() {
    if (this.config.plugins && Array.isArray(this.config.plugins)) {
      await this.pluginManager.loadPlugins(this.config.plugins);
    }
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
            
            // Load plugins after Eliza is started
            this.loadPlugins().then(() => {
              resolve(true);
            });
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
    // Unload plugins
    const plugins = this.pluginManager.getPlugins();
    for (const plugin of plugins) {
      if (plugin.cleanup) {
        await plugin.cleanup();
      }
    }

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
    try {
      // Convert character name to lowercase for case-insensitive matching
      const characterLower = character.toLowerCase();
      
      // Check if the character exists
      if (!this.characters.has(characterLower)) {
        throw new Error(`Character '${character}' not found`);
      }

      // Process message through plugins
      const processedMessage = await this.pluginManager.preProcessMessage(message, characterLower);

      try {
        // Try to use the Eliza API if it's running
        if (this.isRunning) {
          const response = await axios.post(`${this.baseUrl}/api/message`, {
            message: processedMessage,
            character: characterLower
          });

          // Process response through plugins
          const processedResponse = await this.pluginManager.postProcessResponse(
            response.data.response, 
            characterLower
          );

          return processedResponse;
        } else {
          // Fallback to direct OpenAI call
          return await this.directModelCall(processedMessage, characterLower);
        }
      } catch (error) {
        console.error('Error using Eliza API, falling back to direct API call:', error);
        return await this.directModelCall(processedMessage, characterLower);
      }
    } catch (error) {
      console.error('Error sending message to Eliza:', error);
      throw error;
    }
  }

  public async rephraseWithCharacter(text: string, character: string): Promise<string> {
    try {
      // Convert character name to lowercase for case-insensitive matching
      const characterLower = character.toLowerCase();
      
      // Check if the character exists
      if (!this.characters.has(characterLower)) {
        throw new Error(`Character '${character}' not found`);
      }

      // Process text through plugins
      const processedText = await this.pluginManager.preProcessMessage(text, characterLower);

      // Get the character's system prompt
      const characterConfig = this.characters.get(characterLower);
      if (!characterConfig) {
        throw new Error(`Character '${character}' configuration not found`);
      }

      // Create a custom prompt for the rephrasing
      const prompt = `Please rephrase the following text in your unique style. Maintain the same meaning but express it as if you were speaking:\n\n"${processedText}"`;

      try {
        // Try to use the direct model call
        const response = await this.directModelCall(prompt, characterLower);
        
        // Process response through plugins
        const processedResponse = await this.pluginManager.postProcessResponse(
          response, 
          characterLower
        );

        return processedResponse;
      } catch (error) {
        console.error('Error rephrasing with direct API call:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error rephrasing with Eliza character:', error);
      throw error;
    }
  }

  // Helper method to get plugin manager
  public getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  // Direct model call using OpenAI API
  private async directModelCall(message: string, character: string): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key is not configured. Set the OPENAI_API_KEY environment variable.');
    }

    const characterConfig = this.characters.get(character);
    if (!characterConfig) {
      throw new Error(`Character '${character}' configuration not found`);
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: characterConfig.configuration.modelName || 'gpt-4',
          messages: [
            { role: 'system', content: characterConfig.system_prompt },
            { role: 'user', content: message }
          ],
          temperature: characterConfig.configuration.temperature || 0.7,
          max_tokens: characterConfig.configuration.max_tokens || 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 