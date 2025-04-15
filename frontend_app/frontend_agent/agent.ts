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
    tools.push(new AskCdpAgents(supportedChains))
    tools.push(new VoiceComponentTool())
    
    return createAgent(agentName, tools, messageModifier, isOnchain);
} 