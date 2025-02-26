// This file defines a tool for retrieving the price of a token.

import { Tool } from "langchain/tools";
import { getTokenPrice } from "../getPriceTool";

export class GetPriceTool extends Tool {
    name = "get_price";
    description = `Retrieve the price of a token by its contract address.
    
    Input (input is a JSON string):
    tokenAddress: string, The contract address of the token.
    `;

    async _call(input: string) {
        try {
            // Validate and parse the input
            const inputFormat = JSON.parse(input);
            const tokenAddress = inputFormat.tokenAddress;

            // Call the getTokenPrice function
            const priceData = await getTokenPrice(tokenAddress);
            return priceData;
        } catch (error) {
            console.error("Error processing request:", error, input);
            throw new Error("Invalid input format or price retrieval failed.");
        }
    }
} 