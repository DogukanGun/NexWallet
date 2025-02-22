import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers";
import { TokenPayment } from "@multiversx/sdk-core";
import { ContractManager } from "@ashswap/ash-sdk-js/out/helper/contracts";
import { getPool } from "@ashswap/ash-sdk-js/out/const/pool";
import { getToken } from "@ashswap/ash-sdk-js/out/const/tokens";
import BigNumber from "bignumber.js";

interface SwapResult {
    success: boolean;
    message: string;
    quote?: {
        expectedOutput: string;
        priceImpact: string;
        route?: string[];
    };
    transactionHash?: string;
}

const NETWORK_CONFIG = {
    mainnet: {
        proxyUrl: 'https://gateway.multiversx.com',
        chainId: '1'
    },
    devnet: {
        proxyUrl: 'https://devnet-gateway.multiversx.com',
        chainId: 'D'
    }
};

export const swapAssetTool = new DynamicStructuredTool({
    name: "swap_asset",
    description: "Swap tokens using AshSwap DEX",
    schema: z.object({
        fromAsset: z.string().describe("The source asset to swap from (e.g., EGLD, USDC)"),
        toAsset: z.string().describe("The target asset to swap to (e.g., ASH, WEGLD)"),
        amount: z.number().describe("The amount to swap"),
        slippage: z.number().optional().describe("Maximum slippage tolerance in percentage"),
        poolAddress: z.string().optional().describe("Optional specific pool address to use"),
        network: z.string().optional().describe("Network to use (mainnet or devnet)"),
    }),
    func: async ({ fromAsset, toAsset, amount, slippage = 1, poolAddress, network = 'mainnet' }) => {
        try {
            const networkCfg = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG];
            const proxy = new ProxyNetworkProvider(networkCfg.proxyUrl);

            // Get tokens
            const tokenIn = getToken(fromAsset);
            const tokenOut = getToken(toAsset);

            if (!tokenIn || !tokenOut) {
                return {
                    success: false,
                    message: "One or both tokens not found in AshSwap",
                };
            }

            // Create token payment
            const amountWithDecimals = new BigNumber(amount).multipliedBy(10 ** tokenIn.decimals);
            const tokenPayment = TokenPayment.fungibleFromBigInteger(
                tokenIn.identifier,
                amountWithDecimals,
                tokenIn.decimals
            );

            // Use the provided pool address directly
            if (!poolAddress) {
                return {
                    success: false,
                    message: "Pool address must be provided",
                };
            }

            const pool = getPool(poolAddress);
            if (!pool) {
                return {
                    success: false,
                    message: "Pool not found",
                };
            }

            const poolContract = ContractManager.getPoolContract(poolAddress);
            const tx = await poolContract.exchange(
                tokenPayment,
                tokenOut.identifier,
                new BigNumber(slippage).dividedBy(100)
            );

            return {
                success: true,
                message: "Transaction created successfully",
                transaction: tx
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                message: `Swap failed: ${errorMessage}`,
            };
        }
    },
}); 