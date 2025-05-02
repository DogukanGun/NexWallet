import React, { useState, useEffect } from 'react';
import { Swap, SwapAmountInput, SwapToggleButton, SwapButton, SwapMessage, SwapToast } from '@coinbase/onchainkit/swap';
import type { Token } from '@coinbase/onchainkit/token';
import { useConfigStore } from '@/app/store/configStore';
import { ChainId } from '@/app/configurator/data';
import { useAppKitAccount } from "@reown/appkit/react";

// BNB Token definition
const BNBToken: Token = {
  address: "", // Native token
  chainId: 56,
  decimals: 18,
  name: "BNB",
  symbol: "BNB",
  image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
};

// BUSD Token definition
const BUSDToken: Token = {
  address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  chainId: 56,
  decimals: 18,
  name: "BUSD",
  symbol: "BUSD",
  image: "https://assets.coingecko.com/coins/images/9576/large/BUSD.png",
};

// CAKE Token definition
const CAKEToken: Token = {
  address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
  chainId: 56,
  decimals: 18,
  name: "PancakeSwap",
  symbol: "CAKE",
  image: "https://assets.coingecko.com/coins/images/12632/large/pancakeswap-cake-logo_%281%29.png",
};

export function BnbSwapWidget() {
  const { address, isConnected } = useAppKitAccount();
  const config = useConfigStore();
  
  // Create array of swappable tokens
  const swappableTokens = [BNBToken, BUSDToken, CAKEToken];

  // Check if BNB chain is configured
  const bnbConfigured = config.chains.some(chain => chain.id === ChainId.BNB);
  
  // If no wallet is connected or BNB chain isn't configured, show a message
  if (!isConnected || !address) {
    return <div className="p-4 bg-yellow-100 rounded-md">Please connect your wallet first.</div>;
  }
  
  if (!bnbConfigured) {
    return <div className="p-4 bg-yellow-100 rounded-md">Please configure BNB Chain in settings first.</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Swap Tokens on BNB Chain</h2>
      <Swap>
        <SwapAmountInput
          label="You Pay"
          token={BNBToken}
          type="from"
          swappableTokens={swappableTokens}
        />
        <SwapToggleButton />
        <SwapAmountInput
          label="You Receive"
          token={BUSDToken}
          type="to"
          swappableTokens={swappableTokens}
        />
        <SwapButton />
        <SwapMessage />
        <SwapToast />
      </Swap>
    </div>
  );
} 