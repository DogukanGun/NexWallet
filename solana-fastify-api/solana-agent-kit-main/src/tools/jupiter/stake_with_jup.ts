import { VersionedTransaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../../index";

/**
 * Stake SOL with Jup validator
 * @param agent SolanaAgentKit instance
 * @param amount Amount of SOL to stake
 * @returns Transaction signature
 */
export async function stakeWithJup(
  agent: SolanaAgentKit,
  amount: number,
): Promise<string> {
  try {
    const res = await fetch(
      `https://worker.jup.ag/blinks/swap/So11111111111111111111111111111111111111112/jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v/${amount}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet_address.toBase58(),
        }),
      },
    );

    const data = await res.json() as { transaction: string };

    const txn = VersionedTransaction.deserialize(
      Buffer.from(data.transaction, "base64"),
    );

    const { blockhash } = await agent.connection.getLatestBlockhash();
    txn.message.recentBlockhash = blockhash;

    // Sign and send transaction
    if (agent.isUiMode) {
      agent.onSignTransaction?.(txn.serialize().toString());
      return "";
    } else {
      if (!agent.wallet) {
        throw new Error("Wallet is required for backend mode");
      }
      txn.sign([agent.wallet]);
      const signature = await agent.connection.sendTransaction(txn, {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      const latestBlockhash = await agent.connection.getLatestBlockhash();
      await agent.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(`jupSOL staking failed: ${error.message}`);
  }
}
