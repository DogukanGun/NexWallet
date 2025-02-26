import { Tool } from 'langchain/tools';
import { prisma } from '../prisma/client';
import { createSolanaTools, SolanaAgentKit } from '../solana-agent-kit/index';
import { Environment, Para as ParaServer } from '@getpara/server-sdk';
import { decrypt } from '../utils/encryption-utils';
import { Cluster, clusterApiUrl, Connection, Transaction } from '@solana/web3.js';
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

export class SolanaTool extends Tool {
  chatId: string;
  name = 'trade';
  description = `Handles any commands that require an agent to interact onchain also any information requested for the solana chain. Input should be a JSON string with the following format:
  {
    "tradeDemand": "string"
  }`;

  constructor(chatId: string) {
    super();
    this.chatId = chatId;
  }

  async _call(input: string) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: {
          chatId: this.chatId
        }
      });
      if (!wallet) {
        throw new Error("Wallet not found.");
      }
      const decryptedKeyShare = decrypt(wallet.keyShare);
      const PARA_API_KEY = process.env.PARA_API_KEY;
      const paraClient = new ParaServer(Environment.BETA, PARA_API_KEY);
      paraClient.setUserShare(decryptedKeyShare);
      const connection = new Connection(clusterApiUrl(process.env.ENVIRONMENT as Cluster || 'mainnet-beta'));
      const solanaSigner = new ParaSolanaWeb3Signer(paraClient as any, connection);
      return this.executeTrade(input, wallet.publicKey, solanaSigner);
    } catch (error) {
      console.error("Error processing trade command:", error, input);
      throw new Error("Invalid input format. Please provide a command like: 'I want to trade [amount] [fromCurrency] for [toCurrency]'.");
    }
  }


  private async executeTrade(input: string, address: string, solanaSigner: ParaSolanaWeb3Signer): Promise<string> {
    const solanaAgent = new SolanaAgentKit(address, process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com", { OPENAI_API_KEY: process.env.OPENAI_API_KEY })
    solanaAgent.isUiMode = true;
    solanaAgent.onSignTransaction = async (tx) => {
      console.log(tx);
      const txObj = Transaction.from(Buffer.from(tx, 'base64'));
      const signedTx = await solanaSigner.signTransaction(txObj);
      return Buffer.from(signedTx.serialize()).toString('base64');
    }
    const tools = createSolanaTools(solanaAgent);

    const memory = new MemorySaver();
    const config = { configurable: { thread_id: "Solana Agent Kit!" } };
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.3,
    });
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      `,
    });
    const stream = await agent.stream(
      { messages: [new HumanMessage(input)] },
      config,
    );
    let response = "";
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        response += chunk.agent.messages[0].content;
      } else if ("tools" in chunk) {
        response += chunk.tools.messages[0].content;
      }
      console.log("-------------------");
    }
    return response;
  }
} 