import { Tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

export class GetGovernanceProposalsTool extends Tool {
    name = "get_governance_proposals";
    description = "Retrieves governance proposals from the Venus Protocol API.";

    args_schema = z.object({
        proposalId: z.number().optional(),
        state: z.string().optional(),
        limit: z.number().default(20),
        page: z.number().default(0)
    });

    async _call(input: z.infer<typeof this.args_schema>): Promise<any> {
        const { proposalId, state, limit, page } = input;
        try {
            const response = await axios.get(`https://api.venus.io/governance/proposals`, {
                params: {
                    proposalId,
                    state,
                    limit,
                    page
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching governance proposals:", error);
            throw new Error("Failed to fetch governance proposals.");
        }
    }
}
