import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { StructuredToolInterface } from "@langchain/core/tools";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatMessage, AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

// Define an interface for llmConfig
export interface LLMConfig {
    modelName: string;
    temperature: number;
}

type LilypadModelType = 'llama_onchain' | 'deepseek_onchain';

// Map of model IDs to their Lilypad model names
const LILYPAD_MODEL_MAPPING: Record<LilypadModelType, string> = {
    'llama_onchain': 'llama3.1:8b',
    'deepseek_onchain': 'deepseek-r1:7b'
};

<<<<<<< HEAD
// Create a custom class for Lilypad integration if needed
=======
// Create a custom class for Lilypad integration
>>>>>>> feat/lilypad_integration
class LilypadChatModel extends BaseChatModel {
    private model: string;
    private temperature: number;
    private apiKey: string;
    
<<<<<<< HEAD
    constructor(model: string, temperature: number, apiKey: string) {
        super({});
        this.model = model;
        this.temperature = temperature;
        this.apiKey = apiKey;
=======
    constructor(model: string, temperature: number) {
        super({});
        this.model = model;
        this.temperature = temperature;
        this.apiKey = process.env.LILYPAD_API_KEY || "";
>>>>>>> feat/lilypad_integration
    }
    
    _llmType(): string {
        return "lilypad";
    }
    
    bindTools(tools: StructuredToolInterface[]): BaseChatModel {
<<<<<<< HEAD
        // Return self when binding tools - we'll handle tool usage in _generate
=======
>>>>>>> feat/lilypad_integration
        return this;
    }
    
    async _generate(messages: ChatMessage[]): Promise<any> {
        try {
<<<<<<< HEAD
            const formattedMessages = messages.map(message => {
                if (message instanceof HumanMessage) {
                    return { role: "user", content: message.content };
                } else if (message instanceof AIMessage) {
                    return { role: "assistant", content: message.content };
                } else if (message instanceof SystemMessage) {
                    return { role: "system", content: message.content };
                } else {
                    return { role: "user", content: message.content };
                }
            });
            
            const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/chat/completions", {
=======
            // Format the conversation history into a prompt string
            const prompt = messages.map(message => {
                let role = "user";
                if (message instanceof AIMessage) {
                    role = "assistant";
                } else if (message instanceof SystemMessage) {
                    role = "system";
                }
                return `${role}: ${message.content}`;
            }).join('\n');

            // Make a direct API call to Lilypad's inference endpoint
            const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/inference", {
>>>>>>> feat/lilypad_integration
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
<<<<<<< HEAD
                    messages: formattedMessages,
                    temperature: this.temperature,
                    max_tokens: 2048
                })
            });
            
            if (!response.ok) {
                throw new Error(`Lilypad API error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log("Lilypad API response:", JSON.stringify(result, null, 2));
            
            return {
                generations: [
                    {
                        text: result.choices[0].message.content,
                        message: new AIMessage(result.choices[0].message.content)
=======
                    prompt: prompt,
                    temperature: this.temperature,
                    max_tokens: 2048,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Lilypad API error: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
            }

            const result = await response.json();
            console.log("Lilypad API response:", JSON.stringify(result, null, 2));

            // Extract the generated text from Lilypad's response format
            const generatedText = result.response || result.output || "";

            return {
                generations: [
                    {
                        text: generatedText,
                        message: new AIMessage(generatedText)
>>>>>>> feat/lilypad_integration
                    }
                ]
            };
        } catch (error) {
            console.error("Error calling Lilypad API:", error);
            throw error;
        }
    }
}

export const createAgent = (llmConfig: LLMConfig, tools: StructuredToolInterface[], messageModifier: string, isOnchain: boolean) => {
    let llm;
    
    if (isOnchain) {
        // Use Lilypad's inference API for llama 3.1 and deepseek
        const lilypadModel = LILYPAD_MODEL_MAPPING[llmConfig.modelName as LilypadModelType];
        if (!lilypadModel) {
            throw new Error(`Unsupported onchain model: ${llmConfig.modelName}`);
        }

<<<<<<< HEAD
        llm = new ChatOpenAI({
            modelName: lilypadModel,
            temperature: llmConfig.temperature,
            streaming: false,
            apiKey: process.env.LILYPAD_API_KEY || "",
            configuration: {
                baseURL: "https://anura-testnet.lilypad.tech/api/v1",
                defaultHeaders: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.LILYPAD_API_KEY}`
                }
            },
            callbacks: [{
                handleLLMNewToken(token: string) {
                    console.log("Token:", token);
                },
                handleLLMStart() {
                    console.log("Starting LLM call to Lilypad...");
                },
                handleLLMEnd(output) {
                    console.log("LLM call complete:", JSON.stringify(output, null, 2));
                },
                handleLLMError(err) {
                    console.error("LLM error:", err);
                }
            }],
        });
    } else {
        // Handle different OpenAI models based on llmConfig
        const modelName = llmConfig.modelName === "openai" ? "gpt-4" : llmConfig.modelName;
        llm = new ChatOpenAI({
            ...llmConfig,
            modelName,
=======
        llm = new LilypadChatModel(lilypadModel, llmConfig.temperature);
    } else {
        // Handle OpenAI models
        let modelName: string;
        
        // Map provider IDs to actual model names
        if (llmConfig.modelName.toLowerCase() === "openai") {
            modelName = "gpt-4";
        } else if (llmConfig.modelName === "gpt-4o-mini") {
            modelName = "gpt-4";
        } else if (llmConfig.modelName.startsWith("gpt-")) {
            modelName = llmConfig.modelName;
        } else {
            throw new Error(`Invalid OpenAI model name: ${llmConfig.modelName}. Expected 'openai' (case-insensitive) or a model name starting with 'gpt-'`);
        }
        
        llm = new ChatOpenAI({
            modelName: modelName,
            temperature: llmConfig.temperature,
>>>>>>> feat/lilypad_integration
            apiKey: process.env.OPEN_AI_KEY
        });
    }

    const memory = new MemorySaver();

    return createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier,
    });
};