import { ElizaPlugin } from './PluginInterface';
import { ElizaService } from '../ElizaService';

/**
 * A simple sentiment analysis plugin for Eliza
 * Adds sentiment information to messages
 */
export class SentimentPlugin implements ElizaPlugin {
  id = 'sentiment-plugin';
  name = 'Sentiment Analysis';
  version = '1.0.0';
  description = 'Analyzes sentiment in messages and adds emoji indicators';
  
  private elizaService: ElizaService | null = null;
  private sentimentEmojis = {
    positive: '😊',
    neutral: '😐',
    negative: '😔'
  };

  /**
   * Initialize the plugin
   * @param elizaService The Eliza service
   */
  async initialize(elizaService: ElizaService): Promise<void> {
    this.elizaService = elizaService;
    console.log('Sentiment Analysis plugin initialized');
  }

  /**
   * Simple sentiment analysis function
   * @param text Text to analyze
   * @returns Sentiment score (-1 to 1)
   */
  private analyzeSentiment(text: string): number {
    const positiveWords = [
      'happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'like',
      'enjoy', 'pleased', 'excited', 'fantastic', 'delighted', 'glad', 'thrilled'
    ];
    
    const negativeWords = [
      'sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'upset',
      'angry', 'disappointed', 'frustrating', 'annoying', 'miserable', 'unhappy'
    ];
    
    const words = text.toLowerCase().split(/\W+/);
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) {
        score += 1;
      } else if (negativeWords.includes(word)) {
        score -= 1;
      }
    }
    
    // Normalize score to range between -1 and 1
    return score === 0 ? 0 : score / Math.max(1, Math.abs(score));
  }

  /**
   * Get sentiment emoji based on score
   * @param score Sentiment score (-1 to 1)
   */
  private getSentimentEmoji(score: number): string {
    if (score > 0.2) {
      return this.sentimentEmojis.positive;
    } else if (score < -0.2) {
      return this.sentimentEmojis.negative;
    } else {
      return this.sentimentEmojis.neutral;
    }
  }

  /**
   * Pre-process user message
   * @param message User message
   * @param character Character name
   */
  async preProcessMessage(message: string, character: string): Promise<string> {
    // We don't modify user messages in this plugin
    return message;
  }

  /**
   * Post-process response from the model
   * @param response Model response
   * @param character Character name
   */
  async postProcessResponse(response: string, character: string): Promise<string> {
    const sentimentScore = this.analyzeSentiment(response);
    const sentimentEmoji = this.getSentimentEmoji(sentimentScore);
    
    // Add sentiment emoji to the beginning of the response
    return `${sentimentEmoji} ${response}`;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('Sentiment Analysis plugin cleaned up');
  }
}

export default SentimentPlugin; 