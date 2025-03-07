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
    const config = {
      v: "1",
      element: "debridgeWidget",
      title: "",
      description: "",
      width: "100%",
      height: "100%",
      supportedChains: JSON.stringify({
        inputChains: {
          "1": "all",
          "10": "all",
          "56": "all",
          "100": "all",
          "137": "all",
          "146": "all",
          "250": "all",
          "388": "all",
          "998": "all",
          "1088": "all",
          "1514": "all",
          "2741": "all",
          "4158": "all",
          "7171": "all",
          "8453": "all",
          "42161": "all",
          "43114": "all",
          "59144": "all",
          "80094": "all",
          "7565164": "all",
          "245022934": "all"
        },
        outputChains: {
          "1": "all",
          "10": "all",
          "56": "all",
          "100": "all",
          "137": "all",
          "146": "all",
          "250": "all",
          "388": "all",
          "998": "all",
          "999": "all",
          "1088": "all",
          "1514": "all",
          "2741": "all",
          "4158": "all",
          "7171": "all",
          "8453": "all",
          "42161": "all",
          "43114": "all",
          "59144": "all",
          "80094": "all",
          "7565164": "all",
          "245022934": "all"
        }
      }),
      inputChain: 56,
      outputChain: 1,
      showSwapTransfer: true,
      mode: "deswap",
      theme: "dark"
    };

    // Wait for script to be fully loaded before initializing
    const initWidget = () => {
      const existingWidget = document.getElementById('debridgeWidget');
      if (existingWidget) {
        existingWidget.innerHTML = '';
      }
      if (window.deBridge) {
        window.deBridge.widget(config);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://app.debridge.finance/assets/scripts/widget.js';
    script.async = true;
    script.onload = initWidget;

    document.body.appendChild(script);

    return () => {
      const widget = document.getElementById('debridgeWidget');
      if (widget) {
        widget.innerHTML = '';
      }
      document.body.removeChild(script);
    };
  }, []);

  return React.createElement('div', {
    id: 'debridgeWidget',
    className: 'w-full h-full absolute inset-0'
  });
};

const SwapComponent: FC = () => {
  return (
    React.createElement('div', {
      className: 'w-full h-full'
    },
      React.createElement("")
    )
  );
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
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  component: FC<{}>; // Keep as FC<{}> and ignore the linting error
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