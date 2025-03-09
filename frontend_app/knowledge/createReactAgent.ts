
import { createAgent, LLMConfig } from '@/frontend_agent/agentHelpers';
import { GetAgentByContractAddressTool } from '../frontend_agent/tools/cookie/getAgentByContractAddressTool';
import { GetAgentByTwitterUsernameTool } from '../frontend_agent/tools/cookie/getAgentByTwitterUsernameTool';
import { GetAgentsPagedTool } from '../frontend_agent/tools/cookie/getAgentsPagedTool';
import { SearchTweetsTool } from '../frontend_agent/tools/cookie/searchTweetsTool';
import { createEigenTools } from './eigenlayer/tools';
import { StructuredToolInterface } from '@langchain/core/tools';

export type agent = 'cookie' | 'eigenlayer';

export function createKnowledgeReactAgent(
    agentName: LLMConfig, 
    messageModifier: string,
    agents: agent[],
    isOnchain: boolean
) {
    let tools: StructuredToolInterface[] = [];
    if(agents.includes('eigenlayer')) {
        createEigenTools(process.env.GRAPH_API_KEY!)
        .forEach((tool)=>{
            tools.push(tool)
        })
    }
    if(agents.includes('cookie')) {
        [
            new GetAgentByTwitterUsernameTool(),
            new GetAgentsPagedTool(),
            new SearchTweetsTool(),
            new GetAgentByContractAddressTool(),
        ].forEach((tool)=>{
            tools.push(tool)
        })
    }
    return createAgent(agentName, tools, messageModifier, isOnchain);
} 