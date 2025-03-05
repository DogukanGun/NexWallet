import { HumanMessage } from "@langchain/core/messages";
import { createSolanaTools } from "@/solana-agent-kit";
import { SolanaAgentKit } from "@/solana-agent-kit";
import { Tool } from "langchain/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";


export class AskSolanaSdkAgent extends Tool {

    name = "ask_solana_sdk_agent";
    description = `When an user request anything about solana, you should use this tool to answer the question. You will receive a text as result 
    do not change it or modify it. 
    
    Input (input is a JSON string):
    text: string, e.g., "What is the price of SOL?"
    address: string, e.g., "8E7uMfmyZH5aG2gmPZbn8hBg19M649mVZMJ93v5gsyVC"
    `;
    returnDirect: boolean = true;

    async _call(input: string) {
        const { text, address } = JSON.parse(input);
        const agent = new SolanaAgentKit(address, "https://api.mainnet-beta.solana.com", { OPENAI_API_KEY: process.env.OPENAI_API_KEY })
        const memory = new MemorySaver();
        agent.isUiMode = true;
        agent.onSignTransaction = async (transaction) => {
            console.log(transaction)
            return transaction;
        }
        const tools = createSolanaTools(agent);

        const reactAgent = createReactAgent({
            llm: new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0.3 }),
            tools: tools,
            messageModifier: `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
      empowered to interact onchain using your tools. If you ever need funds, you can request them from the
      faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
      (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
      can't do with your currently available tools, you must say so, and encourage them to implement it
      themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
      concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
            checkpointSaver: memory,
        });

        let response = "";
        const stream = await reactAgent.stream(
            { messages: [new HumanMessage(text)] },
            { configurable: { thread_id: "CDP AgentKit" } },
        );

        for await (const chunk of stream) {
            if ("agent" in chunk) {
                console.log(chunk.agent.messages[0].content);
                response = chunk.agent.messages[0].content;
            } else if ("tools" in chunk) {
                console.log(chunk.tools.messages[0].content);
            }
            console.log("-------------------");
        }
        return response
    }

}