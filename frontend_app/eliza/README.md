# Eliza OS Integration for NexWallet

This directory contains the Eliza OS integration for NexWallet. Eliza is a powerful multi-agent simulation framework that enables AI agents with consistent personalities and knowledge across multiple platforms.

## Overview

The Eliza integration in NexWallet allows users to have their chat responses rephrased in the style of various characters, adding a layer of personalization and fun to the AI interactions.

## Directory Structure

- **characters/**: Contains character definition files (JSON) that define the personality and style of different characters
- **config.json**: Configuration for the Eliza server
- **ElizaService.ts**: TypeScript service for interacting with Eliza
- **index.ts**: Exports the Eliza service and provides a singleton instance
- **plugins/**: Contains plugin modules that extend Eliza's functionality
- **startEliza.js**: Startup script for launching the Eliza server

## Available Characters

The following characters are available for rephrasing messages:

- **Pirate**: Speaks with pirate slang and nautical terminology
- **Shakespeare**: Uses Shakespearean English with archaic pronouns and poetic style

## Plugin System

Eliza now supports a plugin system to extend its functionality. Plugins can:

- Pre-process messages before they're sent to the AI model
- Post-process responses after they're received from the model
- Add new features to the platform

### Available Plugins

The following plugins are included:

- **SentimentPlugin**: Analyzes the sentiment of AI responses and adds appropriate emoji indicators
- **TranslationPlugin**: Provides basic translation capabilities, adding language indicators to messages
- **SonicSVMPlugin**: Integrates with Sonic SVM, a high-performance Solana Virtual Machine implementation
- **BNBChainPlugin**: Integrates with BNB Chain, an Ethereum-compatible blockchain ecosystem

### Using Plugins

Plugins are enabled in the `config.json` file. Here are some examples of plugin commands:

#### Translation Plugin
```
/translate to spanish
```
This will make the character respond in Spanish (simulated in the demo plugin).

#### Sonic SVM Plugin
```
/solana account <account-address>
```
Retrieves information about a Solana account.

```
/solana simulate <transaction-data>
```
Simulates a Solana transaction.

```
/solana connect
```
Connect to a Solana wallet.

```
/solana use <public-key>
```
Use NexWallet's connected Solana wallet.

```
/solana send <transaction-data>
```
Send a Solana transaction (requires connected wallet).

#### BNB Chain Plugin
```
/bnb balance <wallet-address>
```
Gets the BNB balance for a wallet address.

```
/bnb token <token-address>
```
Gets information about a BNB token.

```
/bnb tx <transaction-hash>
```
Retrieves details about a BNB Chain transaction.

```
/bnb connect
```
Connect to a BNB Chain wallet.

```
/bnb use <wallet-address>
```
Use NexWallet's connected BNB Chain wallet.

```
/bnb send <to-address>,<amount>,<data>
```
Send a BNB transaction (requires connected wallet).

### Wallet Integration

The blockchain plugins can work with NexWallet's wallet system in two ways:

1. **Direct Connect**: The plugins can connect directly to browser wallets like MetaMask (for BNB Chain) or Phantom (for Solana).

2. **NexWallet Integration**: The plugins can be connected to NexWallet's existing wallet connections:

#### Frontend Agent Integration

The blockchain plugins are designed to work with NexWallet's frontend agent, which can:

- Access the user's connected wallets from the NexWallet system
- Handle transaction signing through NexWallet's wallet infrastructure
- Provide a consistent interface across chat and voice interfaces

To use the NexWallet wallet with the blockchain plugins:

```typescript
// In your frontend code
import { FrontendAgent } from './frontend_agent/agent';
import { useConfigStore } from './store/configStore';

// Initialize the frontend agent
const agent = new FrontendAgent();

// Get connected chains from NexWallet's config store
const chains = useConfigStore.getState().chains;

// Connect the wallets to the blockchain plugins
agent.setWalletConnections(chains);

// Now you can execute blockchain operations
const balance = await agent.executeBlockchainOperation('bnb.getBalance', {
  address: '0xYourAddress'
});
```

### Creating Custom Plugins

To create a custom plugin:

1. Create a new TypeScript file in the `plugins/` directory
2. Implement the `ElizaPlugin` interface
3. Add the plugin path to the `plugins` array in `config.json`

Example plugin structure:

```typescript
import { ElizaPlugin } from './PluginInterface';
import { ElizaService } from '../ElizaService';

export class MyCustomPlugin implements ElizaPlugin {
  id = 'my-plugin';
  name = 'My Custom Plugin';
  version = '1.0.0';
  description = 'Description of my plugin';
  
  async initialize(elizaService: ElizaService): Promise<void> {
    // Initialize plugin
  }
  
  async preProcessMessage(message: string, character: string): Promise<string> {
    // Process message before sending to model
    return message;
  }
  
  async postProcessResponse(response: string, character: string): Promise<string> {
    // Process response after receiving from model
    return response;
  }
  
  async cleanup(): Promise<void> {
    // Clean up resources
  }
}

export default MyCustomPlugin;
```

## How to Use

1. **Start NexWallet with Eliza**:
   ```bash
   npm run dev:with-eliza
   ```
   This will start both the Next.js application and the Eliza service concurrently.

2. **In Production**:
   ```bash
   npm run start:with-eliza
   ```
   
3. **In the Chat Interface**:
   - Click on the book icon in the message input area to enable character mode
   - Select a character from the dropdown menu
   - Send your message - the AI response will be rephrased in the style of the selected character

## Adding New Characters

To add a new character:

1. Create a new JSON file in the `characters/` directory with the format `<character-name>.character.json`
2. Define the character's personality, system prompt, and other configuration
3. Restart the application

Example character definition:
```json
{
  "name": "NewCharacter",
  "version": "1.0.0",
  "description": "Description of the character",
  "system_prompt": "System prompt defining the character's personality and style",
  "initial_message": "Initial greeting message from the character",
  "configuration": {
    "modelProvider": "openai",
    "modelName": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 800
  },
  "metadata": {
    "author": "NexWallet",
    "tags": ["tag1", "tag2"]
  }
}
```

## Troubleshooting

If you encounter issues with the Eliza integration:

1. Check if the Eliza service is running (`npm run eliza:start`)
2. Verify that the character files are correctly formatted
3. Check the console for any error messages
4. Ensure you have Node.js v23+ (especially v23.3.0) installed 