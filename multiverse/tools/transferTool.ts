import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { 
    ApiNetworkProvider,
    ProxyNetworkProvider 
} from "@multiversx/sdk-network-providers";
import { 
    Address, 
    TokenTransfer, 
    Transaction,
    IGasLimit,
    TokenPayment,
    IChainID,
    TransactionPayload,
    BytesValue
} from "@multiversx/sdk-core";
import { UserSigner } from "@multiversx/sdk-wallet";

interface TransferResult {
    success: boolean;
    message: string;
    transactionHash?: string;
}

const CHAIN_PROVIDERS = {
    multiversx: {
        mainnet: {
            api: new ApiNetworkProvider('https://api.multiversx.com'),
            proxy: new ProxyNetworkProvider('https://gateway.multiversx.com'),
            chainId: '1'
        },
        devnet: {
            api: new ApiNetworkProvider('https://devnet-api.multiversx.com'),
            proxy: new ProxyNetworkProvider('https://devnet-gateway.multiversx.com'),
            chainId: 'D'
        }
    }
};

export const transferAssetTool = new DynamicStructuredTool({
    name: "transfer_asset",
    description: "Transfer assets using MultiversX",
    schema: z.object({
        fromAddress: z.string().describe("The source address"),
        toAddress: z.string().describe("The destination address"),
        amount: z.number().describe("The amount to transfer"),
        assetType: z.string().describe("The type of asset (e.g., EGLD, USDC)"),
        privateKey: z.string().describe("The private key of the sender"),
        network: z.string().optional().describe("The network to use (mainnet or devnet)"),
    }),
    func: async ({ fromAddress, toAddress, amount, assetType, privateKey, network = 'devnet' }) => {
        try {
            const networkConfig = CHAIN_PROVIDERS.multiversx[network as 'mainnet' | 'devnet'];
            const provider = networkConfig.proxy;

            // Create sender and receiver addresses
            const sender = new Address(fromAddress);
            const receiver = new Address(toAddress);

            // Create signer from private key
            const signer = UserSigner.fromPem(privateKey);

            // Get the sender's account
            const senderAccount = await provider.getAccount(sender);

            let transaction: Transaction;

            if (assetType.toUpperCase() === 'EGLD') {
                // Create EGLD transfer
                transaction = new Transaction({
                    nonce: senderAccount.nonce,
                    value: TokenPayment.egldFromAmount(amount),
                    sender: sender,
                    receiver: receiver,
                    gasLimit: 50000 as IGasLimit,
                    chainID: networkConfig.chainId as IChainID,
                });
            } else {
                // Create ESDT transfer
                const data = new TransactionPayload(`ESDTTransfer@${Buffer.from(assetType).toString('hex')}@${TokenPayment.egldFromAmount(amount).toString()}`);

                transaction = new Transaction({
                    nonce: senderAccount.nonce,
                    sender: sender,
                    receiver: receiver,
                    value: TokenPayment.egldFromAmount(0),
                    gasLimit: 500000 as IGasLimit,
                    data: data,
                    chainID: networkConfig.chainId as IChainID,
                });
            }

            // Sign the transaction
            const serializedTransaction = transaction.serializeForSigning();
            const signature = await signer.sign(serializedTransaction);
            transaction.applySignature(signature);

            // Send the transaction
            const hash = await provider.sendTransaction(transaction);

            return {
                success: true,
                message: `Transfer initiated successfully`,
                details: {
                    transactionHash: hash,
                    sender: fromAddress,
                    receiver: toAddress,
                    amount: amount.toString(),
                    asset: assetType,
                }
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                message: `Transfer failed: ${errorMessage}`,
            };
        }
    },
}); 