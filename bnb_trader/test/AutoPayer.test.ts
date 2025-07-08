import { expect } from "chai";
import { ethers } from "hardhat";
import { AutoPayer, MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AutoPayer", function () {
  let autoPayer: AutoPayer;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress; // Requester
  let bob: SignerWithAddress;   // Payer
  let feeRecipient: SignerWithAddress;
  let verifier: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);
  const ESCROW_AMOUNT = ethers.parseUnits("150", 18); // 150 USDT
  const FIAT_AMOUNT = 15000; // €150.00 in cents
  const RECEIPT_REQUIREMENTS = "Bank transfer screenshot showing: €150 transfer, recipient IBAN matching DE89370400440532013000, transfer date, sender bank details visible";

  beforeEach(async function () {
    [owner, alice, bob, feeRecipient, verifier] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock USDT", "USDT", INITIAL_SUPPLY);

    // Deploy AutoPayer contract
    const AutoPayer = await ethers.getContractFactory("AutoPayer");
    autoPayer = await AutoPayer.deploy(feeRecipient.address);

    // Setup
    await autoPayer.addSupportedToken(await mockToken.getAddress());
    await autoPayer.addVerifier(verifier.address);

    // Give Alice and Bob some tokens
    await mockToken.transfer(alice.address, ethers.parseUnits("1000", 18));
    await mockToken.transfer(bob.address, ethers.parseUnits("1000", 18));
  });

  describe("Escrow Request Creation", function () {
    it("Should create an escrow request successfully with receipt requirements", async function () {
      // Alice approves AutoPayer to spend her tokens
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT);

      // Alice creates escrow request
      await expect(
        autoPayer.connect(alice).createEscrowRequest(
          await mockToken.getAddress(),
          ESCROW_AMOUNT,
          FIAT_AMOUNT,
          "EUR",
          "DE89370400440532013000", // Mock IBAN
          "Rent payment for November",
          RECEIPT_REQUIREMENTS
        )
      ).to.emit(autoPayer, "EscrowCreated")
       .withArgs(1, alice.address, await mockToken.getAddress(), ESCROW_AMOUNT, FIAT_AMOUNT, "EUR", RECEIPT_REQUIREMENTS);

      const request = await autoPayer.getEscrowRequest(1);
      expect(request.requester).to.equal(alice.address);
      expect(request.tokenAmount).to.equal(ESCROW_AMOUNT);
      expect(request.fiatAmount).to.equal(FIAT_AMOUNT);
      expect(request.receiptRequirements).to.equal(RECEIPT_REQUIREMENTS);
      expect(request.status).to.equal(0); // EscrowStatus.Open
    });

    it("Should fail if receipt requirements are empty", async function () {
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT);

      await expect(
        autoPayer.connect(alice).createEscrowRequest(
          await mockToken.getAddress(),
          ESCROW_AMOUNT,
          FIAT_AMOUNT,
          "EUR",
          "DE89370400440532013000",
          "Test payment",
          "" // Empty receipt requirements
        )
      ).to.be.revertedWith("Receipt requirements required for AI verification");
    });

    it("Should fail if token is not supported", async function () {
      const UnsupportedToken = await ethers.getContractFactory("MockERC20");
      const unsupportedToken = await UnsupportedToken.deploy("Unsupported", "UNS", INITIAL_SUPPLY);

      await expect(
        autoPayer.connect(alice).createEscrowRequest(
          await unsupportedToken.getAddress(),
          ESCROW_AMOUNT,
          FIAT_AMOUNT,
          "EUR",
          "DE89370400440532013000",
          "Test payment",
          RECEIPT_REQUIREMENTS
        )
      ).to.be.revertedWith("Token not supported");
    });
  });

  describe("Receipt Requirements Functions", function () {
    beforeEach(async function () {
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT);
      await autoPayer.connect(alice).createEscrowRequest(
        await mockToken.getAddress(),
        ESCROW_AMOUNT,
        FIAT_AMOUNT,
        "EUR",
        "DE89370400440532013000",
        "Rent payment",
        RECEIPT_REQUIREMENTS
      );
    });

    it("Should return receipt requirements for a request", async function () {
      const requirements = await autoPayer.getReceiptRequirements(1);
      expect(requirements).to.equal(RECEIPT_REQUIREMENTS);
    });

    it("Should fail to get receipt requirements for non-existent request", async function () {
      await expect(autoPayer.getReceiptRequirements(999))
        .to.be.revertedWith("Request does not exist");
    });
  });

  describe("Escrow Acceptance", function () {
    beforeEach(async function () {
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT);
      await autoPayer.connect(alice).createEscrowRequest(
        await mockToken.getAddress(),
        ESCROW_AMOUNT,
        FIAT_AMOUNT,
        "EUR",
        "DE89370400440532013000",
        "Rent payment",
        RECEIPT_REQUIREMENTS
      );
    });

    it("Should allow Bob to accept the escrow request", async function () {
      await expect(autoPayer.connect(bob).acceptEscrowRequest(1))
        .to.emit(autoPayer, "EscrowAccepted")
        .withArgs(1, bob.address);

      const request = await autoPayer.getEscrowRequest(1);
      expect(request.payer).to.equal(bob.address);
      expect(request.status).to.equal(1); // EscrowStatus.Accepted
    });

    it("Should not allow Alice to accept her own request", async function () {
      await expect(autoPayer.connect(alice).acceptEscrowRequest(1))
        .to.be.revertedWith("Cannot accept own request");
    });
  });

  describe("Receipt Submission and Verification", function () {
    const receiptHash = ethers.keccak256(ethers.toUtf8Bytes("bank_receipt_proof"));

    beforeEach(async function () {
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT);
      await autoPayer.connect(alice).createEscrowRequest(
        await mockToken.getAddress(),
        ESCROW_AMOUNT,
        FIAT_AMOUNT,
        "EUR",
        "DE89370400440532013000",
        "Rent payment",
        RECEIPT_REQUIREMENTS
      );
      await autoPayer.connect(bob).acceptEscrowRequest(1);
    });

    it("Should allow Bob to submit receipt", async function () {
      await expect(autoPayer.connect(bob).submitReceipt(1, receiptHash))
        .to.emit(autoPayer, "ReceiptSubmitted")
        .withArgs(1, receiptHash, bob.address);

      const request = await autoPayer.getEscrowRequest(1);
      expect(request.receiptHash).to.equal(receiptHash);
      expect(request.status).to.equal(2); // EscrowStatus.ReceiptSubmitted
    });

    it("Should complete escrow when verifier approves", async function () {
      await autoPayer.connect(bob).submitReceipt(1, receiptHash);

      const bobBalanceBefore = await mockToken.balanceOf(bob.address);
      const feeRecipientBalanceBefore = await mockToken.balanceOf(feeRecipient.address);

      await expect(autoPayer.connect(verifier).verifyAndRelease(1, true))
        .to.emit(autoPayer, "EscrowCompleted");

      const request = await autoPayer.getEscrowRequest(1);
      expect(request.status).to.equal(3); // EscrowStatus.Completed

      // Check balances
      const platformFee = (ESCROW_AMOUNT * 100n) / 10000n; // 1% fee
      const expectedPayerAmount = ESCROW_AMOUNT - platformFee;

      expect(await mockToken.balanceOf(bob.address)).to.equal(bobBalanceBefore + expectedPayerAmount);
      expect(await mockToken.balanceOf(feeRecipient.address)).to.equal(feeRecipientBalanceBefore + platformFee);
    });

    it("Should refund Alice when verifier rejects", async function () {
      await autoPayer.connect(bob).submitReceipt(1, receiptHash);

      const aliceBalanceBefore = await mockToken.balanceOf(alice.address);

      await expect(autoPayer.connect(verifier).verifyAndRelease(1, false))
        .to.emit(autoPayer, "EscrowRefunded");

      expect(await mockToken.balanceOf(alice.address)).to.equal(aliceBalanceBefore + ESCROW_AMOUNT);
    });
  });

  describe("Dispute Resolution", function () {
    const receiptHash = ethers.keccak256(ethers.toUtf8Bytes("disputed_receipt"));

    beforeEach(async function () {
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT);
      await autoPayer.connect(alice).createEscrowRequest(
        await mockToken.getAddress(),
        ESCROW_AMOUNT,
        FIAT_AMOUNT,
        "EUR",
        "DE89370400440532013000",
        "Disputed payment",
        RECEIPT_REQUIREMENTS
      );
      await autoPayer.connect(bob).acceptEscrowRequest(1);
    });

    it("Should allow either party to raise a dispute", async function () {
      await expect(autoPayer.connect(alice).raiseDispute(1))
        .to.emit(autoPayer, "DisputeRaised")
        .withArgs(1, alice.address);

      const request = await autoPayer.getEscrowRequest(1);
      expect(request.disputed).to.be.true;
      expect(request.status).to.equal(6); // EscrowStatus.Disputed
    });

    it("Should resolve dispute in favor of payer", async function () {
      await autoPayer.connect(bob).submitReceipt(1, receiptHash);
      await autoPayer.connect(alice).raiseDispute(1);

      const bobBalanceBefore = await mockToken.balanceOf(bob.address);
      
      await expect(autoPayer.connect(verifier).resolveDispute(1, true))
        .to.emit(autoPayer, "DisputeResolved")
        .withArgs(1, true);

      const platformFee = (ESCROW_AMOUNT * 100n) / 10000n;
      const expectedPayerAmount = ESCROW_AMOUNT - platformFee;

      expect(await mockToken.balanceOf(bob.address)).to.equal(bobBalanceBefore + expectedPayerAmount);
    });

    it("Should resolve dispute in favor of requester", async function () {
      await autoPayer.connect(bob).submitReceipt(1, receiptHash);
      await autoPayer.connect(bob).raiseDispute(1);

      const aliceBalanceBefore = await mockToken.balanceOf(alice.address);
      
      await expect(autoPayer.connect(verifier).resolveDispute(1, false))
        .to.emit(autoPayer, "DisputeResolved")
        .withArgs(1, false);

      expect(await mockToken.balanceOf(alice.address)).to.equal(aliceBalanceBefore + ESCROW_AMOUNT);
    });
  });

  describe("Cancellation and Expiration", function () {
    beforeEach(async function () {
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT);
      await autoPayer.connect(alice).createEscrowRequest(
        await mockToken.getAddress(),
        ESCROW_AMOUNT,
        FIAT_AMOUNT,
        "EUR",
        "DE89370400440532013000",
        "Cancellable payment",
        RECEIPT_REQUIREMENTS
      );
    });

    it("Should allow Alice to cancel her own request", async function () {
      const aliceBalanceBefore = await mockToken.balanceOf(alice.address);

      await expect(autoPayer.connect(alice).cancelRequest(1))
        .to.emit(autoPayer, "EscrowCancelled")
        .withArgs(1);

      expect(await mockToken.balanceOf(alice.address)).to.equal(aliceBalanceBefore + ESCROW_AMOUNT);
    });

    it("Should not allow Bob to cancel Alice's request", async function () {
      await expect(autoPayer.connect(bob).cancelRequest(1))
        .to.be.revertedWith("Not the requester");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add/remove verifiers", async function () {
      const newVerifier = bob.address;
      
      await autoPayer.addVerifier(newVerifier);
      expect(await autoPayer.verifiers(newVerifier)).to.be.true;
      
      await autoPayer.removeVerifier(newVerifier);
      expect(await autoPayer.verifiers(newVerifier)).to.be.false;
    });

    it("Should allow owner to add/remove supported tokens", async function () {
      const newToken = bob.address; // Using address as mock token
      
      await autoPayer.addSupportedToken(newToken);
      expect(await autoPayer.supportedTokens(newToken)).to.be.true;
      
      await autoPayer.removeSupportedToken(newToken);
      expect(await autoPayer.supportedTokens(newToken)).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("Should return user requests and payments", async function () {
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT);
      await autoPayer.connect(alice).createEscrowRequest(
        await mockToken.getAddress(),
        ESCROW_AMOUNT,
        FIAT_AMOUNT,
        "EUR",
        "DE89370400440532013000",
        "Test payment",
        RECEIPT_REQUIREMENTS
      );
      await autoPayer.connect(bob).acceptEscrowRequest(1);

      const aliceRequests = await autoPayer.getUserRequests(alice.address);
      const bobPayments = await autoPayer.getUserPayments(bob.address);

      expect(aliceRequests).to.deep.equal([1n]);
      expect(bobPayments).to.deep.equal([1n]);
    });

    it("Should return active requests", async function () {
      await mockToken.connect(alice).approve(await autoPayer.getAddress(), ESCROW_AMOUNT * 2n);
      
      // Create two requests
      await autoPayer.connect(alice).createEscrowRequest(
        await mockToken.getAddress(),
        ESCROW_AMOUNT,
        FIAT_AMOUNT,
        "EUR",
        "DE89370400440532013000",
        "Payment 1",
        RECEIPT_REQUIREMENTS
      );
      
      await autoPayer.connect(alice).createEscrowRequest(
        await mockToken.getAddress(),
        ESCROW_AMOUNT,
        FIAT_AMOUNT,
        "EUR",
        "DE89370400440532013000",
        "Payment 2",
        RECEIPT_REQUIREMENTS
      );

      const activeRequests = await autoPayer.getActiveRequests();
      expect(activeRequests).to.deep.equal([1n, 2n]);
    });
  });
}); 