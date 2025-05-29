import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { DynamicTool } from "@langchain/core/tools";
import { initializeAgentExecutorWithOptions, AgentExecutor } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const WALLET_FACTORY_ADDRESS = process.env.WALLET_FACTORY_ADDRESS!;
const RPC_URL = process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ABI snippets for the contracts
const WALLET_FACTORY_ABI = [
  "function createWallet() external returns (address)",
  "function userWallets(address) external view returns (address)"
];

const walletFactory = new ethers.Contract(WALLET_FACTORY_ADDRESS, WALLET_FACTORY_ABI, wallet);

// ABI snippets for the wallet contract
const WALLET_ABI = [
  "function transfer(address token, uint256 amount, address to) external returns (bool)",
  "function swap(address fromToken, address toToken, uint256 amount) external returns (uint256)"
];

export async function createWalletForUser(userPk: string): Promise<string> {
  // Call factory contract to create wallet for userPk
  const tx = await walletFactory.createWallet();
  const receipt = await tx.wait();
  const event = receipt.logs.find((log: any) => log.fragment && log.fragment.name === "WalletCreated");
  return event.args.walletAddress;
}

export async function getWalletForUser(userPk: string): Promise<string> {
  // Query factory contract for wallet address by userPk
  return await walletFactory.userWallets(userPk);
}

export async function transferToken(walletAddress: string, params: any): Promise<string> {
  const walletContract = new ethers.Contract(walletAddress, WALLET_ABI, wallet);
  const tx = await walletContract.transfer(params.token, params.amount, params.to);
  const receipt = await tx.wait();
  return `Transferred ${params.amount} ${params.token} to ${params.to} from wallet ${walletAddress}`;
}

export async function swapToken(walletAddress: string, params: any): Promise<string> {
  const walletContract = new ethers.Contract(walletAddress, WALLET_ABI, wallet);
  const tx = await walletContract.swap(params.fromToken, params.toToken, params.amount);
  const receipt = await tx.wait();
  return `Swapped ${params.amount} ${params.fromToken} for ${params.toToken} in wallet ${walletAddress}.\n Here is the transaction hash: ${tx.hash}`;
}

// --- LangChain Tools ---
const createWalletTool = new DynamicTool({
  name: "createWallet",
  description: "Create a new BNB wallet for the user.",
  func: async (input: string) => {
    const { userPk } = JSON.parse(input);
    const walletAddress = await createWalletForUser(userPk);
    return `Wallet created: ${walletAddress}`;
  },
});

const transferTokenTool = new DynamicTool({
  name: "transferToken",
  description: "Transfer a desired amount of a token to a desired address.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await transferToken(walletAddress, params);
  },
});

const swapTokenTool = new DynamicTool({
  name: "swapToken",
  description: "Swap a desired amount of a token for another token.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await swapToken(walletAddress, params);
  },
});

let agentExecutor: AgentExecutor | null = null;

async function getAgentExecutor(): Promise<AgentExecutor> {
  if (agentExecutor) return agentExecutor;
  const llm = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo"
  });
  const tools = [createWalletTool, transferTokenTool, swapTokenTool];
  agentExecutor = await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: "openai-functions",
    verbose: true,
  });
  return agentExecutor;
}

export async function handleAgentMessage(message: string, userPk: string, params: any = {}): Promise<string> {
  const agent = await getAgentExecutor();
  const input = JSON.stringify({ message, userPk, params });
  const response = await agent.invoke({ input });
  return response.output;
} 