import { expect } from "chai";
import { ethers } from "hardhat";
import { AutoPayerOracle } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AutoPayerOracle", function () {
  let oracle: AutoPayerOracle;
  let owner: SignerWithAddress;
  let oracleAdmin: SignerWithAddress;
  let priceUpdater: SignerWithAddress;
  let user: SignerWithAddress;
  let mockUSDT: string;
  let mockUSDC: string;

  beforeEach(async function () {
    [owner, oracleAdmin, priceUpdater, user] = await ethers.getSigners();
    
    // Mock token addresses
    mockUSDT = ethers.Wallet.createRandom().address;
    mockUSDC = ethers.Wallet.createRandom().address;

    // Deploy AutoPayerOracle
    const AutoPayerOracle = await ethers.getContractFactory("AutoPayerOracle");
    oracle = await AutoPayerOracle.deploy();

    // Setup roles
    const ORACLE_ADMIN_ROLE = await oracle.ORACLE_ADMIN_ROLE();
    const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
    
    await oracle.grantRole(ORACLE_ADMIN_ROLE, oracleAdmin.address);
    await oracle.grantRole(PRICE_UPDATER_ROLE, priceUpdater.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner and roles", async function () {
      const DEFAULT_ADMIN_ROLE = await oracle.DEFAULT_ADMIN_ROLE();
      expect(await oracle.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      
      const ORACLE_ADMIN_ROLE = await oracle.ORACLE_ADMIN_ROLE();
      expect(await oracle.hasRole(ORACLE_ADMIN_ROLE, oracleAdmin.address)).to.be.true;
      
      const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
      expect(await oracle.hasRole(PRICE_UPDATER_ROLE, priceUpdater.address)).to.be.true;
    });

    it("Should have correct initial platform settings", async function () {
      expect(await oracle.platformFeeRate()).to.equal(100); // 1%
      expect(await oracle.escrowDuration()).to.equal(7 * 24 * 60 * 60); // 7 days
      expect(await oracle.minEscrowAmount()).to.equal(ethers.parseUnits("1", 18));
      expect(await oracle.maxEscrowAmount()).to.equal(ethers.parseUnits("1000000", 18));
      expect(await oracle.maxRateDeviation()).to.equal(500); // 5%
      expect(await oracle.rateValidityPeriod()).to.equal(60 * 60); // 1 hour
    });
  });

  describe("Supported Tokens and Currencies", function () {
    it("Should add and remove supported tokens", async function () {
      expect(await oracle.supportedTokens(mockUSDT)).to.be.false;
      
      await expect(oracle.connect(oracleAdmin).setSupportedToken(mockUSDT, true, 18))
        .to.emit(oracle, "TokenSupported")
        .withArgs(mockUSDT, true, 18);
      
      expect(await oracle.supportedTokens(mockUSDT)).to.be.true;
      
      await expect(oracle.connect(oracleAdmin).setSupportedToken(mockUSDT, false, 18))
        .to.emit(oracle, "TokenSupported")
        .withArgs(mockUSDT, false, 18);
      
      expect(await oracle.supportedTokens(mockUSDT)).to.be.false;
    });

    it("Should add and remove supported currencies", async function () {
      expect(await oracle.supportedCurrencies("EUR")).to.be.true; // EUR is supported by default
      
      await expect(oracle.connect(oracleAdmin).setSupportedCurrency("JPY", true))
        .to.emit(oracle, "CurrencySupported")
        .withArgs("JPY", true);
      
      expect(await oracle.supportedCurrencies("JPY")).to.be.true;
      
      await expect(oracle.connect(oracleAdmin).setSupportedCurrency("EUR", false))
        .to.emit(oracle, "CurrencySupported")
        .withArgs("EUR", false);
      
      expect(await oracle.supportedCurrencies("EUR")).to.be.false;
    });

    it("Should only allow oracle admin to manage tokens and currencies", async function () {
      await expect(oracle.connect(user).setSupportedToken(mockUSDT, true, 18))
        .to.be.reverted;
      
      await expect(oracle.connect(user).setSupportedCurrency("EUR", true))
        .to.be.reverted;
    });
  });

  describe("Exchange Rate Management", function () {
    beforeEach(async function () {
      // Add supported token and currency
      await oracle.connect(oracleAdmin).setSupportedToken(mockUSDT, true, 18);
      // EUR is already supported by default
    });

    it("Should update exchange rate", async function () {
      const rate = ethers.parseUnits("0.85", 18); // 1 EUR = 0.85 USDT
      
      const tx = await oracle.connect(priceUpdater).updateExchangeRate("EUR", mockUSDT, rate);
      await expect(tx).to.emit(oracle, "ExchangeRateUpdated");
      
      const [storedRate, isValid] = await oracle.getExchangeRate("EUR", mockUSDT);
      expect(storedRate).to.equal(rate);
      expect(isValid).to.be.true;
    });

    it("Should validate price deviation", async function () {
      const initialRate = ethers.parseUnits("1.0", 18);
      await oracle.connect(priceUpdater).updateExchangeRate("EUR", mockUSDT, initialRate);
      
      // Try to update with rate that exceeds max deviation (5%)
      const deviatedRate = ethers.parseUnits("1.06", 18); // 6% increase
      await expect(oracle.connect(priceUpdater).updateExchangeRate("EUR", mockUSDT, deviatedRate))
        .to.be.revertedWith("Rate deviation too high");
    });

    it("Should allow admin to bypass some restrictions", async function () {
      const initialRate = ethers.parseUnits("1.0", 18);
      await oracle.connect(priceUpdater).updateExchangeRate("EUR", mockUSDT, initialRate);
      
      // Grant PRICE_UPDATER_ROLE to oracleAdmin for this test
      const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
      await oracle.grantRole(PRICE_UPDATER_ROLE, oracleAdmin.address);
      
      // Set higher deviation limit first to test admin capabilities
      await oracle.connect(oracleAdmin).setRateLimits(1500, 60 * 60); // 15% deviation allowed
      
      const deviatedRate = ethers.parseUnits("1.1", 18); // 10% increase (within new limit)
      const tx = await oracle.connect(oracleAdmin).updateExchangeRate("EUR", mockUSDT, deviatedRate);
      await expect(tx).to.emit(oracle, "ExchangeRateUpdated");
    });

    it("Should mark old rates as invalid", async function () {
      const rate = ethers.parseUnits("1.0", 18);
      await oracle.connect(priceUpdater).updateExchangeRate("EUR", mockUSDT, rate);
      
      // Fast forward time beyond validity duration
      await ethers.provider.send("evm_increaseTime", [60 * 60 + 1]); // 1 hour + 1 second
      await ethers.provider.send("evm_mine", []);
      
      const [storedRate, isValid] = await oracle.getExchangeRate("EUR", mockUSDT);
      expect(storedRate).to.equal(rate);
      expect(isValid).to.be.false;
    });

    it("Should only allow price updaters to update rates", async function () {
      const rate = ethers.parseUnits("1.0", 18);
      
      await expect(oracle.connect(user).updateExchangeRate("EUR", mockUSDT, rate))
        .to.be.reverted;
    });
  });

  describe("Token Amount Calculations", function () {
    beforeEach(async function () {
      await oracle.connect(oracleAdmin).setSupportedToken(mockUSDT, true, 18);
      // EUR is already supported by default
      
      // Set exchange rate: 1 EUR = 1.1 USDT
      const rate = ethers.parseUnits("1.1", 18);
      await oracle.connect(priceUpdater).updateExchangeRate("EUR", mockUSDT, rate);
    });

    it("Should calculate correct token amount", async function () {
      const fiatAmount = 10000; // €100.00 in cents
      const expectedTokenAmount = ethers.parseUnits("110", 18); // 100 EUR * 1.1 = 110 USDT
      
      const calculatedAmount = await oracle.calculateTokenAmount("EUR", mockUSDT, fiatAmount);
      expect(calculatedAmount).to.equal(expectedTokenAmount);
    });

    // Note: Oracle doesn't have calculateFiatAmount method
  });

  describe("Platform Settings", function () {
    it("Should update platform fee rate", async function () {
      const newFeeRate = 200; // 2%
      
      await expect(oracle.connect(oracleAdmin).setPlatformFeeRate(newFeeRate))
        .to.emit(oracle, "PlatformFeeUpdated")
        .withArgs(100, newFeeRate); // old fee was 100
      
      expect(await oracle.platformFeeRate()).to.equal(newFeeRate);
    });

    it("Should update escrow duration", async function () {
      const newDuration = 48 * 60 * 60; // 48 hours
      
      await expect(oracle.connect(oracleAdmin).setEscrowDuration(newDuration))
        .to.emit(oracle, "EscrowDurationUpdated")
        .withArgs(7 * 24 * 60 * 60, newDuration); // old duration was 7 days
      
      expect(await oracle.escrowDuration()).to.equal(newDuration);
    });

    it("Should update escrow amount limits", async function () {
      const newMinAmount = ethers.parseUnits("5", 18);
      const newMaxAmount = ethers.parseUnits("50000", 18);
      
      await oracle.connect(oracleAdmin).setEscrowLimits(newMinAmount, newMaxAmount);
      
      expect(await oracle.minEscrowAmount()).to.equal(newMinAmount);
      expect(await oracle.maxEscrowAmount()).to.equal(newMaxAmount);
    });

    it("Should validate escrow amounts", async function () {
      const validAmount = ethers.parseUnits("100", 18);
      const tooSmallAmount = ethers.parseUnits("0.5", 18); // Below 1 token min
      const tooLargeAmount = ethers.parseUnits("2000000", 18); // Above 1M max
      
      expect(await oracle.isValidEscrowAmount(validAmount)).to.be.true;
      expect(await oracle.isValidEscrowAmount(tooSmallAmount)).to.be.false;
      expect(await oracle.isValidEscrowAmount(tooLargeAmount)).to.be.false;
    });

    it("Should only allow oracle admin to update settings", async function () {
      await expect(oracle.connect(user).setPlatformFeeRate(200))
        .to.be.reverted;
      
      await expect(oracle.connect(user).setEscrowDuration(48 * 60 * 60))
        .to.be.reverted;
    });
  });

  describe("Emergency Functions", function () {
    it("Should pause and unpause the contract", async function () {
      await oracle.connect(oracleAdmin).pause();
      expect(await oracle.paused()).to.be.true;
      
      await oracle.connect(oracleAdmin).unpause();
      expect(await oracle.paused()).to.be.false;
    });

    it("Should not allow operations when paused", async function () {
      await oracle.connect(oracleAdmin).pause();
      
      const rate = ethers.parseUnits("1.0", 18);
      await expect(oracle.connect(priceUpdater).updateExchangeRate("EUR", mockUSDT, rate))
        .to.be.revertedWithCustomError(oracle, "EnforcedPause");
    });
  });
}); 