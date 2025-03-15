import { Tool } from "@langchain/core/tools";
import { z } from "zod";


export class MakeSwapAtUniswap extends Tool {
  name = "make_swap_at_uniswap";
  description = `If the user wanna make a swap at specific uniswap pool, use this tool. Otherwise,
  use the "make_swap" tool.`;


  constructor(
  ) {
    super();
  }

  async _call(input: any) {
    try {
        return {
            component: "uniswap"
        }
    } catch (error: any) {
        return {
            component: "error",
            reason: "uniswap"
        }
    }
  }
}
