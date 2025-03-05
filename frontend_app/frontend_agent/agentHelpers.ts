import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { StructuredToolInterface } from "@langchain/core/tools";

// Define an interface for llmConfig
export interface LLMConfig {
    modelName: string;
    temperature: number;
}

export const createAgent = (llmConfig: LLMConfig, tools: StructuredToolInterface[], messageModifier: string, isOnchain: boolean) => {
    const llm = !isOnchain ? new ChatOpenAI(llmConfig) : new ChatOpenAI({
        model: "llama",
        apiKey: "GAIA",
    }, {
        baseURL: "https://llamatool.us.gaianet.network/v1"
    });
    const memory = new MemorySaver();

    return createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier,
    });
};