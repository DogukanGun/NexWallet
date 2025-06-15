import { ethers } from 'ethers';
import { config } from '../config/config';

// AutoPayer contract ABI (simplified for main functions)
const AUTOPAYER_ABI = [
  "function createEscrowRequest(address,uint256,uint256,string,string,string,string) external returns (uint256)",
  "function acceptEscrowRequest(uint256) external",
  "function submitReceipt(uint256,bytes32) external",
  "function verifyAndRelease(uint256,bool) external",
  "function raiseDispute(uint256) external",
  "function cancelRequest(uint256) external",
  "function getEscrowRequest(uint256) external view returns (tuple)",
  "function getReceiptRequirements(uint256) external view returns (string)",
  "event EscrowCreated(uint256 indexed,address indexed,address,uint256,uint256,string,string)",
  "event EscrowAccepted(uint256 indexed,address indexed)",
  "event ReceiptSubmitted(uint256 indexed,bytes32,address indexed)",
  "event EscrowCompleted(uint256 indexed,address indexed,address indexed,uint256)",
  "event DisputeRaised(uint256 indexed,address indexed)"
];

class ContractService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.BNB_RPC_URL);
    this.wallet = new ethers.Wallet(config.PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      config.AUTOPAYER_CONTRACT_ADDRESS,
      AUTOPAYER_ABI,
      this.wallet
    );
  }

  async createEscrowRequest(escrowData: any) {
    try {
      const {
        tokenAddress,
        tokenAmount,
        fiatAmount,
        fiatCurrency,
        bankDetails,
        description,
        receiptRequirements
      } = escrowData;

      // Convert token amount to BigNumber (assuming 18 decimals)
      const tokenAmountBN = ethers.parseUnits(tokenAmount, 18);
      
      // Convert fiat amount to cents
      const fiatAmountCents = Math.round(parseFloat(fiatAmount) * 100);

      const tx = await this.contract.createEscrowRequest(
        tokenAddress,
        tokenAmountBN,
        fiatAmountCents,
        fiatCurrency,
        bankDetails,
        description,
        receiptRequirements
      );

      const receipt = await tx.wait();
      
      // Parse the EscrowCreated event to get the request ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'EscrowCreated';
        } catch {
          return false;
        }
      });

      let requestId = '1'; // fallback
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        requestId = parsed?.args[0]?.toString();
      }

      return {
        success: true,
        requestId,
        contractAddress: this.contract.target,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Contract createEscrowRequest error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create escrow on blockchain'
      };
    }
  }

  async acceptEscrowRequest(contractAddress: string, requestId: string, payerAddress: string) {
    try {
      const tx = await this.contract.acceptEscrowRequest(requestId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Contract acceptEscrowRequest error:', error);
      return {
        success: false,
        error: error.message || 'Failed to accept escrow on blockchain'
      };
    }
  }

  async submitReceipt(contractAddress: string, requestId: string, receiptHash: string) {
    try {
      const tx = await this.contract.submitReceipt(requestId, receiptHash);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Contract submitReceipt error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit receipt on blockchain'
      };
    }
  }

  async verifyAndRelease(requestId: string, approved: boolean) {
    try {
      const tx = await this.contract.verifyAndRelease(requestId, approved);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Contract verifyAndRelease error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify and release on blockchain'
      };
    }
  }

  async raiseDispute(contractAddress: string, requestId: string) {
    try {
      const tx = await this.contract.raiseDispute(requestId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Contract raiseDispute error:', error);
      return {
        success: false,
        error: error.message || 'Failed to raise dispute on blockchain'
      };
    }
  }

  async cancelEscrowRequest(contractAddress: string, requestId: string) {
    try {
      const tx = await this.contract.cancelRequest(requestId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Contract cancelRequest error:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel escrow on blockchain'
      };
    }
  }

  async getEscrowRequest(requestId: string) {
    try {
      const result = await this.contract.getEscrowRequest(requestId);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error('Contract getEscrowRequest error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get escrow from blockchain'
      };
    }
  }

  async getReceiptRequirements(requestId: string) {
    try {
      const requirements = await this.contract.getReceiptRequirements(requestId);
      return {
        success: true,
        data: requirements
      };
    } catch (error: any) {
      console.error('Contract getReceiptRequirements error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get receipt requirements from blockchain'
      };
    }
  }
}

export const contractService = new ContractService(); 