import { SolanaAgentKit } from "../../index";
import * as multisig from "@sqds/multisig";
const { Multisig } = multisig.accounts;

/**
 * Executes a transaction on the Solana blockchain using the provided agent.
 *
 * @param {SolanaAgentKit} agent - The Solana agent kit instance containing the wallet and connection.
 * @param {number | bigint} [transactionIndex] - Optional transaction index to execute. If not provided, the current transaction index from the multisig account will be used.
 * @returns {Promise<string>} - A promise that resolves to the transaction signature string.
 * @throws {Error} - Throws an error if the transaction execution fails.
 */
export async function multisig_execute_proposal(
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
    const multisigTx = await multisig.transactions.vaultTransactionExecute({
      connection: agent.connection,
      blockhash: (await agent.connection.getLatestBlockhash()).blockhash,
      feePayer: agent.wallet_address,
      multisigPda,
      transactionIndex,
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
