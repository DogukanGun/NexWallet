import { Tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

export class GetSwapTool extends Tool {
    name = "get_swap";
    description = "Executes a token swap using the 1inch API.";

    args_schema = z.object({
        fromToken: z.string(),
        toToken: z.string(),
        amount: z.string(),
        fromAddress: z.string(),
        slippage: z.string()
    });

    async _call(input: z.infer<typeof this.args_schema>): Promise<any> {
        const { fromToken, toToken, amount, fromAddress, slippage } = input;
        try {
            const response = await axios.get(`https://api.1inch.io/v4.0/1/swap`, {
                params: {
                    fromTokenAddress: fromToken,
                    toTokenAddress: toToken,
                    amount: amount,
                    fromAddress: fromAddress,
                    slippage: slippage
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error executing swap:", error);
            throw new Error("Failed to execute swap.");
        }
    }
}