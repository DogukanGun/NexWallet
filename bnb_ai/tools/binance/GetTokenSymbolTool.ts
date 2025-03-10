import { Tool } from "@langchain/core/tools";
import axios from "axios";

export class GetSupportedSymbolsTool extends Tool {
    name = "get_supported_symbols";
    description = "Fetches the supported symbols from the Binance API.";

    async _call(): Promise<any> {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://oracle.binance.com/api/gw/available-symbols',
            headers: { 
                'Accept': 'application/json'
            }
        };

        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error("Error fetching supported symbols:", error);
            throw new Error("Failed to fetch supported symbols.");
        }
    }
}
