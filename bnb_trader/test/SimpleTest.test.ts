import { expect } from "chai";
import { ethers } from "hardhat";
import { MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Simple AutoPayer Tests", function () {
  let oracle: any;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock USDT", "USDT", INITIAL_SUPPLY);

    // Deploy AutoPayerOracle
    const AutoPayerOracle = await ethers.getContractFactory("AutoPayerOracle");
    oracle = await AutoPayerOracle.deploy();

    // Give Alice and Bob some tokens
    await mockToken.transfer(alice.address, ethers.parseUnits("1000", 18));
    await mockToken.transfer(bob.address, ethers.parseUnits("1000", 18));
  });

  describe("Mock Token", function () {
    it("Should deploy mock token correctly", async function () {
      expect(await mockToken.name()).to.equal("Mock USDT");
      expect(await mockToken.symbol()).to.equal("USDT");
      expect(await mockToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should transfer tokens correctly", async function () {
      expect(await mockToken.balanceOf(alice.address)).to.equal(ethers.parseUnits("1000", 18));
      expect(await mockToken.balanceOf(bob.address)).to.equal(ethers.parseUnits("1000", 18));
    });
  });

  describe("Oracle Deployment", function () {
    it("Should deploy oracle correctly", async function () {
      expect(await oracle.platformFeeRate()).to.equal(100); // 1%
      expect(await oracle.supportedCurrencies("EUR")).to.be.true;
      expect(await oracle.supportedCurrencies("USD")).to.be.true;
      expect(await oracle.supportedCurrencies("GBP")).to.be.true;
    });

    it("Should add supported token", async function () {
      expect(await oracle.supportedTokens(await mockToken.getAddress())).to.be.false;
      
      const ORACLE_ADMIN_ROLE = await oracle.ORACLE_ADMIN_ROLE();
      await oracle.grantRole(ORACLE_ADMIN_ROLE, owner.address);
      
      await oracle.setSupportedToken(await mockToken.getAddress(), true, 18);
      expect(await oracle.supportedTokens(await mockToken.getAddress())).to.be.true;
    });

    it("Should update exchange rate", async function () {
      const ORACLE_ADMIN_ROLE = await oracle.ORACLE_ADMIN_ROLE();
      await oracle.grantRole(ORACLE_ADMIN_ROLE, owner.address);
      await oracle.setSupportedToken(await mockToken.getAddress(), true, 18);
      
      const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
      await oracle.grantRole(PRICE_UPDATER_ROLE, owner.address);
      
      const rate = ethers.parseUnits("1.1", 18);
      await oracle.updateExchangeRate("EUR", await mockToken.getAddress(), rate);
      
      const [storedRate, isValid] = await oracle.getExchangeRate("EUR", await mockToken.getAddress());
      expect(storedRate).to.equal(rate);
      expect(isValid).to.be.true;
    });
  });

  describe("Implementation Contract", function () {
    it("Should deploy implementation contract", async function () {
      const AutoPayerImplementation = await ethers.getContractFactory("AutoPayerImplementation");
      const implementation = await AutoPayerImplementation.deploy();
      
      expect(await implementation.version()).to.equal(1);
      expect(await implementation.nextRequestId()).to.equal(1);
    });
  });
}); 