import { Tool } from 'langchain/tools';
import { prisma } from '../prisma/client';


export class GetWalletTool extends Tool {
  chatId: string;

  name = 'getWallet';
  description = `Retrieves the wallet information for the user. Input should be a JSON string with the following format:
  `;

  constructor(chatId: string) {
    super();
    this.chatId = chatId;
  }

  async _call(input: string) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where:{
            chatId: this.chatId
        }
      });

      const evmWallet = await prisma.cDPWallet.findUnique({
        where: {
          chatId: this.chatId,
        }
      });

      if (!wallet || !evmWallet) {
        throw new Error("Wallet not found.");
      }

      return `Wallet information: ${wallet.publicKey} and ${evmWallet.address}`;
    } catch (error) {
      console.error("Error processing get wallet command:", error, input);
      throw new Error("Invalid input format or wallet retrieval failed.");
    }
  }
}
