import { ElizaService } from '../../eliza/ElizaService';
import { BNBChainPlugin } from '../../eliza/plugins/BNBChainPlugin';
import { SonicSVMPlugin } from '../../eliza/plugins/SonicSVMPlugin';

/**
 * Blockchain tools for the frontend agent that interface with Eliza's blockchain plugins
 */
export class BlockchainTools {
  private elizaService: ElizaService;
  private bnbPlugin: BNBChainPlugin | null = null;
  private sonicPlugin: SonicSVMPlugin | null = null;
  
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
      
      // Find and store references to the blockchain plugins
      if (pluginManager) {
        const plugins = pluginManager.getPlugins();
        
        for (const plugin of plugins) {
          if (plugin.id === 'bnb-chain-plugin') {
            this.bnbPlugin = plugin as BNBChainPlugin;
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
    if (this.bnbPlugin) {
      this.bnbPlugin.setExternalWallet(address);
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
    if (!this.bnbPlugin) {
      throw new Error('BNB Chain plugin not initialized');
    }
    
    try {
      return await this.bnbPlugin.getBalance(address || '');
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
    if (!this.bnbPlugin) {
      throw new Error('BNB Chain plugin not initialized');
    }
    
    try {
      return await this.bnbPlugin.getTokenInfo(tokenAddress);
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
    if (!this.bnbPlugin) {
      throw new Error('BNB Chain plugin not initialized');
    }
    
    try {
      return await this.bnbPlugin.sendTransaction({
        to,
        value: (amount * 1e18).toString(), // Convert BNB to wei
        data
      });
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