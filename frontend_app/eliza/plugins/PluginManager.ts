import { ElizaPlugin } from './PluginInterface';
import path from 'path';
import fs from 'fs';
import { ElizaService } from '../ElizaService';

export class PluginManager {
  private plugins: Map<string, ElizaPlugin> = new Map();
  private elizaService: ElizaService;

  constructor(elizaService: ElizaService) {
    this.elizaService = elizaService;
  }

  /**
   * Load a plugin by its path
   * @param pluginPath Path to the plugin module
   */
  public async loadPlugin(pluginPath: string): Promise<boolean> {
    try {
      // Check if the plugin exists
      const resolvedPath = path.resolve(process.cwd(), pluginPath);
      if (!fs.existsSync(resolvedPath)) {
        console.error(`Plugin not found: ${pluginPath}`);
        return false;
      }

      // Import the plugin dynamically
      const pluginModule = await import(resolvedPath);
      
      // Get the plugin class/object
      let plugin: ElizaPlugin;
      if (pluginModule.default) {
        // If it's a class with default export
        if (typeof pluginModule.default === 'function') {
          plugin = new pluginModule.default();
        } else {
          // If it's an object with default export
          plugin = pluginModule.default;
        }
      } else {
        // If there's no default export, try to find a plugin object
        const exportedValues = Object.values(pluginModule);
        const pluginClass = exportedValues.find(
          (exp) => typeof exp === 'function' && exp.prototype && 
          typeof exp.prototype.initialize === 'function'
        );
        
        if (pluginClass) {
          plugin = new (pluginClass as any)();
        } else {
          throw new Error(`No valid plugin found in ${pluginPath}`);
        }
      }

      // Validate the plugin
      if (!this.validatePlugin(plugin)) {
        throw new Error(`Invalid plugin: ${pluginPath}. Missing required properties.`);
      }

      // Initialize the plugin
      await plugin.initialize(this.elizaService);
      
      // Store the plugin
      this.plugins.set(plugin.id, plugin);
      console.log(`Plugin loaded: ${plugin.name} (${plugin.id})`);
      
      return true;
    } catch (error) {
      console.error(`Failed to load plugin ${pluginPath}:`, error);
      return false;
    }
  }

  /**
   * Load multiple plugins from the config
   * @param pluginPaths Array of plugin paths
   */
  public async loadPlugins(pluginPaths: string[]): Promise<void> {
    for (const pluginPath of pluginPaths) {
      await this.loadPlugin(pluginPath);
    }
  }

  /**
   * Unload a plugin by its ID
   * @param pluginId The plugin ID
   */
  public async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`Plugin not found: ${pluginId}`);
      return false;
    }

    // Call cleanup if available
    if (plugin.cleanup) {
      await plugin.cleanup();
    }

    // Remove the plugin
    this.plugins.delete(pluginId);
    console.log(`Plugin unloaded: ${plugin.name} (${plugin.id})`);
    
    return true;
  }

  /**
   * Get a list of all loaded plugins
   */
  public getPlugins(): ElizaPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Pre-process a message through all plugins
   * @param message The user message
   * @param character The character name
   */
  public async preProcessMessage(message: string, character: string): Promise<string> {
    let processedMessage = message;
    
    for (const plugin of this.plugins.values()) {
      if (plugin.preProcessMessage) {
        processedMessage = await plugin.preProcessMessage(processedMessage, character);
      }
    }
    
    return processedMessage;
  }

  /**
   * Post-process a response through all plugins
   * @param response The model response
   * @param character The character name
   */
  public async postProcessResponse(response: string, character: string): Promise<string> {
    let processedResponse = response;
    
    for (const plugin of this.plugins.values()) {
      if (plugin.postProcessResponse) {
        processedResponse = await plugin.postProcessResponse(processedResponse, character);
      }
    }
    
    return processedResponse;
  }

  /**
   * Validate that a plugin has all required properties
   * @param plugin The plugin to validate
   */
  private validatePlugin(plugin: any): plugin is ElizaPlugin {
    return (
      plugin &&
      typeof plugin.id === 'string' &&
      typeof plugin.name === 'string' &&
      typeof plugin.version === 'string' &&
      typeof plugin.description === 'string' &&
      typeof plugin.initialize === 'function'
    );
  }
} 