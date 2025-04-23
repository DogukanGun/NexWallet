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
import { ElizaCharacterTool } from './tools/eliza/elizaCharacterTool';
import { getElizaService } from '../eliza';
import BlockchainTools from './tools/blockchainTools';

export type agent = 'cookie' | 'messari' | 'eliza';

export function createKnowledgeReactAgentV2(
    agentName: LLMConfig,
    messageModifier: string,
    agents: agent[],
    isOnchain: boolean,
    supportedChains: string[] = ["arbitrum", "optimism", "base", "ethereum"],
    wallet: string
) {
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
    
    // Add Eliza character tool if enabled
    if (agents.includes('eliza')) {
        // Add the Eliza character tool which now calls the API directly
        tools.push(new ElizaCharacterTool());
    }
    
    // Add other blockchain tools
    tools.push(new AskSolanaSdkAgent(wallet))
    tools.push(new GetUniswapTool())
    tools.push(new VoiceComponentTool())
    
    return createAgent(agentName, tools, messageModifier, isOnchain);
}

export default class FrontendAgent {
  private elizaService: any;
  private blockchainTools: BlockchainTools;
  
  constructor() {
    // Initialize Eliza service
    this.elizaService = getElizaService();
    
    // Initialize blockchain tools
    this.blockchainTools = new BlockchainTools(this.elizaService);
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