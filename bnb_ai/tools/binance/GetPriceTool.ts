import { Tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

export class GetPriceTool extends Tool {
    name = "get_price";
    description = `Fetches the price of specified symbols from the Binance API. If the response isn't returned,
    then call get_supported_symbols tool to get the supported symbols.
    `;

    args_schema = z.object({
        symbols: z.string()
    });

    async _call(input: z.infer<typeof this.args_schema>): Promise<any> {
        const { symbols } = input;
        const data = JSON.stringify({
            "sign": true,
            "symbols": symbols
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://oracle.binance.com/api/gw/symbol-price',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: data
        };

        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error("Error fetching price:", error);
            throw new Error("Failed to fetch price.");
        }
    }
}