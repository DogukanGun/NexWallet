import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const WALLET_FACTORY_WASM = path.resolve(__dirname, "../wallet/target/wasm32-unknown-unknown/release/wallet_factory.wasm");
const NETWORK = process.env.SOROBAN_NETWORK || "testnet";
const SECRET_KEY = process.env.SOROBAN_SECRET_KEY; // S...
const RPC_URL = process.env.SOROBAN_RPC_URL || "https://rpc-futurenet.stellar.org:443";
const WASM_BUILD_CMD = "cargo build --release --target wasm32-unknown-unknown";

function checkFileExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`WASM file not found: ${filePath}`);
  }
}

function buildContracts() {
  console.log("Building contracts...");
  execSync(WASM_BUILD_CMD, { cwd: path.resolve(__dirname, "../wallet"), stdio: "inherit" });
}

function deployContract(wasmPath: string): string {
  checkFileExists(wasmPath);
  console.log(`Deploying contract: ${wasmPath}`);
  const deployCmd = [
    "soroban",
    "contract",
    "deploy",
    "--wasm",
    wasmPath,
    "--network",
    NETWORK,
    "--source",
    SECRET_KEY,
    "--rpc-url",
    RPC_URL
  ].join(" ");
  const output = execSync(deployCmd, { encoding: "utf-8" });
  const match = output.match(/Contract ID: ([0-9a-fA-F]+)/);
  if (!match) throw new Error("Failed to parse contract ID from output:\n" + output);
  return match[1];
}

function main() {
  if (!SECRET_KEY) {
    console.error("Set SOROBAN_SECRET_KEY in your .env file or environment.");
    process.exit(1);
  }
  buildContracts();
  const contractId = deployContract(WALLET_FACTORY_WASM);
  console.log(`WalletFactory contract deployed at: ${contractId}`);
}

main();
