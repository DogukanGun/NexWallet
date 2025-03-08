import { Tool } from "langchain/tools";
import { z } from "zod";
export class AskCdpAgents extends Tool {
    supportedChains: string[] = ["arbitrum", "optimism", "base", "ethereum"];
    name = "ask_cdp_agents";
    description = `Use this tool ONLY for questions about the following chains: ${this.supportedChains.join(", ")}.
    You will receive a text response as a result; do not modify it.
    
    DO NOT use this tool for Solana-related questions - use ask_solana_sdk_agent instead.
    
    Input (input is a JSON string):
    text: string, e.g., "What is the price of ETH?"
    wallet: string, e.g., "0x1234567890123456789012345678901234567890" (optional) (if not provided, it will be empty string)
    `;
    args_schema = z.object({
        text: z.string(),
        wallet: z.string().optional()
    });

    constructor(chains: string[]) {
        super();
        this.supportedChains = chains;
        this.description = `Use this tool ONLY for questions about the following chains: ${chains.join(", ")}.
        You will receive a text response as a result; do not modify it.
        
        DO NOT use this tool for Solana-related questions - use ask_solana_sdk_agent instead.
        
        Input (input is a JSON string):
        text: string, e.g., "What is the price of ETH?"
        wallet: string, e.g., "0x1234567890123456789012345678901234567890" (optional) (if not provided, it will be empty string)
        `;
    }

    async _call(input: z.infer<typeof this.args_schema>) {
        console.log("input", input);
        console.log("asking cdp agents");
        const { text, wallet } = input;
        console.log("text", text);
        console.log("wallet", wallet);
        
        // Check if the query is Solana-related - if so, redirect
        const solanaKeywords = ['solana', 'sol token', 'sol price', 'sol wallet'];
        const inputText = typeof text === 'string' ? text.toLowerCase() : '';
        
        if (solanaKeywords.some(keyword => inputText.includes(keyword))) {
            return "This query is about Solana. Please use the ask_solana_sdk_agent tool instead.";
        }
        
        // Send a request to the Python endpoint using fetch
        try {
            const response = await fetch('http://localhost:8000/agent/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text || String(input),
                    wallet_address: wallet || ""
                }),
            });
            console.log("response", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("data", data);
            return data.response; // Return the response from the server
        } catch (error) {
            console.error("Error calling the agent:", error);
            throw new Error("Failed to get response from agent.");
        }
    }

}