import { Tool } from 'langchain/tools';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DefineAgentTool extends Tool {
  chatId: string;

  name = 'defineAgent';
  description = `Defines a new agent. Input should be a JSON string with the following format:
  {
    "agentName": "string",
  }`;

  constructor(chatId: string) {
    super();
    this.chatId = chatId;
  }

  async _call(input: string) {
    try {
      const inputFormat = JSON.parse(input);
      const { agentName } = inputFormat;

      await prisma.telegramGroup.create({
        data: {
          id: this.chatId,
          name: agentName,
          chatId: this.chatId,
          type: 'group',
        },
      });
      return `Agent "${agentName}" has been defined.`;
    } catch (error) {
      console.error("Error processing define agent command:", error, input);
      throw new Error("Invalid input format or agent definition failed.");
    }
  }
} 