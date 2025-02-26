import { SolanaAgentKit } from "../../agent";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  dasApi,
  GetAssetsByAuthorityRpcInput,
} from "@metaplex-foundation/digital-asset-standard-api";

/**
 * Fetch assets by authority using the Metaplex DAS API
 * @param agent SolanaAgentKit instance
 * @param params Parameters for fetching assets by authority
 * @returns List of assets associated with the given authority
 */
export async function get_assets_by_authority(
  agent: SolanaAgentKit,
  params: GetAssetsByAuthorityRpcInput,
) {
  if (agent.isUiMode) {
    throw new Error("This function is not available in UI mode");
  }
  const umi = createUmi(agent.connection.rpcEndpoint).use(dasApi());
      // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await umi.rpc.getAssetsByAuthority(params);
}
