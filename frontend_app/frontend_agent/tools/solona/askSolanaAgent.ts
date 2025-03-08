import { HumanMessage } from "@langchain/core/messages";
import { createSolanaTools } from "@/solana-agent-kit";
import { SolanaAgentKit } from "@/solana-agent-kit";
import { Tool } from "langchain/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";

export class AskSolanaSdkAgent extends Tool {
    address: string;
    name = "ask_solana_sdk_agent";
    description = `Use this tool EXCLUSIVELY for Solana blockchain related questions or commands.
    This includes Solana token prices, wallet balances, transactions, and any other Solana-specific information.
    Input should be a string containing your Solana-related query.`;
    constructor(address: string) {
        super();
        this.address = address;
    }

    async _call(input: string) {
        console.log("input-solana", input);
        const solanaAgent = new SolanaAgentKit(this.address, process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com", { OPENAI_API_KEY: process.env.OPENAI_API_KEY })
        solanaAgent.isUiMode = true;
        solanaAgent.onSignTransaction = async (tx) => {
          console.log(tx);
          return tx;
        }
        const tools = createSolanaTools(solanaAgent);
    
        const memory = new MemorySaver();
        const config = { configurable: { thread_id: "Solana Agent Kit!" } };
        const llm = new ChatOpenAI({
          modelName: "gpt-4o-mini",
          temperature: 0.5,
        });
        const agent = createReactAgent({
          llm,
          tools,
          checkpointSaver: memory,
          messageModifier: `
            You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
            empowered to interact onchain using your tools. If you ever need funds, you can request them from the
            faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
            (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
            can't do with your currently available tools, you must say so, and encourage them to implement it
            themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
            concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
          `,
        });
        const stream = await agent.stream(
          { messages: [new HumanMessage(input)] },
          config,
        );
        let response = "";
        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log("chunk.agent", chunk.agent);
            response += chunk.agent.messages[0].content;
          } else if ("tools" in chunk) {
            console.log("chunk.tools", chunk.tools);
            response += chunk.tools.messages[0].content;
          }
          console.log("-------------------");
        }
        return response;
    }

}