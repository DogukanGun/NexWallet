
import { createAgent, LLMConfig } from '@/frontend_agent/agentHelpers';
import { GetAgentByContractAddressTool } from '../frontend_agent/tools/cookie/getAgentByContractAddressTool';
import { GetAgentByTwitterUsernameTool } from '../frontend_agent/tools/cookie/getAgentByTwitterUsernameTool';
import { GetAgentsPagedTool } from '../frontend_agent/tools/cookie/getAgentsPagedTool';
import { SearchTweetsTool } from '../frontend_agent/tools/cookie/searchTweetsTool';
import { StructuredToolInterface } from '@langchain/core/tools';
import { AskSolanaSdkAgent } from './tools/solona/askSolanaAgent';
import { AskCdpAgents } from './tools/cdp/askCdpAgents';
import { GetUniswapTool } from './tools/components/uniswapTool';

export type agent = 'cookie';

export function createKnowledgeReactAgentV2(
    agentName: LLMConfig,
    messageModifier: string,
    agents: agent[],
    isOnchain: boolean,
    supportedChains: string[] = ["arbitrum", "optimism", "base", "ethereum"],
    wallet: string
) {
    let tools: StructuredToolInterface[] = [];
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
    tools.push(new AskSolanaSdkAgent(wallet))
    tools.push(new GetUniswapTool())
    tools.push(new AskCdpAgents(supportedChains))
    return createAgent(agentName, tools, messageModifier, isOnchain);
} 