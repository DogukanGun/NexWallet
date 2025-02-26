import { ethers, formatUnits } from "ethers";

// Define the ABI of the IEOFeedAdapter contract
const IEOFeedAdapterABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];

// Mapping of token symbols to their contract addresses
const tokenAddressMap: Record<string, string> = {
  "BTC/USD": "0xA2b185439079CaA3C68d3E33440b364dde8d599E",
  "ETH/USD": "0x75DfcbeDF377f99898535AeE7Fa1Cd1D1e8E41b0",
  "EUR/USD": "0x051A4b85a51DE75E7ef393a839791131Da58e0cB",
  "LINK/USD": "0x1D70359e53C422BE7111131BECE7B8B09Bf127Ca",
  "SOL/USD": "0x429666bcea8ce629d8742d1d38cC6Ba58f28c317",
  "USDC/USD": "0x4ba73879B0C073Db595aBE9Ba27104D83f024286",
  "USDT/USD": "0xF8D5334492b0139CEdAB7f6b55Ab9Bd9763E82a1",
  "ezETH/USD": "0xb1E7Db061e58Fa039c5C38a7f96e9476c2cfC78a",
  "weETH/USD": "0x15a3694998DDb14815536B8a5F74130CA8f5236A",
  "wstETH/USD": "0xDB5d5dE97eD9125283ADa3560FE4f11e996041ab",
};

// Function to get the price of a token by its symbol
export async function getTokenPrice(tokenSymbol: string):Promise<string> {
  const tokenAddress = tokenAddressMap[tokenSymbol];
  
  if (!tokenAddress) {
    throw new Error(`Token symbol "${tokenSymbol}" not found.`);
  }

  const provider = new ethers.JsonRpcProvider("https://some.holesky.rpc");
  const feedAdapterContract = new ethers.Contract(tokenAddress, IEOFeedAdapterABI, provider);
  
  const latestRoundData = await feedAdapterContract.latestRoundData();
  const [roundId, answer, startedAt, updatedAt, answeredInRound] = latestRoundData;

  console.log("Round ID:", roundId.toString());
  console.log("Price:", formatUnits(answer, 8)); // Assuming 8 decimals
  console.log("Started At:", new Date(startedAt * 1000).toLocaleString());
  console.log("Updated At:", new Date(updatedAt * 1000).toLocaleString());
  console.log("Answered In Round:", answeredInRound.toString());

  return formatUnits(answer, 8);
}
