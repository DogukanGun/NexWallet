import { Tool } from 'langchain/tools';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GetActiveAgentsTool extends Tool {
  chatId: string;

  name = 'getActiveAgents';
  description = `Retrieves active agents for a given chat ID. Input should be a JSON string with the following format:
  {
    "chatId": "string"
  }`;

  constructor(chatId: string) {
    super();
    this.chatId = chatId;
  }

  async _call(input: string) {
    try {
      const agents = await prisma.telegramGroup.findMany({
        where: {
          chatId: this.chatId,
        },
      });

      if (agents.length === 0) {
        return `No active agents found for chat ID "${this.chatId}".`;
      }

      return agents.map(agent => agent.name).join(', ');
    } catch (error) {
      console.error("Error processing get active agents command:", error, input);
      throw new Error("Invalid input format or retrieval failed.");
    }
  }
} 