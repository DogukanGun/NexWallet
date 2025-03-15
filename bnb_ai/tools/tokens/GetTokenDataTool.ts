import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs";
import path from "path";

export class GetTokenDataTool extends Tool {
  name = "get_token_data";
  description = `If the user wanna get the data of a token, use this tool.
  Inputs ( input is a JSON string ):
  {
    "token_name": "string"
  }`;
  args_schema = z.object({
    token_name: z.string().describe("The name of the token"),
  });

  constructor() {
    super();
  }

  async _call(input: any) {
    try {
      const tokenListPath = path.join(__dirname, 'token_list.json');
      const tokenListData = fs.readFileSync(tokenListPath, 'utf-8');
      const tokens = JSON.parse(tokenListData);
      const tokenName = JSON.parse(input).token_name.toLowerCase();
      const closestToken = tokens.find((token: any) => token.name.toLowerCase() === tokenName || token.symbol.toLowerCase() === tokenName);

      if (closestToken) {
        return closestToken;
      } else {
        throw new Error("Token not found");
      }
    } catch (error: any) {
      console.error(error);
      throw new Error("An error occurred while fetching token data");
    }
  }
}
