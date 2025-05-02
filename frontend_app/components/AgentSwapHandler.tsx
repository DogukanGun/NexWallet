import React, { useEffect, useState } from 'react';
import { BnbSwapWidget } from './BnbSwapWidget';
import { useConfigStore } from '@/app/store/configStore';
import { ChainId } from '@/app/configurator/data';
import { useAppKitAccount } from "@reown/appkit/react";
import WalletButton from "../app/components/WalletButton";

interface AgentSwapHandlerProps {
  query: string;
}

export function AgentSwapHandler({ query }: AgentSwapHandlerProps) {
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);
  const config = useConfigStore();
  const { isConnected } = useAppKitAccount();
  
  useEffect(() => {
    if (!query) return;
    
    const lowerQuery = query.toLowerCase();
    
    // Detect which chain the user might want to use for swapping
    const chainMentions = {
      [ChainId.BNB]: ['bnb', 'binance', 'bsc', 'bnb chain', 'binance smart chain'],
      [ChainId.BASE]: ['base', 'base chain', 'coinbase base'],
      [ChainId.ETHEREUM]: ['eth', 'ethereum', 'mainnet'],
      [ChainId.SOLANA]: ['sol', 'solana'],
      [ChainId.POLYGON]: ['polygon', 'matic'],
    };
    
    // Check which chains are configured and mentioned
    const availableChains = config.chains.map(chain => chain.id);
    
    // Default to first available chain if none specified
    let detectedChain: ChainId | null = availableChains.length > 0 ? availableChains[0] : null;
    
    // Try to detect if user mentioned a specific chain
    for (const [chainId, keywords] of Object.entries(chainMentions)) {
      if (availableChains.includes(chainId as ChainId) && 
          keywords.some(keyword => lowerQuery.includes(keyword))) {
        detectedChain = chainId as ChainId;
        break;
      }
    }
    
    setSelectedChain(detectedChain);
  }, [query, config.chains]);
  
  // If wallet is not connected, show wallet connection prompt
  if (!isConnected) {
    return (
      <div className="mt-4 p-6 bg-gray-800 text-white rounded-lg border border-gray-700 shadow-lg">
        <h3 className="text-xl font-bold mb-3">Connect Your Wallet to Swap</h3>
        <p className="mb-4">To swap tokens, you'll need to connect your crypto wallet first.</p>
        <div className="flex justify-center">
          <WalletButton 
            className="bg-gradient-to-r from-indigo-500 to-violet-600 
                      hover:from-indigo-600 hover:to-violet-700 text-white rounded-lg py-3 px-6
                      font-medium transition-all duration-300 shadow-lg"
          />
        </div>
      </div>
    );
  }
  
  if (!selectedChain) {
    return (
      <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg border border-gray-700">
        <p>No supported chain configured for swapping. Please configure a chain in settings.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      {selectedChain === ChainId.BNB && (
        <BnbSwapWidget />
      )}
      {selectedChain !== ChainId.BNB && (
        <div className="p-4 bg-gray-800 text-white rounded-lg border border-gray-700">
          <p>Swap interface for the selected chain is not implemented yet.</p>
          <p>Currently, only BNB Chain swaps are supported.</p>
        </div>
      )}
    </div>
  );
} 