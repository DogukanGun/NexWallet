import { Tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

export class GetMarketsTool extends Tool {
    name = "get_markets";
    description = "Retrieves market data from the Venus Protocol API.";

    args_schema = z.object({
        chainId: z.number().optional(),
        address: z.string().optional(),
        order: z.string().optional(),
        limit: z.number().default(20),
        page: z.number().default(0)
    });

    async _call(input: z.infer<typeof this.args_schema>): Promise<any> {
        const { chainId, address, order, limit, page } = input;
        try {
            const response = await axios.get(`https://api.venus.io/markets`, {
                params: {
                    chainId,
                    address,
                    order,
                    limit,
                    page
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching market data:", error);
            throw new Error("Failed to fetch market data.");
        }
    }
}
