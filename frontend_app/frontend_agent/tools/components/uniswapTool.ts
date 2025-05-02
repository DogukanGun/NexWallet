import { Tool } from "langchain/tools";
import { z } from "zod";

export class GetUniswapTool extends Tool {
    name = "get_uniswap_tool";
    description = `If an user wants to do a swap for any chain, use this tool.
    
    Input (input is a JSON string):
    walletAddress: string, e.g., "0x1234567890abcdef"
    `;
    argsSchema = z.object({
        walletAddress: z.string().describe("The wallet address of the user")
    });
    returnDirect = true;

    async _call(input: string) {
        console.log("uniswap-input", input);
        const inputFormat = JSON.parse(input);
        const walletAddress = inputFormat.walletAddress;
        return {
            "component": "uniswap",
            "params": {
                "walletAddress": walletAddress
            }
        }
    }
}   