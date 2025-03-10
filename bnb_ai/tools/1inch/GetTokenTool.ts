import { Tool } from "@langchain/core/tools";
import axios from "axios";

export class GetTokensTool extends Tool {
    name = "get_tokens";
    description = "Fetches available tokens from the 1inch API.";

    async _call(): Promise<any> {
        try {
            const response = await axios.get(`https://api.1inch.io/v4.0/1/tokens`);
            return response.data;
        } catch (error) {
            console.error("Error fetching tokens:", error);
            throw new Error("Failed to fetch tokens.");
        }
    }
}