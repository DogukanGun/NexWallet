import { GetQuoteTool, GetSwapTool } from "./1inch";
import { GetPriceTool, GetSupportedSymbolsTool } from "./binance";
import { MakeSwapAtUniswap } from "./uniswap/MakeSwapAtUniswap";
import { GetTokenDataTool } from "./tokens/GetTokenDataTool";
import { MakeSwapAtSushi } from "./sushiswap/MakeSwapWithSushiswap";
import { GetChainIDTool } from "./chains/GetChainIDTool";
const bnbTools = [
    new MakeSwapAtUniswap(),
    new GetQuoteTool(),
    new GetSwapTool(),
    new GetPriceTool(),
    new GetSupportedSymbolsTool(),
    new GetTokenDataTool(),
    new MakeSwapAtSushi(),
    new GetChainIDTool(),
]

export { bnbTools };
