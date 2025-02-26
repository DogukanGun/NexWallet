import { SolanaAgentKit } from "../../agent";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  dasApi,
  GetAssetsByCreatorRpcInput,
} from "@metaplex-foundation/digital-asset-standard-api";

/**
 * Fetch assets by creator using the Metaplex DAS API
 * @param agent SolanaAgentKit instance
 * @param params Parameters for fetching assets by creator
 * @returns List of assets created by the specified creator
 */
export async function get_assets_by_creator(
  agent: SolanaAgentKit,
  params: GetAssetsByCreatorRpcInput,
) {
  if (agent.isUiMode) {
    throw new Error("This function is not available in UI mode");
  }
  const umi = createUmi(agent.connection.rpcEndpoint).use(dasApi());
        // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await umi.rpc.getAssetsByCreator(params);
}
