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