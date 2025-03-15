import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import { NetworkEnum } from "@1inch/cross-chain-sdk";

export class GetChainIDTool extends Tool {
  name = "get_chain_id";
  description = `If the user wanna get the chain id of a chain, use this tool.
  Inputs ( input is a JSON string ):
  {
    "chain_name": "string"
  }`;
  args_schema = z.object({
    chain_name: z.string().describe("The name of the chain"),
  });

  constructor() {
    super();
  }

  async _call(input: any) {
    try {
      const chainId = NetworkEnum[input.chain_name];
      return chainId;
    } catch (error: any) {
      console.error(error);
      throw new Error("An error occurred while fetching token data");
    }
  }
}
