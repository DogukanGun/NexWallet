# Eliza OS Integration for NexWallet

This directory contains the Eliza OS integration for NexWallet. Eliza is a powerful multi-agent simulation framework that enables AI agents with consistent personalities and knowledge across multiple platforms.

## Overview

The Eliza integration in NexWallet allows users to have their chat responses rephrased in the style of various characters, adding a layer of personalization and fun to the AI interactions.

## Directory Structure

- **characters/**: Contains character definition files (JSON) that define the personality and style of different characters
- **config.json**: Configuration for the Eliza server
- **ElizaService.ts**: TypeScript service for interacting with Eliza
- **index.ts**: Exports the Eliza service and provides a singleton instance
- **startEliza.js**: Startup script for launching the Eliza server

## Available Characters

The following characters are available for rephrasing messages:

- **Pirate**: Speaks with pirate slang and nautical terminology
- **Shakespeare**: Uses Shakespearean English with archaic pronouns and poetic style

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