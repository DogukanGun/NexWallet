import { Tool } from "langchain/tools";

export class GetAgentByContractAddressTool extends Tool {
    name = "get_agent_by_contract_address";
    description = `Retrieve agent details by contract address.
    
    Input (input is a JSON string):
    contractAddress: string, e.g., "0x1234567890abcdef"
    interval: string, e.g., "_7Days"
    `;

    async _call(input: string) {
        try {
            const inputFormat = JSON.parse(input);
            const contractAddress = inputFormat.contractAddress;
            const interval = inputFormat.interval || "_7Days";

            const response = await fetch(`https://api.cookie.fun/v2/agents/contractAddress/${contractAddress}?interval=${interval}`, {
                headers: {
                    'x-api-key': process.env.COOKIE_API_KEY || '',
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("Agent Data by Contract Address:", data);
            return data;
        } catch (error) {
            console.error("Error processing request:", error, input);
            throw new Error("Invalid input format or API request failed.");
        }
    }
}