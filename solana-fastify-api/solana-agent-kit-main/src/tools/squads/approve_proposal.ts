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
    if (agent.isUiMode) {
      throw new Error("Multisig approve proposal is not supported in UI mode");
    }
    const createKey = agent.wallet!;
    const [multisigPda] = multisig.getMultisigPda({
      createKey: createKey.publicKey,
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
    // const [proposalPda, proposalBump] = multisig.getProposalPda({
    //   multisigPda,
    //   transactionIndex,
    // });
    const multisigTx = multisig.transactions.proposalApprove({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet!.publicKey,
      multisigPda,
      transactionIndex: transactionIndex,
      member: agent.wallet!.publicKey,
    });
    if(agent.isUiMode){
      agent.onSignTransaction?.(multisigTx.serialize().toString());
      return "";
    } else {
      multisigTx.sign([agent.wallet!]);
    }
    const tx = await agent.connection.sendRawTransaction(
      multisigTx.serialize(),
    );
    return tx;
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error}`);
  }
}
