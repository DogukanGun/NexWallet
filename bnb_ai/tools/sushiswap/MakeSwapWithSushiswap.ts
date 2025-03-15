import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import { opBNB } from 'viem/chains'
import { createPublicClient, createWalletClient, http, type Hex } from 'viem'
import { type SwapResponse } from 'sushi/api'

export class MakeSwapAtSushi extends Tool {
  name = "make_swap_at_sushi";
  description = `If the user wanna make a swap, use this tool`;
  args_schema = z.object({
    inputCurrency: z.string().describe("The input currency"),
    outputCurrency: z.string().describe("The output currency"),
    amount: z.string().describe("The amount of the swap"),
    maxSlippage: z.string().describe("The max slippage of the swap"),
    sender: z.string().describe("The sender of the swap"),
  });


  constructor(
  ) {
    super();
  }

  async _call(input: any) {
    try {
      const { inputCurrency, outputCurrency, amount, maxSlippage, sender } = input;
      const publicClient = createPublicClient({
        chain: opBNB,
        transport: http(),
      })

      const chainId = opBNB.id

      const SWAP_API_URL = new URL('https://api.sushi.com/swap/v6/' + chainId)

      const { searchParams } = SWAP_API_URL
      searchParams.set('tokenIn', inputCurrency)
      searchParams.set('tokenOut', outputCurrency)
      searchParams.set('amount', amount.toString())
      searchParams.set('maxSlippage', maxSlippage.toString())
      searchParams.set('sender', sender)

      // Make call to API
      console.log(SWAP_API_URL.toString())
      const res = await fetch(SWAP_API_URL.toString())
      const data = await res.json() as SwapResponse
      console.log(data)

      // If the swap status is 'Success'
      if (data.status === 'Success') {
        const { tx } = data
        // Simulate a call to the blockchain for the swap
        const callResult = await publicClient.call({
          account: tx.from,
          data: tx.data,
          to: tx.to,
          value: tx.value,
        })
        // Returns the simulated amount out
        console.log('Output: ', callResult)

        return {
          data: tx.data,
          to: tx.to,
          value: tx.value,
        }
      }
    } catch (error: any) {
      return {
        component: "error",
        reason: "uniswap"
      }
    }
  }
}
