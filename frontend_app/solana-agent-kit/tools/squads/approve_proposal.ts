import { SolanaAgentKit } from "../../index";
import * as multisig from "@sqds/multisig";
const { Multisig } = multisig.accounts;

/**
 * Approves a proposal in a Solana multisig wallet.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance.
 * @param {number | bigint} [transactionIndex] - The index of the transaction to approve. If not provided, the current transaction index will be used.
 * @returns {Promise<string>} - A promise that resolves to the transaction ID of the approved proposal.
 * @throws {Error} - Throws an error if the approval process fails.
 */
export async function multisig_approve_proposal(
  agent: SolanaAgentKit,
  transactionIndex?: number | bigint,
): Promise<string> {
  try {
    const [multisigPda] = multisig.getMultisigPda({
      createKey: agent.wallet_address,
    });
    const multisigInfo = await Multisig.fromAccountAddress(
      agent.connection,
      multisigPda,
    );
    const currentTransactionIndex = Number(multisigInfo.transactionIndex);
    if (!transactionIndex) {
      transactionIndex = BigInt(currentTransactionIndex);
    } else if (typeof transactionIndex !== "bigint") {
      transactionIndex = BigInt(transactionIndex);
    }

    
    const multisigTx = multisig.transactions.proposalApprove({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet_address,
      multisigPda,
      transactionIndex: transactionIndex,
      member: agent.wallet_address,
    });

    if(agent.isUiMode){
      const txHash = await agent.signByUser(Buffer.from(multisigTx.serialize()).toString("base64"));
      return txHash;
    }
    multisigTx.sign([agent.wallet!]);
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}
