import { ElizaService } from '../../eliza/ElizaService';
import { SonicSVMPlugin } from '../../eliza/plugins/SonicSVMPlugin';
import { bnbPlugin } from '../../eliza/plugins/custom/src/index';
import { SupportedChain } from '../../eliza/plugins/custom/src/types';
import { BNBWalletProvider } from '../../eliza/plugins/custom/src/providers/wallet';

/**
 * Blockchain tools for the frontend agent that interface with Eliza's blockchain plugins
 */
export class BlockchainTools {
  private elizaService: ElizaService;
  private bnbPlugin: typeof bnbPlugin | null = null;
  private sonicPlugin: SonicSVMPlugin | null = null;
  private walletAddress: string = '';
  private bnbWalletProvider: BNBWalletProvider | null = null;
  
  constructor(elizaService: ElizaService) {
    this.elizaService = elizaService;
    this.initializePlugins();
  }
  
  /**
   * Initialize the blockchain plugins
   */
  private async initializePlugins(): Promise<void> {
    try {
      // Get plugin manager from Eliza service
      const pluginManager = this.elizaService.getPluginManager();
      
      // Initialize our wallet provider
      this.bnbWalletProvider = new BNBWalletProvider();
      
      // Find and store references to the blockchain plugins
      if (pluginManager) {
        const plugins = pluginManager.getPlugins();
        
        for (const plugin of plugins) {
          if (plugin.name === 'bnb') {
            this.bnbPlugin = plugin as typeof bnbPlugin;
          } else if (plugin.id === 'sonic-svm-plugin') {
            this.sonicPlugin = plugin as SonicSVMPlugin;
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize blockchain plugins:', error);
    }
  }
  
  /**
   * Set the wallet address for BNB Chain operations
   * @param address The BNB wallet address
   */
  setBNBWallet(address: string): void {
    if (this.bnbPlugin && this.bnbWalletProvider) {
      // Store the wallet address for use in transactions
      this.walletAddress = address;
      
      // Configure environment variables for the custom plugin
      process.env.BNB_PUBLIC_KEY = address;
      
      console.log(`BNB Chain wallet address set: ${address}`);
      
      // Set the wallet provider public key
      (this.bnbWalletProvider as any).publicKey = address;
    } else {
      console.error('BNB Chain plugin not initialized');
    }
  }
  
  /**
   * Set the wallet public key for Solana operations
   * @param publicKey The Solana wallet public key
   */
  setSolanaWallet(publicKey: string): void {
    if (this.sonicPlugin) {
      this.sonicPlugin.setExternalWallet(publicKey);
    } else {
      console.error('Sonic SVM plugin not initialized');
    }
  }
  
  /**
   * Get BNB balance for an address
   * @param address The wallet address (optional - uses connected wallet if not provided)
   */
  async getBNBBalance(address?: string): Promise<string> {
    if (!this.bnbPlugin || !this.bnbWalletProvider) {
      throw new Error('BNB Chain plugin not initialized');
    }
    
    try {
      // Use the getBalance action from the custom plugin
      const getBalanceAction = this.bnbPlugin?.actions?.find(a => a.name === 'getBalance');
      if (!getBalanceAction) {
        throw new Error('getBalance action not found in BNB plugin');
      }
      
      // If no address provided, use the connected wallet
      const addressToUse = address || this.walletAddress;
      
      const params = {
        chain: 'bsc' as SupportedChain,
        address: addressToUse as any,
        token: 'BNB'
      };
      
      // Create a mock runtime that has the necessary functions
      const mockRuntime = {
        getSetting: (key: string) => {
          if (key === 'BNB_PUBLIC_KEY') return this.walletAddress;
          if (key === 'BNB_PRIVATE_KEY') return null;
          return null;
        }
      };
      
      const result = await getBalanceAction.handler(
        mockRuntime as any,
        { content: { text: `Get balance for ${addressToUse}` } } as any,
        {} as any,
        params
      );
      
      return result?.toString() || '0';
    } catch (error) {
      console.error('Error getting BNB balance:', error);
      throw error;
    }
  }
  
  /**
   * Get BNB token information
   * @param tokenAddress The token contract address
   */
  async getBNBTokenInfo(tokenAddress: string): Promise<Record<string, any>> {
    if (!this.bnbPlugin || !this.bnbWalletProvider) {
      throw new Error('BNB Chain plugin not initialized');
    }
    
    try {
      // Use the token info action from the custom plugin
      const tokenInfoAction = this.bnbPlugin?.actions?.find(a => a.name === 'getTokenInfo');
      if (!tokenInfoAction) {
        throw new Error('getTokenInfo action not found in BNB plugin');
      }
      
      // Create a mock runtime that has the necessary functions
      const mockRuntime = {
        getSetting: (key: string) => {
          if (key === 'BNB_PUBLIC_KEY') return this.walletAddress;
          if (key === 'BNB_PRIVATE_KEY') return null;
          return null;
        }
      };
      
      const result = await tokenInfoAction.handler(
        mockRuntime as any,
        { content: { text: `Get token info for ${tokenAddress}` } } as any,
        {} as any,
        { tokenAddress }
      );
      
      return result || {};
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }
  
  /**
   * Get Solana account information
   * @param accountAddress The Solana account address
   */
  async getSolanaAccountInfo(accountAddress: string): Promise<Record<string, any>> {
    if (!this.sonicPlugin) {
      throw new Error('Sonic SVM plugin not initialized');
    }
    
    try {
      return await this.sonicPlugin.getAccountInfo(accountAddress);
    } catch (error) {
      console.error('Error getting Solana account info:', error);
      throw error;
    }
  }
  
  /**
   * Send a BNB transaction
   * @param to Recipient address
   * @param amount Amount in BNB
   * @param data Optional data for the transaction
   */
  async sendBNBTransaction(to: string, amount: number, data?: string): Promise<string> {
    if (!this.bnbPlugin || !this.bnbWalletProvider) {
      throw new Error('BNB Chain plugin not initialized');
    }
    
    try {
      // Use the transfer action from the custom plugin
      const transferAction = this.bnbPlugin?.actions?.find(a => a.name === 'transfer');
      if (!transferAction) {
        throw new Error('transfer action not found in BNB plugin');
      }
      
      // Create params for the transfer
      const params = {
        chain: 'bsc' as SupportedChain,
        toAddress: to as any,
        amount: amount.toString(),
        token: 'BNB',
        data: data as any
      };
      
      // Create a mock runtime that has the necessary functions
      const mockRuntime = {
        getSetting: (key: string) => {
          if (key === 'BNB_PUBLIC_KEY') return this.walletAddress;
          if (key === 'BNB_PRIVATE_KEY') return null;
          return null;
        }
      };
      
      // If we have a wallet address, use it
      if (this.walletAddress) {
        process.env.BNB_PUBLIC_KEY = this.walletAddress;
      }
      
      console.log('Executing BNB transaction with params:', params);
      
      const result = await transferAction.handler(
        mockRuntime as any,
        { content: { text: `Transfer ${amount} BNB to ${to}${data ? ` with data ${data}` : ''}` } } as any,
        {} as any,
        params
      );
      
      // The result could be either a string or an object with txHash
      if (typeof result === 'string') {
        return result;
      } else if (result && typeof result === 'object' && 'txHash' in result) {
        return result.txHash as string;
      }
      
      return '';
    } catch (error) {
      console.error('Error sending BNB transaction:', error);
      throw error;
    }
  }
  
  /**
   * Simulate a Solana transaction
   * @param transaction The encoded transaction
   */
  async simulateSolanaTransaction(transaction: string): Promise<Record<string, any>> {
    if (!this.sonicPlugin) {
      throw new Error('Sonic SVM plugin not initialized');
    }
    
    try {
      return await this.sonicPlugin.simulateTransaction(transaction);
    } catch (error) {
      console.error('Error simulating Solana transaction:', error);
      throw error;
    }
  }
  
  /**
   * Send a Solana transaction
   * @param serializedTransaction The serialized transaction
   */
  async sendSolanaTransaction(serializedTransaction: string): Promise<string> {
    if (!this.sonicPlugin) {
      throw new Error('Sonic SVM plugin not initialized');
    }
    
    try {
      return await this.sonicPlugin.sendTransaction(serializedTransaction);
    } catch (error) {
      console.error('Error sending Solana transaction:', error);
      throw error;
    }
  }
}

export default BlockchainTools; 