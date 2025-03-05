
import { createAgent, LLMConfig } from '@/frontend_agent/agentHelpers';
import { GetAgentByContractAddressTool } from '../frontend_agent/tools/cookie/getAgentByContractAddressTool';
import { GetAgentByTwitterUsernameTool } from '../frontend_agent/tools/cookie/getAgentByTwitterUsernameTool';
import { GetAgentsPagedTool } from '../frontend_agent/tools/cookie/getAgentsPagedTool';
import { SearchTweetsTool } from '../frontend_agent/tools/cookie/searchTweetsTool';
import { StructuredToolInterface } from '@langchain/core/tools';
import { AskSolanaSdkAgent } from './tools/solona/askSolanaAgent';
import { AskCdpAgents } from './tools/cdp/askCdpAgents';

export type agent = 'cookie';

export function createKnowledgeReactAgent(
    agentName: LLMConfig,
    messageModifier: string,
    agents: agent[],
    isOnchain: boolean
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
    tools.push(new AskSolanaSdkAgent())
    tools.push(new AskCdpAgents())
    return createAgent(agentName, tools, messageModifier, isOnchain);
} 