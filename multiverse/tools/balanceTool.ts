import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { Address, TokenTransfer } from "@multiversx/sdk-core";

interface BalanceResult {
    balance: string;
    symbol: string;
    chain: string;
    decimals: number;
    usdValue?: number;
}

interface NetworkProviders {
    mainnet: ApiNetworkProvider;
    devnet: ApiNetworkProvider;
}

const CHAIN_PROVIDERS = {
    multiversx: {
        mainnet: new ApiNetworkProvider('https://api.multiversx.com'),
        devnet: new ApiNetworkProvider('https://devnet-api.multiversx.com'),
    } as NetworkProviders,
};

export const checkBalanceTool = new DynamicStructuredTool({
    name: "check_balance",
    description: "Check token balances across different chains",
    schema: z.object({
        address: z.string().describe("The address to check"),
        assetType: z.string().describe("The type of asset (e.g., EGLD, USDC)"),
        chain: z.string().describe("The chain to check balance on (e.g., multiversx, ethereum)"),
        network: z.string().optional().describe("The network to use (mainnet or devnet)"),
    }),
    func: async ({ address, assetType, chain, network = 'mainnet' }) => {
        try {
            // Validate chain
            const supportedChains = ["multiversx"];
            if (!supportedChains.includes(chain)) {
                return {
                    success: false,
                    message: `Unsupported chain. Supported chains are: ${supportedChains.join(", ")}`,
                };
            }

            if (chain === "multiversx") {
                const provider = CHAIN_PROVIDERS.multiversx[network as keyof NetworkProviders];

                // Create MultiversX address
                const mvxAddress = new Address(address);

                if (assetType.toUpperCase() === "EGLD") {
                    // Get EGLD balance
                    const account = await provider.getAccount(mvxAddress);
                    const balance = account.balance.toString();
                    
                    return {
                        success: true,
                        message: `Balance retrieved successfully for ${address}`,
                        balance: {
                            balance: TokenTransfer.egldFromBigInteger(balance).toString(),
                            symbol: "EGLD",
                            chain: chain,
                            decimals: 18
                        }
                    };
                } else {
                    // Get ESDT token balance
                    const tokenInfo = await provider.getFungibleTokenOfAccount(mvxAddress, assetType);
                    const tokenData = await provider.getDefinitionOfFungibleToken(assetType);
                    
                    return {
                        success: true,
                        message: `Balance retrieved successfully for ${address}`,
                        balance: {
                            balance: tokenInfo.balance,
                            symbol: tokenInfo.identifier,
                            chain: chain,
                            decimals: tokenData.decimals
                        }
                    };
                }
            }

            return {
                success: false,
                message: "Chain not implemented yet",
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                message: `Balance check failed: ${errorMessage}`,
            };
        }
    },
}); 