const STELLAR_API_URL = 'http://localhost:3001';

export async function createOrGetWallet(twitterId: string) {
  const res = await fetch(`${STELLAR_API_URL}/wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ twitterId }),
  });
  if (!res.ok) throw new Error('Failed to create/get wallet');
  return res.json();
}

export async function getWalletBalance(publicKey: string) {
  const res = await fetch(`${STELLAR_API_URL}/wallet/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicKey }),
  });
  if (!res.ok) throw new Error('Failed to get balance');
  return res.json();
}

export async function buildPaymentTransaction(
  sourcePublicKey: string,
  destinationPublicKey: string,
  amount: string,
  assetCode: string = 'XLM',
  assetIssuer?: string
) {
  const res = await fetch(`${STELLAR_API_URL}/wallet/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourcePublicKey, destinationPublicKey, amount, assetCode, assetIssuer }),
  });
  if (!res.ok) throw new Error('Failed to build payment transaction');
  return res.text(); // XDR string
}

export async function buildTrustlineTransaction(
  publicKey: string,
  assetCode: string,
  assetIssuer: string
) {
  const res = await fetch(`${STELLAR_API_URL}/wallet/trustline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicKey, assetCode, assetIssuer }),
  });
  if (!res.ok) throw new Error('Failed to build trustline transaction');
  return res.text(); // XDR string
}

export async function buildRemoveTrustlineTransaction(
  publicKey: string,
  assetCode: string,
  assetIssuer: string
) {
  const res = await fetch(`${STELLAR_API_URL}/wallet/trustline/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicKey, assetCode, assetIssuer }),
  });
  if (!res.ok) throw new Error('Failed to build remove trustline transaction');
  return res.text(); // XDR string
} 