import { PublicKey } from "@solana/web3.js";
import { BatchOrderPattern, OrderParams, SolanaAgentKit } from "../../index";

// Temporarily disabled due to SDK availability issues
export async function manifestCreateMarket(
  agent: SolanaAgentKit,
  baseMint: PublicKey,
  quoteMint: PublicKey,
): Promise<string[]> {
  throw new Error("Manifest SDK functionality temporarily unavailable");
}

export async function limitOrder(
  agent: SolanaAgentKit,
  marketId: PublicKey,
  quantity: number,
  side: string,
  price: number,
): Promise<string> {
  throw new Error("Manifest SDK functionality temporarily unavailable");
}

export async function cancelAllOrders(
  agent: SolanaAgentKit,
  marketId: PublicKey,
): Promise<string> {
  throw new Error("Manifest SDK functionality temporarily unavailable");
}

export async function withdrawAll(
  agent: SolanaAgentKit,
  marketId: PublicKey,
): Promise<string> {
  throw new Error("Manifest SDK functionality temporarily unavailable");
}

export function generateOrdersfromPattern(pattern: BatchOrderPattern): OrderParams[] {
  throw new Error("Manifest SDK functionality temporarily unavailable");
}

export async function batchOrder(
  agent: SolanaAgentKit,
  marketId: PublicKey,
  orders: OrderParams[],
): Promise<string> {
  throw new Error("Manifest SDK functionality temporarily unavailable");
}
