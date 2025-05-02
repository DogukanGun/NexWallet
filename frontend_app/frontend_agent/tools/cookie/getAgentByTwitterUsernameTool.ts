// This file defines a tool for retrieving an agent by Twitter username.

import { Tool } from "langchain/tools";


export class GetAgentByTwitterUsernameTool extends Tool {
    name = "get_agent_by_twitter_username";
    description = `Retrieve agent details by Twitter username.
    
    Input ( input is a JSON string ):
    twitterUsername: string, Cookie.Dao
    interval: string, _7Days
    `;

    async _call(input: string) {
        try {
            // Validate and parse the input
            const inputFormat = JSON.parse(input);
            const twitterUsername = inputFormat.twitterUsername;
            const interval = inputFormat.interval || "_7Days";

            // Make the API call
            const response = await fetch(`https://api.cookie.fun/v2/agents/twitterUsername/${twitterUsername}?interval=${interval}`, {
                headers: {
                    'x-api-key': process.env.COOKIE_API_KEY || '',
                }
            });

            // Check for response errors
            console.log("Response: ", response)
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("Agent Data by Twitter Username:", data);
            return data;
        } catch (error) {
            console.error("Error processing request:", error, input);
            throw new Error("Invalid input format or API request failed.");
        }
    }
} 