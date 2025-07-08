import { Keypair, Server, Networks, TransactionBuilder, Operation, Asset, Memo, Claimant } from 'stellar-sdk';
import { getWalletByTwitterId, createWalletRecord } from './db';
import { WalletResponse } from './types';
import { validateBalance, validateTrustlineRemoval, validateAccountMerge } from './utils/validation';
import dotenv from 'dotenv';

dotenv.config();

interface StellarBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;
const server = new Server(HORIZON_URL);

export async function getOrCreateWallet(twitterId: string): Promise<WalletResponse> {
  // Check if wallet exists
  const existingWallet = await getWalletByTwitterId(twitterId);
  if (existingWallet) {
    return {
      publicKey: existingWallet.stellar_public_key,
      isNewWallet: false
    };
  }

  // Create new keypair
  const keypair = Keypair.random();
  // Fund the account (testnet only)
  await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);

  // Save to database
  await createWalletRecord(twitterId, keypair.publicKey());

  return {
    publicKey: keypair.publicKey(),
    isNewWallet: true
  };
}

export async function getWalletBalance(publicKey: string) {
  const account = await server.loadAccount(publicKey);
  return account.balances.map((balance: StellarBalance) => ({
    asset: balance.asset_type === 'native' ? 'XLM' : balance.asset_code,
    balance: balance.balance,
    issuer: balance.asset_type === 'native' ? null : balance.asset_issuer
  }));
}

export async function buildPaymentTransaction(
  sourcePublicKey: string,
  destinationPublicKey: string,
  amount: string,
  assetCode: string = 'XLM',
  assetIssuer?: string
): Promise<string> {
  const asset = assetCode === 'XLM' ? Asset.native() : new Asset(assetCode, assetIssuer!);
  
  // Validate balance
  const balanceError = await validateBalance(sourcePublicKey, asset, amount);
  if (balanceError) throw new Error(balanceError);

  const account = await server.loadAccount(sourcePublicKey);
  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.payment({
      destination: destinationPublicKey,
      asset,
      amount: amount.toString()
    }))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function buildTrustlineTransaction(
  publicKey: string,
  assetCode: string,
  assetIssuer: string
): Promise<string> {
  const account = await server.loadAccount(publicKey);
  const asset = new Asset(assetCode, assetIssuer);
  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(30)
    .build();
  return tx.toXDR();
}

export async function buildRemoveTrustlineTransaction(
  publicKey: string,
  assetCode: string,
  assetIssuer: string
): Promise<string> {
  const asset = new Asset(assetCode, assetIssuer);
  
  // Validate trustline removal
  const validationError = await validateTrustlineRemoval(publicKey, asset);
  if (validationError) throw new Error(validationError);

  const account = await server.loadAccount(publicKey);
  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset, limit: "0" }))
    .setTimeout(30)
    .build();
  return tx.toXDR();
}

export async function buildSwapTransaction(
  sourcePublicKey: string,
  fromAsset: { code: string, issuer?: string },
  toAsset: { code: string, issuer?: string },
  amount: string,
  minDestAmount: string
): Promise<string> {
  const account = await server.loadAccount(sourcePublicKey);
  const sendAsset = fromAsset.code === 'XLM' ? Asset.native() : new Asset(fromAsset.code, fromAsset.issuer!);
  const destAsset = toAsset.code === 'XLM' ? Asset.native() : new Asset(toAsset.code, toAsset.issuer!);

  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.pathPaymentStrictSend({
      sendAsset,
      sendAmount: amount,
      destination: sourcePublicKey,
      destAsset,
      destMin: minDestAmount,
      path: []  // Let the network find the best path
    }))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function buildMergeAccountTransaction(
  sourcePublicKey: string,
  destinationPublicKey: string
): Promise<string> {
  // Validate account merge
  const validationError = await validateAccountMerge(sourcePublicKey);
  if (validationError) throw new Error(validationError);

  const account = await server.loadAccount(sourcePublicKey);
  
  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.accountMerge({
      destination: destinationPublicKey
    }))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function buildSponsoredAccountTransaction(
  sponsorPublicKey: string,
  newAccountPublicKey: string
): Promise<string> {
  const sponsorAccount = await server.loadAccount(sponsorPublicKey);
  
  const tx = new TransactionBuilder(sponsorAccount, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.beginSponsoringFutureReserves({
      sponsoredId: newAccountPublicKey
    }))
    .addOperation(Operation.createAccount({
      destination: newAccountPublicKey,
      startingBalance: "0"  // Sponsored account starts with 0 XLM
    }))
    .addOperation(Operation.endSponsoringFutureReserves({
      source: newAccountPublicKey
    }))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function buildFeeBumpTransaction(
  feeSourcePublicKey: string,
  innerTxXDR: string,
  baseFee: string
): Promise<string> {
  const innerTx = TransactionBuilder.fromXDR(innerTxXDR, NETWORK_PASSPHRASE) as any;
  const tx = TransactionBuilder.buildFeeBumpTransaction(
    Keypair.fromPublicKey(feeSourcePublicKey),
    baseFee,
    innerTx,
    NETWORK_PASSPHRASE
  );
  return tx.toXDR();
}

export async function buildPaymentWithMemoTransaction(
  sourcePublicKey: string,
  destinationPublicKey: string,
  amount: string,
  memo: string,
  assetCode: string = 'XLM',
  assetIssuer?: string
): Promise<string> {
  const account = await server.loadAccount(sourcePublicKey);
  const asset = assetCode === 'XLM' ? Asset.native() : new Asset(assetCode, assetIssuer!);

  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.payment({
      destination: destinationPublicKey,
      asset,
      amount: amount.toString()
    }))
    .addMemo(Memo.text(memo))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function buildMultiSigTransaction(
  publicKey: string,
  signerPublicKey: string,
  weight: number = 1,
  masterWeight?: number,
  lowThreshold?: number,
  medThreshold?: number,
  highThreshold?: number
): Promise<string> {
  const account = await server.loadAccount(publicKey);
  const builder = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  // Add signer if provided
  if (signerPublicKey) {
    builder.addOperation(Operation.setOptions({
      signer: {
        ed25519PublicKey: signerPublicKey,
        weight: weight
      }
    }));
  }

  // Set thresholds if provided
  if (masterWeight !== undefined || lowThreshold !== undefined || 
      medThreshold !== undefined || highThreshold !== undefined) {
    builder.addOperation(Operation.setOptions({
      masterWeight,
      lowThreshold,
      medThreshold,
      highThreshold
    }));
  }

  return builder.setTimeout(30).build().toXDR();
}

export async function buildCreateClaimableBalanceTransaction(
  sourcePublicKey: string,
  destinationPublicKey: string,
  amount: string,
  assetCode: string = 'XLM',
  assetIssuer?: string,
  claimAfterSeconds: number = 0
): Promise<string> {
  const account = await server.loadAccount(sourcePublicKey);
  const asset = assetCode === 'XLM' ? Asset.native() : new Asset(assetCode, assetIssuer!);

  // Validate balance
  const balanceError = await validateBalance(sourcePublicKey, asset, amount);
  if (balanceError) throw new Error(balanceError);

  // Calculate claim date
  const claimDate = new Date();
  claimDate.setSeconds(claimDate.getSeconds() + claimAfterSeconds);

  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.createClaimableBalance({
      asset,
      amount: amount.toString(),
      claimants: [
        new Claimant(destinationPublicKey, Claimant.predicateNot(
          Claimant.predicateBeforeRelativeTime(claimAfterSeconds.toString())
        ))
      ]
    }))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function buildClaimBalanceTransaction(
  publicKey: string,
  balanceId: string
): Promise<string> {
  const account = await server.loadAccount(publicKey);
  
  const tx = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.claimClaimableBalance({
      balanceId
    }))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

// Add more wallet management functions here as needed:
// - getBalance
// - sendPayment
// - createTrustline
// etc. 