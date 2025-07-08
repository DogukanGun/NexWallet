import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy mock USDT for testing (you can skip this for mainnet)
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockUSDT = await MockERC20.deploy(
    "Mock USDT",
    "mUSDT",
    ethers.parseUnits("1000000", 18) // 1M tokens
  );
  await mockUSDT.waitForDeployment();

  console.log("Mock USDT deployed to:", await mockUSDT.getAddress());

  // Deploy AutoPayer contract
  // In production, replace deployer.address with your actual fee recipient address
  const feeRecipient = deployer.address; 
  
  const AutoPayer = await ethers.getContractFactory("AutoPayer");
  const autoPayer = await AutoPayer.deploy(feeRecipient);
  await autoPayer.waitForDeployment();

  console.log("AutoPayer deployed to:", await autoPayer.getAddress());

  // Initial setup
  console.log("Setting up AutoPayer...");
  
  // Add mock USDT as supported token
  await autoPayer.addSupportedToken(await mockUSDT.getAddress());
  console.log("Added mock USDT as supported token");

  // Mint some tokens to deployer for testing
  await mockUSDT.transfer(deployer.address, ethers.parseUnits("1000", 18));
  
  // Approve AutoPayer to spend tokens
  await mockUSDT.approve(await autoPayer.getAddress(), ethers.parseUnits("1000", 18));
  console.log("Approved AutoPayer to spend mock USDT");

  // Create a test escrow request with receipt requirements
  try {
    const createTx = await autoPayer.createEscrowRequest(
      await mockUSDT.getAddress(),           // token address
      ethers.parseUnits("100", 18),          // 100 USDT
      15000,                                 // €150 (in cents)
      "EUR",                                 // currency
      "DE89370400440532013000",              // test IBAN
      "Test rent payment",                   // description
      "Bank transfer screenshot showing: €150 transfer, recipient IBAN matching DE89370400440532013000, transfer date, sender bank details visible" // receipt requirements
    );
    
    await createTx.wait();
    console.log("Created test escrow request with receipt requirements");
  } catch (error) {
    console.log("Failed to create test escrow request:", error);
  }

  // You can add more supported tokens here
  // await autoPayer.addSupportedToken("0x..."); // Real USDT address

  console.log("Deployment completed!");
  console.log("=".repeat(50));
  console.log("Contract Addresses:");
  console.log("AutoPayer:", await autoPayer.getAddress());
  console.log("Mock USDT:", await mockUSDT.getAddress());
  console.log("Fee Recipient:", feeRecipient);
  console.log("=".repeat(50));
  console.log("New Features:");
  console.log("✅ Receipt Requirements field added for AI verification");
  console.log("✅ getReceiptRequirements() function available");
  console.log("✅ Enhanced escrow creation with AI verification specs");
  console.log("=".repeat(50));
  
  // Verify contracts on Etherscan (uncomment for mainnet/testnet)
  /*
  console.log("Waiting for block confirmations...");
  await autoPayer.deploymentTransaction()?.wait(5);
  
  try {
    await hre.run("verify:verify", {
      address: await autoPayer.getAddress(),
      constructorArguments: [feeRecipient],
    });
  } catch (error) {
    console.log("Verification failed:", error);
  }
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 