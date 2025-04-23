import { ElizaPlugin } from './PluginInterface';
import { ElizaService } from '../ElizaService';
import axios from 'axios';

// Wallet connection interface for Ethereum-compatible chains
interface EthWalletConnection {
  connect(): Promise<string[]>; // Returns accounts
  disconnect(): Promise<void>;
  request(args: { method: string; params?: any[] }): Promise<any>;
  selectedAddress: string | null;
  chainId: string | null;
  isConnected: boolean;
}

// Transaction data interface
interface BNBTransactionData {
  to: string;
  value?: string;
  data?: string;
}

/**
 * BNB Chain Plugin for Eliza
 * Integrates with the BNB Chain ecosystem for blockchain interactions
 */
export class BNBChainPlugin implements ElizaPlugin {
  id = 'bnb-chain-plugin';
  name = 'BNB Chain';
  version = '1.0.0';
  description = 'Integrates with BNB Chain - Ethereum-compatible blockchain';
  
  private elizaService: ElizaService | null = null;
  private rpcUrl: string = 'https://bsc-dataseed.binance.org/'; // BNB Chain RPC URL
  private isConnected: boolean = false;
  private chainId: number = 56; // BNB Smart Chain Mainnet
  private connectedWallet: EthWalletConnection | null = null;
  
  /**
   * Initialize the plugin
   * @param elizaService The Eliza service
   */
  async initialize(elizaService: ElizaService): Promise<void> {
    this.elizaService = elizaService;
    console.log('BNB Chain plugin initialized');
    
    // Try to establish connection to the blockchain RPC
    try {
      await this.connect();
    } catch (error) {
      console.error('Failed to connect to BNB Chain:', error);
    }
  }

  /**
   * Connect to the BNB Chain network
   */
  private async connect(): Promise<void> {
    try {
      // In a real implementation, this would verify connection to the BNB Chain
      // For demo purposes, we're just simulating success
      
      // const response = await axios.post(this.rpcUrl, {
      //   jsonrpc: '2.0',
      //   id: 1,
      //   method: 'eth_chainId',
      //   params: []
      // });
      // this.isConnected = response.data.result && parseInt(response.data.result, 16) === this.chainId;
      
      this.isConnected = true;
      console.log('Connected to BNB Chain');
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Connect to a wallet (MetaMask, Trust Wallet, etc.)
   * @returns The wallet's selected address
   */
  async connectWallet(): Promise<string> {
    // In a real implementation, detect available wallets and connect
    // For now, we're simulating a successful connection
    try {
      // Check if window.ethereum exists
      // const ethereum = window.ethereum;
      
      // if (!ethereum) {
      //   throw new Error('No Ethereum wallet found. Please install MetaMask or Trust Wallet.');
      // }
      
      // const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      // this.connectedWallet = ethereum;
      
      // Check if we need to switch to BNB Chain
      // const currentChainId = await ethereum.request({ method: 'eth_chainId' });
      // if (parseInt(currentChainId, 16) !== this.chainId) {
      //   try {
      //     // Try to switch to BNB Chain
      //     await ethereum.request({
      //       method: 'wallet_switchEthereumChain',
      //       params: [{ chainId: `0x${this.chainId.toString(16)}` }],
      //     });
      //   } catch (switchError) {
      //     // If chain hasn't been added, suggest adding it
      //     await ethereum.request({
      //       method: 'wallet_addEthereumChain',
      //       params: [{
      //         chainId: `0x${this.chainId.toString(16)}`,
      //         chainName: 'BNB Smart Chain',
      //         nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      //         rpcUrls: ['https://bsc-dataseed.binance.org/'],
      //         blockExplorerUrls: ['https://bscscan.com'],
      //       }],
      //     });
      //   }
      // }
      
      // return accounts[0];
      
      // Mock implementation for demo
      this.connectedWallet = {
        connect: async () => ['0xYourBNBAddressHere1234567890'],
        disconnect: async () => {},
        request: async (args) => {
          if (args.method === 'eth_sendTransaction') {
            return '0xMockTransactionHash';
          }
          return null;
        },
        selectedAddress: '0xYourBNBAddressHere1234567890',
        chainId: '0x38', // BNB Chain (56 in hex)
        isConnected: true
      };
      
      return this.connectedWallet.selectedAddress || '';
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Use the NexWallet's connected wallet instead of a direct connection
   * @param walletAddress The connected wallet address
   */
  setExternalWallet(walletAddress: string): void {
    this.connectedWallet = {
      connect: async () => [walletAddress],
      disconnect: async () => {},
      request: async (args) => {
        if (args.method === 'eth_sendTransaction') {
          // In a real implementation, this would forward the request to the frontend_agent
          // to handle the transaction with the connected wallet
          console.log('Transaction request received:', args);
          return '0xTransactionFromExternalWallet';
        }
        return null;
      },
      selectedAddress: walletAddress,
      chainId: '0x38', // BNB Chain (56 in hex)
      isConnected: true
    };
    
    console.log(`Using external wallet: ${walletAddress}`);
  }

  /**
   * Disconnect the currently connected wallet
   */
  async disconnectWallet(): Promise<void> {
    if (this.connectedWallet) {
      // Most wallets don't have a standard disconnect method
      // Usually, it's handled by the wallet UI
      await this.connectedWallet.disconnect();
      this.connectedWallet = null;
      console.log('Wallet disconnected');
    }
  }

  /**
   * Get BNB account balance
   * @param address The wallet address
   */
  async getBalance(address: string): Promise<string> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Mock implementation - in a real plugin, this would call the actual RPC
      // const response = await axios.post(this.rpcUrl, {
      //   jsonrpc: '2.0',
      //   id: 1,
      //   method: 'eth_getBalance',
      //   params: [address, 'latest']
      // });
      // const balanceInWei = parseInt(response.data.result, 16);
      // return (balanceInWei / 1e18).toString(); // Convert from wei to BNB
      
      // Return mock balance
      return '10.5';
    } catch (error) {
      console.error(`Error fetching balance for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get BNB token information
   * @param tokenAddress The token contract address
   */
  async getTokenInfo(tokenAddress: string): Promise<Record<string, any>> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Mock implementation - in a real plugin, this would call the actual contract
      return {
        name: 'Example Token',
        symbol: 'EXT',
        decimals: 18,
        totalSupply: '1000000000000000000000000',
        address: tokenAddress
      };
    } catch (error) {
      console.error(`Error fetching token info for ${tokenAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction by hash
   * @param txHash The transaction hash
   */
  async getTransaction(txHash: string): Promise<Record<string, any>> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Mock implementation - in a real plugin, this would call the actual RPC
      return {
        hash: txHash,
        blockNumber: '12345678',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        value: '1000000000000000000', // 1 BNB
        gas: '21000',
        gasPrice: '5000000000',
        status: 'confirmed'
      };
    } catch (error) {
      console.error(`Error fetching transaction ${txHash}:`, error);
      throw error;
    }
  }

  /**
   * Send a transaction using the connected wallet
   * @param txData Transaction data (to, value, data)
   */
  async sendTransaction(txData: BNBTransactionData): Promise<string> {
    if (!this.connectedWallet) {
      throw new Error('No wallet connected. Please connect a wallet first using "/bnb connect".');
    }

    try {
      // In a real implementation:
      // Convert values to hex if needed
      const transactionParams = {
        from: this.connectedWallet.selectedAddress,
        to: txData.to,
        value: txData.value ? `0x${parseInt(txData.value).toString(16)}` : '0x0',
        data: txData.data || '0x',
        chainId: this.chainId
      };

      // Send transaction through the wallet
      const txHash = await this.connectedWallet.request({
        method: 'eth_sendTransaction',
        params: [transactionParams]
      });
      
      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Pre-process user message
   * @param message User message
   * @param character Character name
   */
  async preProcessMessage(message: string, character: string): Promise<string> {
    // Check if the message contains BNB Chain-related commands
    const bnbCommandRegex = /^\/bnb\s+(balance|token|tx|connect|disconnect|send|use)\s*(.*)$/i;
    const match = message.match(bnbCommandRegex);
    
    if (match) {
      const command = match[1].toLowerCase();
      const params = match[2].trim();
      
      try {
        switch (command) {
          case 'connect':
            // Connect to wallet
            const address = await this.connectWallet();
            return `Connected to BNB Chain wallet: ${address}`;
            
          case 'disconnect':
            // Disconnect wallet
            await this.disconnectWallet();
            return 'Disconnected from BNB Chain wallet';
            
          case 'use':
            // Use an externally connected wallet (NexWallet)
            if (!params) return 'Please provide a wallet address';
            this.setExternalWallet(params);
            return `Using NexWallet wallet: ${params}`;
            
          case 'balance':
            // Get account balance
            if (!params) {
              // If no address provided and wallet connected, use connected wallet
              if (this.connectedWallet && this.connectedWallet.selectedAddress) {
                const balance = await this.getBalance(this.connectedWallet.selectedAddress);
                return `Your BNB balance is: ${balance} BNB`;
              } else {
                return 'Please provide a wallet address or connect a wallet first';
              }
            }
            const balance = await this.getBalance(params);
            return `The BNB balance for address ${params} is: ${balance} BNB`;
            
          case 'token':
            // Get token info
            if (!params) return 'Please provide a token address';
            const tokenInfo = await this.getTokenInfo(params);
            return `Token information for ${params}:\n\`\`\`json\n${JSON.stringify(tokenInfo, null, 2)}\n\`\`\``;
            
          case 'tx':
            // Get transaction details
            if (!params) return 'Please provide a transaction hash';
            const txInfo = await this.getTransaction(params);
            return `Transaction details for ${params}:\n\`\`\`json\n${JSON.stringify(txInfo, null, 2)}\n\`\`\``;
            
          case 'send':
            // Send a transaction
            if (!params) return 'Please provide transaction details in format: to_address,value_in_bnb,data(optional)';
            
            const txParts = params.split(',');
            if (txParts.length < 2) {
              return 'Invalid transaction format. Use: to_address,value_in_bnb,data(optional)';
            }
            
            const txData: BNBTransactionData = {
              to: txParts[0].trim(),
              value: (parseFloat(txParts[1].trim()) * 1e18).toString() // Convert BNB to wei
            };
            
            if (txParts.length > 2) {
              txData.data = txParts[2].trim();
            }
            
            const txHash = await this.sendTransaction(txData);
            return `Transaction sent successfully! Transaction hash: ${txHash}`;
            
          default:
            return `Unknown BNB Chain command: ${command}`;
        }
      } catch (error) {
        return `Error processing BNB Chain command: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    
    // If it's not a BNB command, return the original message
    return message;
  }

  /**
   * Post-process response from the model
   * @param response Model response
   * @param character Character name
   */
  async postProcessResponse(response: string, character: string): Promise<string> {
    // For this plugin, we don't modify the response
    return response;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Disconnect wallet if connected
    if (this.connectedWallet) {
      await this.disconnectWallet();
    }
    
    this.isConnected = false;
    console.log('BNB Chain plugin cleaned up');
  }
}

export default BNBChainPlugin; 