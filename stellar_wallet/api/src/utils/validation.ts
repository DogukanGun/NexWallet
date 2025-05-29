import { Server, Asset } from 'stellar-sdk';
import BigNumber from 'bignumber.js';

const server = new Server(process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org');

export async function validateBalance(publicKey: string, asset: Asset, amount: string): Promise<string | null> {
  try {
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find((b: any) => {
      if (asset.isNative()) return b.asset_type === 'native';
      return b.asset_code === asset.getCode() && b.asset_issuer === asset.getIssuer();
    });

    if (!balance) return 'Asset not found in account';
    
    const available = new BigNumber(balance.balance);
    const required = new BigNumber(amount);
    
    if (available.isLessThan(required)) {
      return `Insufficient balance. Available: ${available.toString()}, Required: ${required.toString()}`;
    }

    return null;
  } catch (e: any) {
    return e.message || 'Failed to validate balance';
  }
}

export async function validateTrustlineRemoval(publicKey: string, asset: Asset): Promise<string | null> {
  try {
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find((b: any) => {
      return b.asset_code === asset.getCode() && b.asset_issuer === asset.getIssuer();
    });

    if (!balance) return 'Trustline does not exist';
    if (new BigNumber(balance.balance).isGreaterThan(0)) {
      return 'Cannot remove trustline with non-zero balance';
    }

    return null;
  } catch (e: any) {
    return e.message || 'Failed to validate trustline removal';
  }
}

export async function validateAccountMerge(publicKey: string): Promise<string | null> {
  try {
    const account = await server.loadAccount(publicKey);
    
    // Check if account has no assets other than XLM
    const hasOtherAssets = account.balances.some((b: any) => b.asset_type !== 'native');
    if (hasOtherAssets) return 'Account has assets other than XLM';

    // Check if account has no open offers
    const offers = await server.offers().forAccount(publicKey).call();
    if (offers.records.length > 0) return 'Account has open offers';

    return null;
  } catch (e: any) {
    return e.message || 'Failed to validate account merge';
  }
}

export function isValidPublicKey(publicKey: string): boolean {
  try {
    const decoded = Buffer.from(publicKey, 'base64');
    return decoded.length === 32;
  } catch {
    return false;
  }
}

export function isValidAmount(amount: string): boolean {
  try {
    const value = new BigNumber(amount);
    return value.isGreaterThan(0) && (value.dp() ?? 0) <= 7; // Stellar allows up to 7 decimal places
  } catch {
    return false;
  }
} 