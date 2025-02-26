import { Tool } from "langchain/tools";
import { prisma } from "../prisma/client";
import {
    AgentKit,
    CdpWalletProvider,
    wethActionProvider,
    walletActionProvider,
    erc20ActionProvider,
    cdpApiActionProvider,
    cdpWalletActionProvider,
    pythActionProvider,
    ViemWalletProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import ParaServer, { Environment } from "@getpara/server-sdk";
import { createWalletClient } from "viem";
import { http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as crypto from 'crypto';

export class CdpAgentTool extends Tool {
    chatId: string;
    paraClient: ParaServer;

    name = "cdpAgent";
    description = `Use this tool to handle a transaction or request for base and arbitrum chain. Input should be a JSON string with the following format:
        {
            "trade_demand": "string",
            "chain": "base-sepolia|arbitrum-sepolia", // if the user doesn't specify the chain, the default chain is base-sepolia
        }

    `;

    constructor(chatId: string) {
        super();
        this.chatId = chatId;
        const PARA_API_KEY = process.env.PARA_API_KEY;
        this.paraClient = new ParaServer(Environment.BETA, PARA_API_KEY);
    }

    async _call(input: string) {
        //Get inputs and the user's wallet
        const { trade_demand, chain } = JSON.parse(input);
        const wallet = await prisma.cDPWallet.findUnique({
            where: {
                chatId: this.chatId,
            }
        });

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        //Initialize the agent
        const llm = new ChatOpenAI({
            model: "gpt-4o-mini",
        });

        const memory = new MemorySaver();
        const privateKey = await this.generatePrivateKey(wallet.keyShare)
        const account = privateKeyToAccount(`0x${privateKey}`);
        const client = createWalletClient({
            account: account.address as `0x${string}`,
            chain: chain === "base-sepolia" ? baseSepolia : arbitrumSepolia,
            transport: http(),
        });

        const walletProvider = new ViemWalletProvider(client);
        const agentkit = await AgentKit.from({
            walletProvider,
            actionProviders: [
                wethActionProvider(),
                pythActionProvider(),
                walletActionProvider(),
                erc20ActionProvider(),
                cdpApiActionProvider({
                    apiKeyName: process.env.CDP_API_KEY_NAME,
                    apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
                        /\\n/g,
                        "\n",
                    ),
                }),
                cdpWalletActionProvider({
                    apiKeyName: process.env.CDP_API_KEY_NAME,
                    apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
                        /\\n/g,
                        "\n",
                    ),
                }),
            ],
        });

        const tools = await getLangChainTools(agentkit);

        // Create React Agent using the LLM and CDP AgentKit tools
        const agent = createReactAgent({
            llm,
            tools,
            checkpointSaver: memory,
            messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
        faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
        funds from the user. Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
        docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
        restating your tools' descriptions unless it is explicitly requested. Wait for the user to respond before 
        executing your actions.
        `,
        });
        const agentConfig = {
            configurable: { thread_id: "CDP AgentKit Chatbot Example!" },
        };
        const stream = await agent.stream(
            { messages: [new HumanMessage(trade_demand)] },
            agentConfig,
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

    async generatePrivateKey(seed: string): Promise<string> {
        const seedBytes = Buffer.from(seed, 'utf-8');
        const hash = crypto.createHash('sha256');
        hash.update(seedBytes);
        const privateKey = hash.digest('hex');
        return privateKey;
    }

}
