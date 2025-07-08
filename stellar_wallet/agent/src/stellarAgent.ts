import { initializeAgentExecutorWithOptions, AgentExecutor } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { DynamicTool } from "langchain/tools";
import * as dotenv from "dotenv";
import { Keypair, TransactionBuilder, Networks, Operation, Asset, Memo, Transaction, MemoType } from "stellar-sdk";
import Server from "stellar-sdk";

dotenv.config();

const HORIZON_URL = process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;
const MASTER_SECRET = process.env.SECRET_KEY!;
const server = new Server(HORIZON_URL);
const masterKeypair = Keypair.fromSecret(MASTER_SECRET);

// Helper: Build and return unsigned transaction XDR for user to sign
async function buildUnsignedTransaction(sourceAccountId: string, operations: any[], memo?: any): Promise<string> {
  const sourceAccount = await server.loadAccount(sourceAccountId);
  let txBuilder = new TransactionBuilder(sourceAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  operations.forEach(op => txBuilder = txBuilder.addOperation(op));
  if (memo) txBuilder = txBuilder.addMemo(memo);
  const tx = txBuilder.setTimeout(30).build();
  // Do NOT sign here; return XDR for user to sign
  return tx.toXDR();
}

// Create multisig wallet: user is master, AI is co-signer
async function createWalletForUser(userPk: string): Promise<string> {
  // 1. Fund the new account (user is master)
  const newKeypair = Keypair.fromPublicKey(userPk);
  const masterAccount = await server.loadAccount(masterKeypair.publicKey());
  const tx = new TransactionBuilder(masterAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.createAccount({
      destination: newKeypair.publicKey(),
      startingBalance: "2"
    }))
    .setTimeout(30)
    .build();
  tx.sign(masterKeypair);
  await server.submitTransaction(tx);
  // 2. Add AI (masterKeypair) as a co-signer (weight 1), set thresholds to require both
  const userAccount = await server.loadAccount(newKeypair.publicKey());
  const multisigTx = new TransactionBuilder(userAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.setOptions({ signer: { ed25519PublicKey: masterKeypair.publicKey(), weight: 1 } }))
    .addOperation(Operation.setOptions({
      masterWeight: 1, // user
      lowThreshold: 2,
      medThreshold: 2,
      highThreshold: 2
    }))
    .setTimeout(30)
    .build();
  // Return XDR for user to sign (AI will co-sign after user signs)
  return multisigTx.toXDR();
}

// All other operations: build unsigned XDR for user to sign
async function transferToken(walletAddress: string, params: any): Promise<string> {
  // params: { token, amount, to, issuer }
  const asset = params.token === "XLM"
    ? Asset.native()
    : new Asset(params.token, params.issuer);
  const op = Operation.payment({
    destination: params.to,
    asset,
    amount: params.amount
  });
  return await buildUnsignedTransaction(walletAddress, [op]);
}

async function swapToken(walletAddress: string, params: any): Promise<string> {
  // params: { fromToken, toToken, amount, issuerFrom, issuerTo }
  const sendAsset = params.fromToken === "XLM"
    ? Asset.native()
    : new Asset(params.fromToken, params.issuerFrom);
  const destAsset = params.toToken === "XLM"
    ? Asset.native()
    : new Asset(params.toToken, params.issuerTo);
  const op = Operation.pathPaymentStrictSend({
    sendAsset,
    sendAmount: params.amount,
    destination: walletAddress,
    destAsset,
    destMin: "0.0001",
    path: []
  });
  return await buildUnsignedTransaction(walletAddress, [op]);
}

async function addTrustline(walletAddress: string, params: any): Promise<string> {
  const asset = new Asset(params.assetCode, params.issuer);
  const op = Operation.changeTrust({ asset });
  return await buildUnsignedTransaction(walletAddress, [op]);
}

async function removeTrustline(walletAddress: string, params: any): Promise<string> {
  const asset = new Asset(params.assetCode, params.issuer);
  const op = Operation.changeTrust({ asset, limit: "0" });
  return await buildUnsignedTransaction(walletAddress, [op]);
}

async function addSigner(walletAddress: string, params: any): Promise<string> {
  const op = Operation.setOptions({ signer: { ed25519PublicKey: params.signer, weight: params.weight } });
  return await buildUnsignedTransaction(walletAddress, [op]);
}

async function removeSigner(walletAddress: string, params: any): Promise<string> {
  const op = Operation.setOptions({ signer: { ed25519PublicKey: params.signer, weight: 0 } });
  return await buildUnsignedTransaction(walletAddress, [op]);
}

async function setThresholds(walletAddress: string, params: any): Promise<string> {
  const op = Operation.setOptions({
    lowThreshold: params.low,
    medThreshold: params.med,
    highThreshold: params.high
  });
  return await buildUnsignedTransaction(walletAddress, [op]);
}

async function mergeAccount(walletAddress: string, params: any): Promise<string> {
  const op = Operation.accountMerge({ destination: params.destination });
  return await buildUnsignedTransaction(walletAddress, [op]);
}

async function paymentWithMemo(walletAddress: string, params: any): Promise<string> {
  const asset = params.token === "XLM"
    ? Asset.native()
    : new Asset(params.token, params.issuer);
  const op = Operation.payment({
    destination: params.to,
    asset,
    amount: params.amount
  });
  return await buildUnsignedTransaction(walletAddress, [op], Memo.text(params.memo));
}

// Helper: Check if wallet exists and return public key
async function getWalletForUser(userPk: string): Promise<string> {
  try {
    await server.loadAccount(userPk);
    return userPk;
  } catch (e) {
    throw new Error("Account does not exist");
  }
}

// --- LangChain Tools ---
const createWalletTool = new DynamicTool({
  name: "createWallet",
  description: "Create a new Stellar wallet for the user.",
  func: async (input: string) => {
    const { userPk } = JSON.parse(input);
    const walletAddress = await createWalletForUser(userPk);
    return `Wallet created: ${walletAddress}`;
  },
});

const transferTokenTool = new DynamicTool({
  name: "transferToken",
  description: "Transfer a desired amount of a token to a desired address.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await transferToken(walletAddress, params);
  },
});

const swapTokenTool = new DynamicTool({
  name: "swapToken",
  description: "Swap a desired amount of a token for another token.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await swapToken(walletAddress, params);
  },
});

// --- LangChain Tools for new operations ---
const addTrustlineTool = new DynamicTool({
  name: "addTrustline",
  description: "Add a trustline (asset support) to a Stellar wallet.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await addTrustline(walletAddress, params);
  },
});

const removeTrustlineTool = new DynamicTool({
  name: "removeTrustline",
  description: "Remove a trustline (asset support) from a Stellar wallet.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await removeTrustline(walletAddress, params);
  },
});

const addSignerTool = new DynamicTool({
  name: "addSigner",
  description: "Add a signer to a Stellar wallet (multisig).",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await addSigner(walletAddress, params);
  },
});

const removeSignerTool = new DynamicTool({
  name: "removeSigner",
  description: "Remove a signer from a Stellar wallet (multisig).",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await removeSigner(walletAddress, params);
  },
});

const setThresholdsTool = new DynamicTool({
  name: "setThresholds",
  description: "Set multisig thresholds for a Stellar wallet.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await setThresholds(walletAddress, params);
  },
});

const mergeAccountTool = new DynamicTool({
  name: "mergeAccount",
  description: "Merge a Stellar account into another account.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await mergeAccount(walletAddress, params);
  },
});

// --- LangChain Tools for new advanced operations ---
const sponsoredCreateAccountTool = new DynamicTool({
  name: "sponsoredCreateAccount",
  description: "Sponsor and create a new Stellar account with 0 starting balance.",
  func: async (input: string) => {
    const { sponsorSecret, newAccountPublic } = JSON.parse(input);
    return await sponsoredCreateAccount(sponsorSecret, newAccountPublic);
  },
});

const feeBumpTransactionTool = new DynamicTool({
  name: "feeBumpTransaction",
  description: "Submit a fee-bump transaction for a given inner transaction XDR.",
  func: async (input: string) => {
    const { innerTxXDR, feeSourceSecret, baseFee } = JSON.parse(input);
    return await feeBumpTransaction(innerTxXDR, feeSourceSecret, baseFee);
  },
});

const paymentWithMemoTool = new DynamicTool({
  name: "paymentWithMemo",
  description: "Send a payment with a memo from a Stellar wallet.",
  func: async (input: string) => {
    const { userPk, params } = JSON.parse(input);
    const walletAddress = await getWalletForUser(userPk);
    return await paymentWithMemo(walletAddress, params);
  },
});

// Add all tools to the agent
const tools = [
  createWalletTool,
  transferTokenTool,
  swapTokenTool,
  addTrustlineTool,
  removeTrustlineTool,
  addSignerTool,
  removeSignerTool,
  setThresholdsTool,
  mergeAccountTool,
  sponsoredCreateAccountTool,
  feeBumpTransactionTool,
  paymentWithMemoTool
];

let agentExecutor: AgentExecutor | null = null;

async function getAgentExecutor(): Promise<AgentExecutor> {
  if (agentExecutor) return agentExecutor;
  const llm = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo"
  });
  agentExecutor = await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: "openai-functions",
    verbose: true,
  });
  return agentExecutor;
}

export async function handleAgentMessage(message: string, userPk: string, params: any = {}): Promise<string> {
  const agent = await getAgentExecutor();
  const input = JSON.stringify({ message, userPk, params });
  const response = await agent.invoke({ input });
  return response.output;
}

// Sponsored account creation (returns unsigned XDR for user to sign)
async function sponsoredCreateAccount(sponsorPublic: string, newAccountPublic: string): Promise<string> {
  const sponsorAccount = await server.loadAccount(sponsorPublic);
  const newKeypair = Keypair.fromPublicKey(newAccountPublic);
  const tx = new TransactionBuilder(sponsorAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.beginSponsoringFutureReserves({ sponsoredId: newKeypair.publicKey() }))
    .addOperation(Operation.createAccount({ destination: newKeypair.publicKey(), startingBalance: "0" }))
    .addOperation(Operation.endSponsoringFutureReserves({ source: newKeypair.publicKey() }))
    .setTimeout(30)
    .build();
  // Return XDR for both sponsor and new account to sign
  return tx.toXDR();
}

// Fee-bump transaction (returns unsigned XDR for user to sign)
async function feeBumpTransaction(innerTxXDR: string, feeSourcePublic: string, baseFee: number): Promise<string> {
  const feeSource = Keypair.fromPublicKey(feeSourcePublic);
  const innerTx = TransactionBuilder.fromXDR(innerTxXDR, NETWORK_PASSPHRASE);
  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    feeSource,
    baseFee.toString(),
    innerTx as Transaction<Memo<MemoType>, Operation[]>,
    NETWORK_PASSPHRASE
  );
  // Return XDR for fee source to sign
  return feeBumpTx.toXDR();
} 