import { SolanaAgentKit } from "../../index";
import * as multisig from "@sqds/multisig";
const { Multisig } = multisig.accounts;

/**
 * Rejects a proposal in a Solana multisig setup.
 *
 * @param agent - The SolanaAgentKit instance containing the wallet and connection.
 * @param transactionIndex - Optional. The index of the transaction to reject. If not provided, the current transaction index will be used.
 * @returns A promise that resolves to the transaction ID of the rejection transaction.
 * @throws Will throw an error if the transaction fails.
 */
export async function multisig_reject_proposal(
  agent: SolanaAgentKit,
  transactionIndex?: number | bigint,
): Promise<string> {
  try {
    if (agent.isUiMode) {
      throw new Error("Multisig reject proposal is not supported in UI mode");
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
    const multisigTx = multisig.transactions.proposalReject({
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet!.publicKey,
      multisigPda,
      transactionIndex: transactionIndex,
      member: agent.wallet!.publicKey,
    });
    if(agent.isUiMode){
      agent.onSignTransaction?.(multisigTx.serialize().toString());
      return "";
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
