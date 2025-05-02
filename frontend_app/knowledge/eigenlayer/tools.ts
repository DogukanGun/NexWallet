import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { queries } from "./queries";

async function executeGraphQuery(query: string, apiKey: string) {
  const GRAPH_ENDPOINT = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/68g9WSC4QTUJmMpuSbgLNENrcYha4mPmXhWGCoupM7kB`;
  
  const response = await fetch(GRAPH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });
  return await response.json();
}

export const createEigenTools = (apiKey: string) => {
  const getStakingInfoTool = new DynamicStructuredTool({
    name: "getStakingInfo",
    description: "Get staking information from Eigenlayer",
    schema: z.object({
      address: z.string().optional().describe("Ethereum address to query staking info for")
    }),
    func: async ({ address }) => {
      const query = queries.stakingPools(address);
      return JSON.stringify(await executeGraphQuery(query, apiKey));
    }
  });

  const getDelegatorsTool = new DynamicStructuredTool({
    name: "getDelegators",
    description: "Get list of delegators and their information",
    schema: z.object({
      first: z.number().optional().describe("Number of results to return"),
      skip: z.number().optional().describe("Number of results to skip")
    }),
    func: async ({ first = 100, skip = 0 }) => {
      const query = queries.delegators(first, skip);
      return JSON.stringify(await executeGraphQuery(query, apiKey));
    }
  });

  const getOperatorsTool = new DynamicStructuredTool({
    name: "getOperators",
    description: "Get information about Eigenlayer operators",
    schema: z.object({
      first: z.number().optional().describe("Number of results to return"),
      skip: z.number().optional().describe("Number of results to skip")
    }),
    func: async ({ first = 100, skip = 0 }) => {
      const query = queries.operators(first, skip);
      return JSON.stringify(await executeGraphQuery(query, apiKey));
    }
  });

  return [
    getStakingInfoTool,
    getDelegatorsTool,
    getOperatorsTool
  ];
}; 