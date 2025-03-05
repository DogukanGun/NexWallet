import { Tool } from "langchain/tools";

export class AskCdpAgents extends Tool {

    name = "ask_cdp_agents";
    description = `When an user request anything about arbiturm, optimism, base and ethereum, you should use this tool to answer the question. You will receive a text as result 
    do not change it or modify it. 
    
    Input (input is a JSON string):
    text: string, e.g., "What is the price of SOL?"
    wallet: string, e.g., "0x1234567890123456789012345678901234567890"
    `;
    returnDirect: boolean = true;

    async _call(input: string) {
        const { text, wallet } = JSON.parse(input);
        
        // Send a request to the Python endpoint using fetch
        try {
            const response = await fetch('http://localhost:8000/agent/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    wallet_address: wallet
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.response; // Return the response from the server
        } catch (error) {
            console.error("Error calling the agent:", error);
            throw new Error("Failed to get response from agent.");
        }
    }

}