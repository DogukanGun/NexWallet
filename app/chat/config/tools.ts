import React, { FC, ReactElement, useEffect } from 'react';
import { ArrowLeftRight, Wallet, CreditCard } from 'lucide-react';

// Add deBridge widget configuration type
interface DeBridgeConfig {
  v: string;
  element: string;
  width: string;
  height: string;
  supportedChains: string;
  inputChain: number;
  outputChain: number;
  showSwapTransfer: boolean;
  mode: string;
  theme: string;
}

// Create Bridge component
const BridgeComponent: FC = () => {
  useEffect(() => {
    const config: DeBridgeConfig = {
      v: "1",
      element: "debridgeWidget",
      width: "100%", 
      height: "600",
      supportedChains: JSON.stringify({
        inputChains: {
          "1": "all",
          "137": "all", 
          "8453": "all",
          "7565164": "all"
        },
        outputChains: {
          "1": "all",
          "137": "all",
          "8453": "all", 
          "7565164": "all"
        }
      }),
      inputChain: 7565164,
      outputChain: 8453,
      showSwapTransfer: true,
      mode: "deswap",
      theme: "dark"
    };

    if (typeof window !== 'undefined' && !window.deBridge) {
      const script = document.createElement('script');
      script.src = '/static/scripts/deBridgeWallet.js';
      script.async = true;
      script.onload = () => {
        window.deBridge?.widget(config);
      };
      document.body.appendChild(script);
    } else {
      window.deBridge?.widget(config);
    }
  }, []);

  return React.createElement('div', { id: 'debridgeWidget' });
};

const ComingSoonComponent: FC = () => {
  return React.createElement('div', { 
    className: 'flex items-center justify-center h-full text-gray-400 text-lg'
  }, 'Coming Soon');
};

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  component: FC<{}>;
  icon: ReactElement;
}

// Update tools registry with new Bridge component
export const tools: ToolConfig[] = [
  {
    id: 'bridge',
    name: 'Bridge',
    description: 'Bridge your tokens across different chains',
    component: BridgeComponent,
    icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" })
  },
  {
    id: 'swap',
    name: 'Swap',
    description: 'Swap your tokens',
    component: ComingSoonComponent,
    icon: React.createElement(Wallet, { className: "w-6 h-6" })
  },
  {
    id: 'buy',
    name: 'Buy Crypto',
    description: 'Buy cryptocurrency with fiat',
    component: ComingSoonComponent,
    icon: React.createElement(CreditCard, { className: "w-6 h-6" })
  }
];

// Add deBridge types to global Window interface
declare global {
  interface Window {
    deBridge?: {
      widget: (config: DeBridgeConfig) => void;
    }
  }
} 