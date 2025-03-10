import { Tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

export class GetQuoteTool extends Tool {
    name = "get_quote";
    description = "Retrieves a quote for swapping tokens from the 1inch API.";

    args_schema = z.object({
        fromToken: z.string(),
        toToken: z.string(),
        amount: z.string()
    });

    async _call(input: z.infer<typeof this.args_schema>): Promise<any> {
        const { fromToken, toToken, amount } = input;
        try {
            const response = await axios.get(`https://api.1inch.io/v4.0/1/quote`, {
                params: {
                    fromTokenAddress: fromToken,
                    toTokenAddress: toToken,
                    amount: amount
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching quote:", error);
            throw new Error("Failed to fetch quote.");
        }
    }
}