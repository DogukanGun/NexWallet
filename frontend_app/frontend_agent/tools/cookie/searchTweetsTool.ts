// This file defines a tool for searching tweets.

import { Tool } from "langchain/tools";
import { z } from "zod";

export class SearchTweetsTool extends Tool {
    name = "search_tweets";
    description = `Retrieve popular content matching a search query.
    
    Input (input is a JSON string):
    searchQuery: string, e.g., "blockchain"
    from: string, e.g., "2023-01-01"
    to: string, e.g., "2023-12-31"
    `;

    async _call(input: string) {
        try {
            const inputFormat = JSON.parse(input);
            const searchQuery = inputFormat.searchQuery;
            const from = inputFormat.from;
            const to = inputFormat.to;

            const response = await fetch(`https://api.cookie.fun/v1/hackathon/search/${searchQuery}?from=${from}&to=${to}`, {
                headers: {
                    'x-api-key': process.env.COOKIE_API_KEY || '',
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("Search Results:", data);
            return data;
        } catch (error) {
            console.error("Error processing request:", error, input);
            throw new Error("Invalid input format or API request failed.");
        }
    }
} 