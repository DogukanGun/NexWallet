import { Tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

export class GetPoolsTool extends Tool {
    name = "get_pools";
    description = "Retrieves pool data from the Venus Protocol API.";

    args_schema = z.object({
        chainId: z.number().optional(),
        address: z.string().optional(),
        name: z.string().optional(),
        order: z.string().optional(),
        limit: z.number().default(20),
        page: z.number().default(0)
    });

    async _call(input: z.infer<typeof this.args_schema>): Promise<any> {
        const { chainId, address, name, order, limit, page } = input;
        try {
            const response = await axios.get(`https://api.venus.io/pools`, {
                params: {
                    chainId,
                    address,
                    name,
                    order,
                    limit,
                    page
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching pool data:", error);
            throw new Error("Failed to fetch pool data.");
        }
    }
}
