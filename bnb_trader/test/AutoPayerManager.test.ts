import { expect } from "chai";
import { ethers } from "hardhat";
import { AutoPayerManager, AutoPayerImplementation, AutoPayerOracle, MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AutoPayerManager", function () {
  let manager: AutoPayerManager;
  let implementation: AutoPayerImplementation;
  let oracle: AutoPayerOracle;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let creator1: SignerWithAddress;
  let creator2: SignerWithAddress;
  let instanceOwner: SignerWithAddress;
  let feeRecipient: SignerWithAddress;
  let proxyAdminOwner: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);
  const CREATION_FEE = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, creator1, creator2, instanceOwner, feeRecipient, proxyAdminOwner] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock USDT", "USDT", INITIAL_SUPPLY);

    // Deploy AutoPayerOracle
    const AutoPayerOracle = await ethers.getContractFactory("AutoPayerOracle");
    oracle = await AutoPayerOracle.deploy();

    // Deploy AutoPayerImplementation
    const AutoPayerImplementation = await ethers.getContractFactory("AutoPayerImplementation");
    implementation = await AutoPayerImplementation.deploy();

    // Deploy AutoPayerManager
    const AutoPayerManager = await ethers.getContractFactory("AutoPayerManager");
    manager = await AutoPayerManager.deploy(
      await implementation.getAddress(),
      await oracle.getAddress(),
      feeRecipient.address,
      proxyAdminOwner.address
    );

    // Setup oracle with supported token and currency
    const ORACLE_ADMIN_ROLE = await oracle.ORACLE_ADMIN_ROLE();
    await oracle.grantRole(ORACLE_ADMIN_ROLE, owner.address);
    await oracle.setSupportedToken(await mockToken.getAddress(), true, 18);
    await oracle.setSupportedCurrency("EUR", true);

    // Setup exchange rate
    const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
    await oracle.grantRole(PRICE_UPDATER_ROLE, owner.address);
    await oracle.updateExchangeRate("EUR", await mockToken.getAddress(), ethers.parseUnits("1.1", 18));
  });

  describe("Deployment", function () {
    it("Should set correct initial values", async function () {
      expect(await manager.autoPayerImplementation()).to.equal(await implementation.getAddress());
      expect(await manager.oracle()).to.equal(await oracle.getAddress());
      expect(await manager.feeRecipient()).to.equal(feeRecipient.address);
      expect(await manager.creationFee()).to.equal(0);
      expect(await manager.maxInstancesPerCreator()).to.equal(10);
      expect(await manager.totalInstanceLimit()).to.equal(1000);
    });

    it("Should grant correct roles to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await manager.DEFAULT_ADMIN_ROLE();
      const MANAGER_ADMIN_ROLE = await manager.MANAGER_ADMIN_ROLE();
      const CREATOR_ROLE = await manager.CREATOR_ROLE();

      expect(await manager.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await manager.hasRole(MANAGER_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await manager.hasRole(CREATOR_ROLE, owner.address)).to.be.true;
      expect(await manager.authorizedCreators(owner.address)).to.be.true;
    });
  });

  describe("Creator Authorization", function () {
    it("Should authorize new creators", async function () {
      await expect(manager.setCreatorAuthorization(creator1.address, true, 5))
        .to.emit(manager, "CreatorAuthorized")
        .withArgs(creator1.address, true, 5);

      expect(await manager.authorizedCreators(creator1.address)).to.be.true;
      expect(await manager.creatorLimit(creator1.address)).to.equal(5);
      
      const CREATOR_ROLE = await manager.CREATOR_ROLE();
      expect(await manager.hasRole(CREATOR_ROLE, creator1.address)).to.be.true;
    });

    it("Should deauthorize creators", async function () {
      await manager.setCreatorAuthorization(creator1.address, true, 5);
      
      await expect(manager.setCreatorAuthorization(creator1.address, false, 0))
        .to.emit(manager, "CreatorAuthorized")
        .withArgs(creator1.address, false, 0);

      expect(await manager.authorizedCreators(creator1.address)).to.be.false;
      
      const CREATOR_ROLE = await manager.CREATOR_ROLE();
      expect(await manager.hasRole(CREATOR_ROLE, creator1.address)).to.be.false;
    });

    it("Should only allow manager admin to authorize creators", async function () {
      await expect(manager.connect(creator1).setCreatorAuthorization(creator2.address, true, 5))
        .to.be.reverted;
    });
  });

  describe("Instance Creation", function () {
    beforeEach(async function () {
      await manager.setCreatorAuthorization(creator1.address, true, 5);
      await manager.setFees(CREATION_FEE, 0);
    });

    it("Should create new instance successfully", async function () {
      const tx = await manager.connect(creator1).createAutoPayerInstance(
        instanceOwner.address,
        feeRecipient.address,
        { value: CREATION_FEE }
      );

      await expect(tx).to.emit(manager, "AutoPayerCreated");

      const instances = await manager.getUserInstances(creator1.address);
      expect(instances.length).to.equal(1);

      const [authorized, limit, count] = await manager.getCreatorInfo(creator1.address);
      expect(authorized).to.be.true;
      expect(limit).to.equal(5);
      expect(count).to.equal(1);
    });

    it("Should create self-owned instance", async function () {
      // Authorize creator1 first
      await manager.setCreatorAuthorization(creator1.address, true, 5);
      
      const tx = await manager.connect(creator1).createSelfOwnedInstance({ value: CREATION_FEE });
      await expect(tx).to.emit(manager, "AutoPayerCreated");

      const instances = await manager.getUserInstances(creator1.address);
      expect(instances.length).to.equal(1);
    });

    it("Should fail if creator not authorized", async function () {
      await expect(
        manager.connect(creator2).createAutoPayerInstance(
          instanceOwner.address,
          feeRecipient.address,
          { value: CREATION_FEE }
        )
      ).to.be.revertedWithCustomError(manager, "AccessControlUnauthorizedAccount");
    });

    it("Should fail if insufficient creation fee", async function () {
      await expect(
        manager.connect(creator1).createAutoPayerInstance(
          instanceOwner.address,
          feeRecipient.address,
          { value: CREATION_FEE / 2n }
        )
      ).to.be.revertedWith("Insufficient creation fee");
    });

    it("Should fail if creator limit exceeded", async function () {
      await manager.setCreatorAuthorization(creator1.address, true, 1);
      
      // Create first instance
      await manager.connect(creator1).createAutoPayerInstance(
        instanceOwner.address,
        feeRecipient.address,
        { value: CREATION_FEE }
      );

      // Try to create second instance
      await expect(
        manager.connect(creator1).createAutoPayerInstance(
          instanceOwner.address,
          feeRecipient.address,
          { value: CREATION_FEE }
        )
      ).to.be.revertedWith("Creator limit exceeded");
    });
  });

  describe("Instance Management", function () {
    let instanceAddress: string;

    beforeEach(async function () {
      await manager.setCreatorAuthorization(creator1.address, true, 5);
      await manager.setFees(CREATION_FEE, 0);

      const tx = await manager.connect(creator1).createAutoPayerInstance(
        instanceOwner.address,
        feeRecipient.address,
        { value: CREATION_FEE }
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => {
        try {
          return manager.interface.parseLog(log)?.name === "AutoPayerCreated";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = manager.interface.parseLog(event);
        instanceAddress = parsed?.args.proxy;
      }
    });

    it("Should track created instances", async function () {
      expect(await manager.isAutoPayerInstance(instanceAddress)).to.be.true;
      
      const allInstances = await manager.getAllInstances();
      expect(allInstances).to.include(instanceAddress);
      
      const creatorInstances = await manager.getUserInstances(creator1.address);
      expect(creatorInstances).to.include(instanceAddress);
    });

    it("Should allow global verifier management", async function () {
      const verifier = creator2.address;
      
      await manager.addGlobalVerifier(verifier);
      
      const VERIFIER_ROLE = await manager.VERIFIER_ROLE();
      expect(await manager.hasRole(VERIFIER_ROLE, verifier)).to.be.true;
    });

    it("Should allow emergency pause of all instances", async function () {
      await manager.pauseAllInstances();
      // Note: This would require checking if instances are actually paused
      // which would need the instance contracts to be properly deployed
    });
  });

  describe("Upgrade Management", function () {
    let instanceAddress: string;
    let newImplementation: AutoPayerImplementation;

    beforeEach(async function () {
      await manager.setCreatorAuthorization(creator1.address, true, 5);
      await manager.setFees(CREATION_FEE, 0);

      const tx = await manager.connect(creator1).createAutoPayerInstance(
        instanceOwner.address,
        feeRecipient.address,
        { value: CREATION_FEE }
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => {
        try {
          return manager.interface.parseLog(log)?.name === "AutoPayerCreated";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = manager.interface.parseLog(event);
        instanceAddress = parsed?.args.proxy;
      }

      // Deploy new implementation
      const AutoPayerImplementation = await ethers.getContractFactory("AutoPayerImplementation");
      newImplementation = await AutoPayerImplementation.deploy();
    });

    it("Should update implementation template", async function () {
      await expect(manager.setAutoPayerImplementation(await newImplementation.getAddress()))
        .to.emit(manager, "ImplementationUpdated")
        .withArgs(await implementation.getAddress(), await newImplementation.getAddress());

      expect(await manager.autoPayerImplementation()).to.equal(await newImplementation.getAddress());
    });

    it("Should upgrade all instances", async function () {
      await expect(manager.upgradeAllInstances(await newImplementation.getAddress()))
        .to.emit(manager, "ImplementationUpdated");
    });
  });

  describe("Fee Management", function () {
    it("Should update fees", async function () {
      const newCreationFee = ethers.parseEther("0.2");
      const newCommission = 500; // 5%

      await expect(manager.setFees(newCreationFee, newCommission))
        .to.emit(manager, "FeesUpdated")
        .withArgs(newCreationFee, newCommission);

      expect(await manager.creationFee()).to.equal(newCreationFee);
      expect(await manager.creatorCommission()).to.equal(newCommission);
    });

    it("Should reject too high commission", async function () {
      await expect(manager.setFees(0, 10001)) // > 100%
        .to.be.revertedWith("Commission too high");
    });

    it("Should withdraw accumulated fees", async function () {
      // Send some ETH directly to the manager contract to simulate accumulated fees
      const sendAmount = ethers.parseEther("0.1");
      await owner.sendTransaction({
        to: await manager.getAddress(),
        value: sendAmount
      });

      const feeRecipientBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);
      
      const tx = await manager.withdrawFees();
      await tx.wait();
      
      const feeRecipientBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      // The contract should have transferred the accumulated balance
      expect(feeRecipientBalanceAfter).to.equal(feeRecipientBalanceBefore + sendAmount);
    });
  });

  describe("Instance Limits", function () {
    it("Should update instance limits", async function () {
      const newMaxPerCreator = 20;
      const newTotalLimit = 2000;

      await manager.setInstanceLimits(newMaxPerCreator, newTotalLimit);

      expect(await manager.maxInstancesPerCreator()).to.equal(newMaxPerCreator);
      expect(await manager.totalInstanceLimit()).to.equal(newTotalLimit);
    });

    it("Should check if creator can create instances", async function () {
      await manager.setCreatorAuthorization(creator1.address, true, 5);
      expect(await manager.canCreateInstance(creator1.address)).to.be.true;

      expect(await manager.canCreateInstance(creator2.address)).to.be.false;
    });
  });

  describe("Oracle Management", function () {
    it("Should update oracle", async function () {
      const newOracle = await (await ethers.getContractFactory("AutoPayerOracle")).deploy();
      
      await expect(manager.setOracle(await newOracle.getAddress()))
        .to.emit(manager, "OracleUpdated")
        .withArgs(await oracle.getAddress(), await newOracle.getAddress());

      expect(await manager.oracle()).to.equal(await newOracle.getAddress());
    });
  });

  describe("Access Control", function () {
    it("Should only allow manager admin to call admin functions", async function () {
      await expect(manager.connect(creator1).setCreatorAuthorization(creator2.address, true, 5))
        .to.be.reverted;

      await expect(manager.connect(creator1).setFees(CREATION_FEE, 0))
        .to.be.reverted;

      await expect(manager.connect(creator1).setInstanceLimits(20, 2000))
        .to.be.reverted;
    });

    it("Should allow pausing and unpausing", async function () {
      await manager.pause();
      expect(await manager.paused()).to.be.true;

      await manager.unpause();
      expect(await manager.paused()).to.be.false;
    });
  });
}); 