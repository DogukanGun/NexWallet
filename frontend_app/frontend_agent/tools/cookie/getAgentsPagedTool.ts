// This file defines a tool for retrieving agents in a paged format.

import { Tool } from "langchain/tools";
import { z } from "zod"; // Import zod

export class GetAgentsPagedTool extends Tool {
    name = "get_agents_paged";
    description = `Retrieve a list of agents in a paged format.
    
    Input (input is a JSON string):
    interval: string, e.g., "_7Days"
    page: number, e.g., 1
    pageSize: number, e.g., 10
    `;

    async _call(input: string) {
        try {
            const inputFormat = JSON.parse(input);
            const interval = inputFormat.interval;
            const page = inputFormat.page;
            const pageSize = inputFormat.pageSize;

            const response = await fetch(`https://api.cookie.fun/v2/agents/agentsPaged?interval=${interval}&page=${page}&pageSize=${pageSize}`, {
                headers: {
                    'x-api-key': process.env.COOKIE_API_KEY || '',
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("Paged Agents Data:", data);
            return data;
        } catch (error) {
            console.error("Error processing request:", error, input);
            throw new Error("Invalid input format or API request failed.");
        }
    }
} 