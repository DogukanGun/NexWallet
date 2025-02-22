import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { transferAssetTool, checkBalanceTool, swapAssetTool } from './tools';

// Define the base prompt for the agent
const AGENT_SYSTEM_PROMPT = `You are an AI agent specialized in handling asset transfers and swaps across different blockchain networks.
Your main responsibility is to facilitate secure and efficient asset operations while following best practices.
Always verify the following before proceeding with any operation:
1. Source and destination addresses are valid
2. Sufficient balance is available
3. Network fees can be covered
4. The transfer amount is within acceptable limits
5. The chains are supported (multiversx, ethereum, binance-smart-chain)
6. For swaps, check the price impact and slippage

If any of these checks fail, provide clear feedback to the user.`;

// Create the agent
export async function createAssetTransferAgent(openAIApiKey: string) {
    const llm = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0,
        openAIApiKey,
    });

    const tools = [transferAssetTool, checkBalanceTool, swapAssetTool];

    const systemMessage = SystemMessagePromptTemplate.fromTemplate(AGENT_SYSTEM_PROMPT);
    const humanMessage = HumanMessagePromptTemplate.fromTemplate(`
You have access to the following tools:

{tools}

Use these tools to help users transfer and swap assets safely and efficiently across different chains.
For swaps, always check the price impact and expected output before proceeding.
Remember to always verify addresses, balances, and chain compatibility before proceeding with any operation.`);

    const prompt = ChatPromptTemplate.fromMessages([systemMessage, humanMessage]);

    const agent = await createOpenAIFunctionsAgent({
        llm,
        tools,
        prompt
    });
    
    return AgentExecutor.fromAgentAndTools({
        agent,
        tools
    });
} 