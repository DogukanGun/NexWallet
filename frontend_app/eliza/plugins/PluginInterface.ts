/**
 * Interface for Eliza plugins
 */
export interface ElizaPlugin {
  /**
   * Unique identifier for the plugin
   */
  id: string;
  
  /**
   * Display name of the plugin
   */
  name: string;
  
  /**
   * Plugin version
   */
  version: string;
  
  /**
   * Plugin description
   */
  description: string;
  
  /**
   * Initialize the plugin with Eliza service
   * @param elizaService The Eliza service instance
   */
  initialize(elizaService: any): Promise<void>;
  
  /**
   * Process a message before it's sent to the model
   * @param message The user message
   * @param character The character name
   * @returns The processed message
   */
  preProcessMessage?(message: string, character: string): Promise<string>;
  
  /**
   * Process a response after it's received from the model
   * @param response The model response
   * @param character The character name
   * @returns The processed response
   */
  postProcessResponse?(response: string, character: string): Promise<string>;
  
  /**
   * Clean up plugin resources
   */
  cleanup?(): Promise<void>;
} 