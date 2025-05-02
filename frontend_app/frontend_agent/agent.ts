import { createAgent, LLMConfig } from '@/frontend_agent/agentHelpers';
import { GetAgentByContractAddressTool } from '../frontend_agent/tools/cookie/getAgentByContractAddressTool';
import { GetAgentByTwitterUsernameTool } from '../frontend_agent/tools/cookie/getAgentByTwitterUsernameTool';
import { GetAgentsPagedTool } from '../frontend_agent/tools/cookie/getAgentsPagedTool';
import { SearchTweetsTool } from '../frontend_agent/tools/cookie/searchTweetsTool';
import { StructuredToolInterface } from '@langchain/core/tools';
import { AskSolanaSdkAgent } from './tools/solona/askSolanaAgent';
import { AskCdpAgents } from './tools/cdp/askCdpAgents';
import { GetUniswapTool } from './tools/components/uniswapTool';
import { VoiceComponentTool } from './tools/voice/voiceComponents';
import { MessariAPI } from './tools/messari';
import { MessariPDFTool } from './tools/messari/pdfGenerator';
import { createMessariPDFContextModifier } from './messariMiddleware';
import { SwapIntentDetector } from './tools/detectors/swapIntentDetector';

export type agent = 'cookie' | 'messari' | 'onchain';

export async function createKnowledgeReactAgentV2(
    agentName: LLMConfig,
    messageModifier: string,
    agents: agent[],
    isOnchain: boolean,
    supportedChains: string[] = ["arbitrum", "optimism", "base", "ethereum", "bnb"],
    wallet: string,
    agentType: string = "text"
) {
    // Ensure we're on the server side
    if (typeof window !== 'undefined') {
        throw new Error('This function should only be called on the server side');
    }

    let tools: StructuredToolInterface[] = [];
    
    // Add PDF generation tools first for better prioritization
    if (agents.includes('messari')) {
        const messariAPI = new MessariAPI();
        tools.push(new MessariPDFTool(messariAPI)); // PDF Tool first for better routing
        tools.push(messariAPI);
        
        // Add Messari context to the message modifier
        messageModifier = messageModifier + '\n' + createMessariPDFContextModifier();
    }
    
    // Add cookie tools
    if (agents.includes('cookie')) {
        [
            new GetAgentByTwitterUsernameTool(),
            new GetAgentsPagedTool(),
            new SearchTweetsTool(),
            new GetAgentByContractAddressTool(),
        ].forEach((tool) => {
            tools.push(tool)
        })
    }
    
    // Add on-chain tools using Coinbase's AgentKit
    if (agents.includes('onchain')) {
        try {
            // Initialize Coinbase CDP Agent
            const cdpAgentTool = new AskCdpAgents(supportedChains);
            tools.push(cdpAgentTool);
            
            // Add swap intent detector
            tools.push(new SwapIntentDetector());
        } catch (error) {
            console.error('Error initializing Coinbase on-chain tools:', error);
            throw new Error('Failed to initialize Coinbase on-chain tools');
        }
    }

    // Add other blockchain tools
    tools.push(new AskSolanaSdkAgent(wallet))
    tools.push(new GetUniswapTool())
    
    // Only add Voice tools if this is a voice agent
    if (agentType === "voice") {
        tools.push(new VoiceComponentTool())
    }
    
    return createAgent(agentName, tools, messageModifier, isOnchain);
}

export default class FrontendAgent {
  private blockchainTools: any;
  private apiKey: string;
  
  constructor() {
    // Store the API key for CDP operations
    this.apiKey = process.env.COINBASE_API_KEY || '';
    
    // Dynamically require BlockchainTools to avoid bundling native plugin binaries
    const requireModule = eval('require');
    const BTModule = requireModule('./tools/blockchainTools');
    const BTClass = BTModule.default || BTModule;
    this.blockchainTools = new BTClass();
  }
  
  /**
   * Set wallet connections for blockchain operations
   * @param chains Array of connected chains with their addresses
   */
  setWalletConnections(chains: Array<{ chainId: number; address: string; isEmbedded: boolean }>) {
    for (const chain of chains) {
      // BNB Chain (BSC) has chainId 56
      if (chain.chainId === 56) {
        this.blockchainTools.setBNBWallet(chain.address);
      }
      
      // Solana has chainId 501
      if (chain.chainId === 501) {
        this.blockchainTools.setSolanaWallet(chain.address);
      }
    }
  }
  
  /**
   * Helper method to execute blockchain operations
   * @param operation The operation to perform
   * @param params Parameters for the operation
   */
  async executeBlockchainOperation(
    operation: string, 
    params: Record<string, any>
  ): Promise<any> {
    switch (operation) {
      case 'bnb.getBalance':
        return await this.blockchainTools.getBNBBalance(params.address);
        
      case 'bnb.getTokenInfo':
        return await this.blockchainTools.getBNBTokenInfo(params.tokenAddress);
        
      case 'bnb.sendTransaction':
        return await this.blockchainTools.sendBNBTransaction(
          params.to,
          params.amount,
          params.data
        );
        
      case 'solana.getAccountInfo':
        return await this.blockchainTools.getSolanaAccountInfo(params.accountAddress);
        
      case 'solana.simulateTransaction':
        return await this.blockchainTools.simulateSolanaTransaction(params.transaction);
        
      case 'solana.sendTransaction':
        return await this.blockchainTools.sendSolanaTransaction(params.transaction);
        
      default:
        throw new Error(`Unknown blockchain operation: ${operation}`);
    }
  }
} 