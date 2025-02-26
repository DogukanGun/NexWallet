import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getTools } from './tools';
import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
import { MemorySaver } from "@langchain/langgraph";


const getAgent = (chatId: string) => {
    const tools = getTools(chatId);
    dotenv.config();
    const llm = new ChatOpenAI(
        { modelName: "gpt-4o-mini", temperature: 0.3 }
    )
    const memory = new MemorySaver();

    // Create the LangChain agent
    return createReactAgent({
        llm: llm,
        tools: tools,
        checkpointSaver: memory,
    });

}

// Export the agent
export default getAgent; 