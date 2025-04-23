import { ElizaPlugin } from './PluginInterface';
import { ElizaService } from '../ElizaService';

/**
 * A simple translation plugin for Eliza
 * Demonstrates how to perform text transformations
 */
export class TranslationPlugin implements ElizaPlugin {
  id = 'translation-plugin';
  name = 'Translation Plugin';
  version = '1.0.0';
  description = 'Adds translation capabilities to Eliza responses';
  
  private elizaService: ElizaService | null = null;
  private activeLanguage: string = 'english'; // Default language
  private languageCode: string = 'en'; // Default language code
  
  private languageMap: Record<string, string> = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'russian': 'ru',
    'japanese': 'ja',
    'chinese': 'zh',
    'korean': 'ko',
    'arabic': 'ar',
    'turkish': 'tr'
  };

  /**
   * Initialize the plugin
   * @param elizaService The Eliza service
   */
  async initialize(elizaService: ElizaService): Promise<void> {
    this.elizaService = elizaService;
    console.log('Translation plugin initialized');
  }

  /**
   * Set the active language for translation
   * @param language The language to translate to
   */
  setLanguage(language: string): boolean {
    const lowerLanguage = language.toLowerCase();
    if (this.languageMap[lowerLanguage]) {
      this.activeLanguage = lowerLanguage;
      this.languageCode = this.languageMap[lowerLanguage];
      console.log(`Translation language set to: ${lowerLanguage} (${this.languageCode})`);
      return true;
    }
    return false;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): string[] {
    return Object.keys(this.languageMap);
  }

  /**
   * Simple mock translation function
   * In a real plugin, this would call an actual translation API
   * @param text Text to translate
   * @param targetLanguage Target language code
   */
  private async translateText(text: string, targetLanguage: string): Promise<string> {
    // This is a mock implementation
    // In a real plugin, you would call a translation API
    
    if (targetLanguage === 'en') {
      // If target is English, return the original
      return text;
    }
    
    // For demo purposes, add a language indicator
    const languageName = Object.keys(this.languageMap).find(
      lang => this.languageMap[lang] === targetLanguage
    ) || targetLanguage;
    
    return `[Translated to ${languageName}]: ${text}`;
    
    // In a real implementation, you would use something like:
    // const response = await axios.post('https://translation-api.example.com/translate', {
    //   text,
    //   target: targetLanguage
    // });
    // return response.data.translatedText;
  }

  /**
   * Pre-process user message
   * @param message User message
   * @param character Character name
   */
  async preProcessMessage(message: string, character: string): Promise<string> {
    // Check if the message is a language command
    const languageRegex = /^\/translate\s+to\s+([a-z]+)$/i;
    const match = message.match(languageRegex);
    
    if (match) {
      const requestedLanguage = match[1].toLowerCase();
      const success = this.setLanguage(requestedLanguage);
      
      // Return a placeholder message that will be replaced by Eliza
      if (success) {
        return `I'll now respond in ${requestedLanguage}.`;
      } else {
        return `Sorry, I don't support translation to ${requestedLanguage}. Available languages: ${this.getAvailableLanguages().join(', ')}`;
      }
    }
    
    // If it's not a language command, return the original message
    return message;
  }

  /**
   * Post-process response from the model
   * @param response Model response
   * @param character Character name
   */
  async postProcessResponse(response: string, character: string): Promise<string> {
    // If the active language is not English, translate the response
    if (this.languageCode !== 'en') {
      return await this.translateText(response, this.languageCode);
    }
    
    return response;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('Translation plugin cleaned up');
  }
}

export default TranslationPlugin; 