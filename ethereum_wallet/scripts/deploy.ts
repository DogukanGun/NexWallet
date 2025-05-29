import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy WalletFactory
  const WalletFactory = await ethers.getContractFactory("WalletFactory");
  const walletFactory = await WalletFactory.deploy();
  await walletFactory.waitForDeployment();
  console.log("WalletFactory deployed to:", await walletFactory.getAddress());

  // Deploy PancakeSwap Plugin
  const pancakeRouterAddress = process.env.PANCAKESWAP_ROUTER_TESTNET;
  if (!pancakeRouterAddress) {
    throw new Error("PancakeSwap router address not found in .env");
  }
  
  const PancakeSwapPlugin = await ethers.getContractFactory("PancakeSwapPlugin");
  const pancakePlugin = await PancakeSwapPlugin.deploy(pancakeRouterAddress);
  await pancakePlugin.waitForDeployment();
  console.log("PancakeSwapPlugin deployed to:", await pancakePlugin.getAddress());

  // Deploy Venus Plugin
  const venusUnitrollerAddress = process.env.VENUS_UNITROLLER_TESTNET;
  if (!venusUnitrollerAddress) {
    throw new Error("Venus Unitroller address not found in .env");
  }

  const VenusPlugin = await ethers.getContractFactory("VenusPlugin");
  const venusPlugin = await VenusPlugin.deploy(venusUnitrollerAddress);
  await venusPlugin.waitForDeployment();
  console.log("VenusPlugin deployed to:", await venusPlugin.getAddress());

  // Register plugins in WalletFactory
  console.log("Registering plugins...");
  await walletFactory.registerPlugin(await pancakePlugin.getAddress());
  await walletFactory.registerPlugin(await venusPlugin.getAddress());
  console.log("Plugins registered successfully");

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log(`WalletFactory: ${await walletFactory.getAddress()}`);
  console.log(`PancakeSwapPlugin: ${await pancakePlugin.getAddress()}`);
  console.log(`VenusPlugin: ${await venusPlugin.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 