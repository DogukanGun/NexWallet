import { createAssetTransferAgent } from './assetTransferAgent';
import { HumanMessage } from '@langchain/core/messages';

export class MultiverseAgent {
    private agent: any;
    private openAIApiKey: string;

    constructor(openAIApiKey: string) {
        this.openAIApiKey = openAIApiKey;
    }

    async init() {
        this.agent = await createAssetTransferAgent(this.openAIApiKey);
        return this;
    }

    async stream(text: string) {
        if (!this.agent) {
            throw new Error('Agent not initialized. Call init() first.');
        }

        const stream = await this.agent.stream(
            { messages: [new HumanMessage(text)] },
            { configurable: { thread_id: "Multiverse Agent" } }
        );

        return stream;
    }

    async invoke(text: string) {
        if (!this.agent) {
            throw new Error('Agent not initialized. Call init() first.');
        }

        return this.agent.invoke({
            input: text
        });
    }
}

// Example usage:
/*
const agent = new MultiverseAgent(process.env.OPENAI_API_KEY);
await agent.init();

// Streaming usage
const stream = await agent.stream("Transfer 1 SOL from address ABC to XYZ");
for await (const chunk of stream) {
    if ("agent" in chunk) {
        console.log(chunk.agent.messages[0].content);
    } else if ("tools" in chunk) {
        console.log(chunk.tools.messages[0].content);
    }
}

// Direct invocation
const result = await agent.invoke("Check balance of address ABC");
console.log(result);
*/ 