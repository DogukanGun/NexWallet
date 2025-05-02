import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

// Simple BNB operations handler that uses Eliza directly
class BNBOperationsHandler {
    private walletAddress: string = '';
    private elizaService: any = null;
    
    async initialize() {
        try {
            // Load ElizaService directly to avoid path resolution issues
            const { ensureElizaRunning } = require(path.join(process.cwd(), 'eliza/startEliza.js'));
            this.elizaService = await ensureElizaRunning();
            console.log("BNB handler initialized with Eliza service");
            return true;
        } catch (error) {
            console.error("Failed to initialize Eliza service:", error);
            return false;
        }
    }
    
    setWalletAddress(address: string) {
        this.walletAddress = address;
        
        // If Eliza is initialized, set the BNB wallet
        if (this.elizaService) {
            try {
                // Get plugin manager
                const pluginManager = this.elizaService.getPluginManager();
                // Find the BNB Chain plugin
                const bnbPlugin = pluginManager.getPlugins().find((p: any) => p.id === 'bnb-chain-plugin');
                if (bnbPlugin) {
                    bnbPlugin.setExternalWallet(address);
                    console.log(`Set BNB wallet address to ${address}`);
                    return true;
                } else {
                    console.warn("BNB Chain plugin not found");
                    return false;
                }
            } catch (error) {
                console.error("Error setting wallet address:", error);
                return false;
            }
        }
        return false;
    }
    
    async getBalance(address?: string) {
        if (!this.elizaService) {
            const initialized = await this.initialize();
            if (!initialized) return 'Error: Failed to initialize service';
        }
        
        try {
            // Send command directly to the BNB plugin
            const result = await this.elizaService.sendMessage(`/bnb balance ${address || this.walletAddress}`, 'assistant');
            console.log('Raw BNB balance response:', result);
            
            // Extract the balance number from response
            const match = result.match(/balance is: (\d+(\.\d+)?)/);
            return match ? match[1] : result;
        } catch (error) {
            console.error('Error getting BNB balance:', error);
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
    
    // Add method to get plugins list
    async getPlugins() {
        if (!this.elizaService) {
            const initialized = await this.initialize();
            if (!initialized) return [];
        }
        
        try {
            const pluginManager = this.elizaService.getPluginManager();
            return pluginManager.getPlugins().map((p: any) => ({
                id: p.id,
                name: p.name,
                version: p.version
            }));
        } catch (error) {
            console.error('Error getting plugins:', error);
            return [];
        }
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    
    // This endpoint only accepts GET requests
    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
    
    const { command, address } = req.query;
    
    try {
        console.log(`BNB Test API called with command: ${command}, address: ${address}`);
        
        const bnbHandler = new BNBOperationsHandler();
        await bnbHandler.initialize();
        
        // Set a default wallet address
        const defaultAddress = '0x1234567890123456789012345678901234567890';
        bnbHandler.setWalletAddress(address as string || defaultAddress);
        
        switch (command) {
            case 'balance':
                const balance = await bnbHandler.getBalance(address as string);
                return res.status(200).json({ 
                    success: true, 
                    balance,
                    address: address || defaultAddress
                });
                
            case 'plugins':
                // Get list of loaded plugins
                const plugins = await bnbHandler.getPlugins();
                return res.status(200).json({
                    success: true,
                    plugins
                });
                
            default:
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid command. Supported commands: balance, plugins' 
                });
        }
    } catch (error) {
        console.error('Error processing BNB test request:', error);
        return res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
        });
    }
} 