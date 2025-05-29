import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type {
  WalletFactory,
  EthereumWallet,
  PancakeSwapPlugin,
  VenusPlugin,
  MockPancakeRouter,
  MockUnitroller,
  MockVToken
} from "../typechain-types";

describe("Wallet System", function () {
  let walletFactory: WalletFactory;
  let pancakePlugin: PancakeSwapPlugin;
  let venusPlugin: VenusPlugin;
  let mockRouter: MockPancakeRouter;
  let mockUnitroller: MockUnitroller;
  let mockVToken: MockVToken;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock contracts
    const MockRouter = await ethers.getContractFactory("MockPancakeRouter");
    mockRouter = (await MockRouter.deploy()) as unknown as MockPancakeRouter;

    const MockUnitroller = await ethers.getContractFactory("MockUnitroller");
    mockUnitroller = (await MockUnitroller.deploy()) as unknown as MockUnitroller;

    const MockVToken = await ethers.getContractFactory("MockVToken");
    mockVToken = (await MockVToken.deploy(ethers.ZeroAddress)) as unknown as MockVToken;

    // Deploy WalletFactory
    const WalletFactory = await ethers.getContractFactory("WalletFactory");
    walletFactory = (await WalletFactory.deploy()) as unknown as WalletFactory;

    // Deploy plugins
    const PancakeSwapPlugin = await ethers.getContractFactory("PancakeSwapPlugin");
    pancakePlugin = (await PancakeSwapPlugin.deploy(await mockRouter.getAddress())) as unknown as PancakeSwapPlugin;

    const VenusPlugin = await ethers.getContractFactory("VenusPlugin");
    venusPlugin = (await VenusPlugin.deploy(await mockUnitroller.getAddress())) as unknown as VenusPlugin;
  });

  describe("Wallet Creation", function () {
    it("Should create a new wallet for user", async function () {
      const tx = await walletFactory.connect(user1).createWallet();
      await expect(tx)
        .to.emit(walletFactory, "WalletCreated")
        .withArgs(user1.address, await walletFactory.userWallets(user1.address));

      const walletAddress = await walletFactory.userWallets(user1.address);
      expect(walletAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should not allow creating multiple wallets for same user", async function () {
      await walletFactory.connect(user1).createWallet();
      await expect(walletFactory.connect(user1).createWallet())
        .to.be.revertedWith("Wallet already exists");
    });
  });

  describe("Plugin Management", function () {
    it("Should register a plugin", async function () {
      const tx = await walletFactory.connect(owner).registerPlugin(await pancakePlugin.getAddress());
      await expect(tx)
        .to.emit(walletFactory, "PluginRegistered")
        .withArgs(await pancakePlugin.getAddress(), "PancakeSwap", "1.0.0");

      expect(await walletFactory.isPluginRegistered(await pancakePlugin.getAddress())).to.be.true;
    });

    it("Should not allow non-owner to register plugin", async function () {
      await expect(walletFactory.connect(user1).registerPlugin(await pancakePlugin.getAddress()))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should automatically add plugins to new wallets", async function () {
      // Register plugin first
      await walletFactory.connect(owner).registerPlugin(await pancakePlugin.getAddress());

      // Create wallet
      await walletFactory.connect(user1).createWallet();
      const walletAddress = await walletFactory.userWallets(user1.address);
      const wallet = (await ethers.getContractAt("EthereumWallet", walletAddress)) as unknown as EthereumWallet;

      // Check if plugin is authorized
      expect(await wallet.authorizedPlugins(await pancakePlugin.getAddress())).to.be.true;
    });

    it("Should unregister a plugin", async function () {
      await walletFactory.connect(owner).registerPlugin(await pancakePlugin.getAddress());
      const tx = await walletFactory.connect(owner).unregisterPlugin(await pancakePlugin.getAddress());
      await expect(tx)
        .to.emit(walletFactory, "PluginUnregistered")
        .withArgs(await pancakePlugin.getAddress());

      expect(await walletFactory.isPluginRegistered(await pancakePlugin.getAddress())).to.be.false;
    });
  });

  describe("Plugin Execution", function () {
    let userWallet: EthereumWallet;
    let messageHash: string;
    let signature: string;

    beforeEach(async function () {
      // Register plugins
      await walletFactory.connect(owner).registerPlugin(await pancakePlugin.getAddress());
      await walletFactory.connect(owner).registerPlugin(await venusPlugin.getAddress());

      // Create wallet for user1
      await walletFactory.connect(user1).createWallet();
      const walletAddress = await walletFactory.userWallets(user1.address);
      userWallet = (await ethers.getContractAt("EthereumWallet", walletAddress)) as unknown as EthereumWallet;
    });

    it("Should execute plugin function with valid signature", async function () {
      const pluginName = "PancakeSwap";
      const functionName = "swapExactETHForTokens";
      const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256', 'address[]', 'uint256'],
        [
          ethers.parseEther("0.1"), // amountOutMin
          [await mockRouter.WETH(), "0x0000000000000000000000000000000000000001"], // path
          Math.floor(Date.now() / 1000) + 3600 // deadline
        ]
      );

      messageHash = ethers.solidityPackedKeccak256(
        ['address', 'bytes4', 'bytes', 'address'],
        [
          await pancakePlugin.getAddress(),
          pancakePlugin.interface.getFunction('swapExactETHForTokens').selector,
          params,
          await userWallet.getAddress()
        ]
      );

      signature = await user1.signMessage(ethers.getBytes(messageHash));

      await expect(userWallet.connect(user1).executePlugin(
        pluginName,
        functionName,
        params,
        signature,
        { value: ethers.parseEther("1.0") }
      )).to.not.be.reverted;
    });

    it("Should reject execution with invalid signature", async function () {
      const pluginName = "PancakeSwap";
      const functionName = "swapExactETHForTokens";
      const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256', 'address[]', 'uint256'],
        [
          ethers.parseEther("0.1"),
          [await mockRouter.WETH(), "0x0000000000000000000000000000000000000001"],
          Math.floor(Date.now() / 1000) + 3600
        ]
      );

      messageHash = ethers.solidityPackedKeccak256(
        ['address', 'bytes4', 'bytes', 'address'],
        [
          await pancakePlugin.getAddress(),
          pancakePlugin.interface.getFunction('swapExactETHForTokens').selector,
          params,
          await userWallet.getAddress()
        ]
      );

      // Sign with wrong user
      signature = await user2.signMessage(ethers.getBytes(messageHash));

      await expect(userWallet.connect(user1).executePlugin(
        pluginName,
        functionName,
        params,
        signature,
        { value: ethers.parseEther("1.0") }
      )).to.be.revertedWith("Invalid signature");
    });
  });
}); 