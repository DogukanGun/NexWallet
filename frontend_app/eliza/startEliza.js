// This file is run by the npm script to start the Eliza process
<<<<<<< HEAD
const { ElizaService } = require('./ElizaService');
const path = require('path');
const fs = require('fs');

// Singleton instance
let elizaInstance = null;

// Function to ensure Eliza is running
async function ensureElizaRunning() {
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

module.exports = { ensureElizaRunning }; 
=======
console.log('Eliza service is not needed anymore. The app now uses direct API calls to OpenAI.');
console.log('The environment is now properly configured for NextJS.'); 
>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f
