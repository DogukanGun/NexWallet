// This file is run by the npm script to start the Eliza process
import { ElizaService } from './ElizaService';
import path from 'path';
import fs from 'fs';

// Singleton instance
let elizaInstance: ElizaService | null = null;

// Function to ensure Eliza is running
async function ensureElizaRunning(): Promise<ElizaService> {
  if (!elizaInstance) {
    try {
      // Create Eliza service instance
      elizaInstance = new ElizaService();
      
      // Load config
      const configPath = path.join(__dirname, 'config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Start Eliza service
      await elizaInstance.startEliza();
      
      // Load plugins
      if (config.plugins && Array.isArray(config.plugins)) {
        await elizaInstance.getPluginManager().loadPlugins(config.plugins);
        console.log("Loaded plugins:", config.plugins);
      }
      
      console.log("Eliza service has been started successfully!");
    } catch (error) {
      console.error("Failed to start Eliza service:", error);
      throw error;
    }
  }
  return elizaInstance;
}

// Start Eliza when this file is run directly
if (require.main === module) {
  ensureElizaRunning().catch(console.error);
}

export { ensureElizaRunning }; 