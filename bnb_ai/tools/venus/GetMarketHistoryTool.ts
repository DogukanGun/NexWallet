import { Tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

export class GetMarketHistoryTool extends Tool {
    name = "get_market_history";
    description = "Retrieves historical market data from the Venus Protocol API.";

    args_schema = z.object({
        marketId: z.string().optional(),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
        limit: z.number().default(20),
        page: z.number().default(0)
    });

    async _call(input: z.infer<typeof this.args_schema>): Promise<any> {
        const { marketId, startTime, endTime, limit, page } = input;
        try {
            const response = await axios.get(`https://api.venus.io/markets/history`, {
                params: {
                    marketId,
                    startTime,
                    endTime,
                    limit,
                    page
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching market history data:", error);
            throw new Error("Failed to fetch market history data.");
        }
    }
} 