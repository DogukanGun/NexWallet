import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const BNB_TESTNET_RPC = process.env.BNB_TESTNET_RPC || "https://bnb-testnet.g.alchemy.com/v2/xRKK1bEtwbP6xpJXO7aN0dgxNhZw2-zl";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bnbTestnet: {
      url: BNB_TESTNET_RPC,
      chainId: 97,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto"
    }
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  }
};

export default config; 