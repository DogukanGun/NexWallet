import { Tool } from "langchain/tools";
import { Para as ParaServer, Environment, WalletType, Wallet } from "@getpara/server-sdk";
import { decrypt, encrypt } from "../utils/encryption-utils";
import { prisma } from "../prisma/client";

export class AgentSettingsTool extends Tool {
  chatId: string;
  paraClient: ParaServer;

  name = 'agentSettings';
  description = `When a user needs to set a wallet for his/her agent. Input should be a JSON string with the following format:
  {
    "agentName": "string",
    "action": "create|import",
    "walletData": "string" // For import, this should be the encrypted wallet data
  }`;

  constructor(chatId: string) {
    super();
    this.chatId = chatId;
    const PARA_API_KEY = process.env.PARA_API_KEY;
    this.paraClient = new ParaServer(Environment.BETA, PARA_API_KEY);
  }

  async _call(input: string) {
    const { agentName, action, walletData } = JSON.parse(input);

    if (action === "create") {
      try {
        const walletResponse = await this.createWallet(agentName, [WalletType.EVM, WalletType.SOLANA]);
        return walletResponse;
      } catch (error) {
        console.error("Error creating wallet:", error);
        return "Failed to create wallet";
      }
    } else if (action === "import") {
      const decryptedWalletData = decrypt(walletData);
      await prisma.wallet.create({
        data: {
          chatId: this.chatId,
          keyShare: decryptedWalletData,
          groupId: this.chatId,
          publicKey: decryptedWalletData
        }
      });
      return `Wallet imported for agent ${agentName} with chat ID ${this.chatId}.`;
    } else {
      return "Invalid action. Use 'create' or 'import'.";
    }
  }

  private async createWallet(agentName: string, walletTypes: WalletType[]) {
    const hasPregenWallet = await this.paraClient.hasPregenWallet(
      {
        pregenIdentifier: this.chatId,
        pregenIdentifierType: "CUSTOM_ID"
      }
    );
    if (hasPregenWallet) {
      throw new Error("Wallet already exists");
    }
    const newWallets = await this.paraClient.createPregenWalletPerType({
      types: walletTypes,
      pregenIdentifier: this.chatId,
      pregenIdentifierType: "CUSTOM_ID"
    })
    for (const wallet of newWallets) {
      if (wallet.type === WalletType.SOLANA) {
        await this.saveSolanaWalletToDatabase(wallet)
      } else if (wallet.type === WalletType.EVM) {
        await this.saveEvmWalletToDatabase(wallet)
      }
    }
    return `Wallet created for agent ${agentName} with chat ID ${this.chatId}.`;
  }

  private async saveEvmWalletToDatabase(newWalletEvm: Wallet) {
    if (!newWalletEvm.address) {
      throw new Error("Failed to create wallet");
    }
    const userShare = this.paraClient.getUserShare();
    if (!userShare) {
      throw new Error("Failed to get user share");
    }
    const recoverySecret = await this.paraClient.claimPregenWallets();
    if (!recoverySecret) {
      throw new Error("Failed to claim wallet");
    }
    const encryptedKeyShare = encrypt(userShare);
    await prisma.cDPWallet.create({
      data: {
        chatId: this.chatId,
        keyShare: encryptedKeyShare,
        groupId: this.chatId,
        address: newWalletEvm.address!
      }
    });
  }

  private async saveSolanaWalletToDatabase(newWalletSolana: Wallet) {
    if (!newWalletSolana.address) {
      throw new Error("Failed to create wallet");
    }
    const userShare = this.paraClient.getUserShare();
    if (!userShare) {
      throw new Error("Failed to get user share");
    }
    const encryptedKeyShare = encrypt(userShare);
    await prisma.wallet.create({
      data: {
        chatId: this.chatId,
        keyShare: encryptedKeyShare,
        groupId: this.chatId,
        publicKey: newWalletSolana.address!
      }
    });
  }

}