import { SolanaAgentKit } from "../agent";
import {
  Keypair,
  Signer,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  Transaction,
} from "@solana/web3.js";
import { ComputeBudgetProgram } from "@solana/web3.js";
import bs58 from "bs58";
import { PriorityFeeResponse } from "../types/index";

const feeTiers = {
  min: 0.01,
  mid: 0.5,
  max: 0.95,
};

/**
 * Get priority fees for the current block
 * @param connection - Solana RPC connection
 * @returns Priority fees statistics and instructions for different fee levels
 */
export async function getComputeBudgetInstructions(
  agent: SolanaAgentKit,
  instructions: TransactionInstruction[],
  feeTier: keyof typeof feeTiers,
): Promise<{
  blockhash: string;
  computeBudgetLimitInstruction: TransactionInstruction;
  computeBudgetPriorityFeeInstructions: TransactionInstruction;
}> {
  const { blockhash, lastValidBlockHeight } =
    await agent.connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: agent.wallet_address,
    recentBlockhash: blockhash,
    instructions: instructions,
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  const simulatedTx = agent.connection.simulateTransaction(transaction);
  const estimatedComputeUnits = (await simulatedTx).value.unitsConsumed;
  const safeComputeUnits = Math.ceil(
    estimatedComputeUnits
      ? Math.max(estimatedComputeUnits + 100000, estimatedComputeUnits * 1.2)
      : 200000,
  );
  const computeBudgetLimitInstruction =
    ComputeBudgetProgram.setComputeUnitLimit({
      units: safeComputeUnits,
    });

  let priorityFee: number;

  if (agent.config.HELIUS_API_KEY) {
    // Create and set up a legacy transaction for Helius fee estimation
    const legacyTransaction = new Transaction();
    legacyTransaction.recentBlockhash = blockhash;
    legacyTransaction.lastValidBlockHeight = lastValidBlockHeight;
    legacyTransaction.feePayer = agent.wallet_address;

    // Add the compute budget instruction and original instructions
    legacyTransaction.add(computeBudgetLimitInstruction, ...instructions);

    // Sign the transaction
    if (agent.isUiMode) {
      throw new Error("Ui mode is not supported for this function");
    } else {
      legacyTransaction.sign(agent.wallet!);
    }

    // Use Helius API for priority fee calculation
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${agent.config.HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getPriorityFeeEstimate",
          params: [
            {
              transaction: bs58.encode(legacyTransaction.serialize()),
              options: {
                priorityLevel:
                  feeTier === "min"
                    ? "Min"
                    : feeTier === "mid"
                      ? "Medium"
                      : "High",
              },
            },
          ],
        } as PriorityFeeResponse),
      },
    );

    const data = await response.json() as { error?: unknown; result?: { priorityFeeEstimate: number } };
    if (data.error) {
      throw new Error("Error fetching priority fee from Helius API");
    }
    priorityFee = data.result?.priorityFeeEstimate ?? 0;
  } else {
    // Use default implementation for priority fee calculation
    priorityFee = await agent.connection
      .getRecentPrioritizationFees()
      .then(
        (fees) =>
          fees.sort((a, b) => a.prioritizationFee - b.prioritizationFee)[
            Math.floor(fees.length * feeTiers[feeTier])
          ].prioritizationFee,
      );
  }

  const computeBudgetPriorityFeeInstructions =
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    });

  return {
    blockhash,
    computeBudgetLimitInstruction,
    computeBudgetPriorityFeeInstructions,
  };
}

/**
 * Send a transaction with priority fees
 * @param agent - SolanaAgentKit instance
 * @param tx - Transaction to send
 * @returns Transaction ID
 */
export async function sendTx(
  agent: SolanaAgentKit,
  instructions: TransactionInstruction[],
  otherKeypairs?: Keypair[],
) {
  const ixComputeBudget = await getComputeBudgetInstructions(
    agent,
    instructions,
    "mid",
  );
  const allInstructions = [
    ixComputeBudget.computeBudgetLimitInstruction,
    ixComputeBudget.computeBudgetPriorityFeeInstructions,
    ...instructions,
  ];
  const messageV0 = new TransactionMessage({
    payerKey: agent.wallet_address,
    recentBlockhash: ixComputeBudget.blockhash,
    instructions: allInstructions,
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([agent.wallet, ...(otherKeypairs ?? [])] as Signer[]);

  const timeoutMs = 90000;
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const transactionStartTime = Date.now();

    const signature = await agent.connection.sendTransaction(transaction, {
      maxRetries: 0,
      skipPreflight: false,
    });

    const statuses = await agent.connection.getSignatureStatuses([signature]);
    if (statuses.value[0]) {
      if (!statuses.value[0].err) {
        return signature;
      } else {
        throw new Error(
          `Transaction failed: ${statuses.value[0].err.toString()}`,
        );
      }
    }

    const elapsedTime = Date.now() - transactionStartTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }
  }
  throw new Error("Transaction timeout");
}
