import React, { FC, ReactElement, useEffect, useState } from 'react';
import { ArrowLeftRight, Wallet, CreditCard, Settings } from 'lucide-react';
import { useConfigStore } from '@/app/store/configStore';
import { AppChain, ChainId } from '@/app/configurator/data';
import Image from 'next/image';
import { useAppKitAccount } from '@reown/appkit/react';

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

const WalletRequiredModal = ({ onClose }: { onClose: () => void }) => {
  return React.createElement('div', { 
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' 
  },
    React.createElement('div', { 
      className: 'bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4' 
    },
      React.createElement('h3', { 
        className: 'text-xl font-bold text-white mb-4' 
      }, 'Wallet Connection Required'),
      React.createElement('p', { 
        className: 'text-gray-300 mb-6' 
      }, 'The chatbot needs to interact with your wallet. Please connect your wallet before saving changes.'),
      React.createElement('div', { 
        className: 'flex justify-end' 
      },
        React.createElement('button', {
          onClick: onClose,
          className: 'px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300'
        }, 'Got it')
      )
    )
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const ConfigurationComponent: FC<{}> = ({}) => {
  const store = useConfigStore();
  const [selectedChains, setSelectedChains] = useState<AppChain[]>(store.chains);
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>(store.knowledgeBase || []);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { allAccounts } = useAppKitAccount();

  const availableChains: AppChain[] = [
    {
      id: ChainId.SOLANA,
      name: "Solana",
      isEmbedded: false,
      disabled: false,
      icon: "/icons/solana.svg",
    },
    {
      id: ChainId.BASE,
      name: "Base",
      disabled: false,
      isEmbedded: true,
      icon: "/icons/base.svg",
    },
    {
      id: ChainId.ETHEREUM,
      name: "Ethereum",
      isEmbedded: true,
      disabled: false,
      icon: "/icons/ethereum.svg",
    },
    {
      id: ChainId.ARBITRUM,
      name: "Arbitrum",
      isEmbedded: true,
      disabled: false,
      icon: "/icons/arbitrum.svg",
    },
    {
      id: ChainId.OPTIMISM,
      name: "Optimism",
      disabled: false,
      isEmbedded: false,
      icon: "/icons/optimism.svg",
    }
  ];

  const availableKnowledgeBases = [
    {
      id: "cookieDao",
      name: "Cookie Dao",
      disabled: false,
    }
  ];

  const handleChainToggle = (chain: AppChain) => {
    setSelectedChains(prev => {
      const isSelected = prev.some(c => c.id === chain.id);
      if (isSelected) {
        return prev.filter(c => c.id !== chain.id);
      } else {
        return [...prev, chain];
      }
    });
  };

  const handleKnowledgeBaseToggle = (kbId: string) => {
    setSelectedKnowledgeBases(prev => {
      const isSelected = prev.includes(kbId);
      if (isSelected) {
        return prev.filter(id => id !== kbId);
      } else {
        return [...prev, kbId];
      }
    });
  };

  const handleSave = () => {
    // Check if an EVM wallet is required
    const requiresEvmWallet = selectedChains.some(chain => 
      [ChainId.ARBITRUM, ChainId.BASE, ChainId.ETHEREUM].includes(chain.id)
    );
    const hasEvmWallet = allAccounts.filter(account => account.namespace === "eip155").length > 0;
    
    // Check if Solana wallet is required
    const requiresSolanaWallet = selectedChains.some(chain => 
      [ChainId.SOLANA].includes(chain.id)
    );
    const hasSolanaWallet = allAccounts.filter(account => account.namespace === "solana").length > 0;

    // Show wallet modal if required wallets are not connected
    if ((requiresEvmWallet && !hasEvmWallet) || (requiresSolanaWallet && !hasSolanaWallet)) {
      setShowWalletModal(true);
      return;
    }

    // If all required wallets are connected, proceed with saving
    store.setConfig({
      chains: selectedChains,
      llmProvider: store.llmProvider,
      agentType: store.agentType,
      isPointSystemJoined: store.isPointSystemJoined
    });

    // Go back to the main tools page
  };

  return React.createElement('div', { className: 'p-6 space-y-8' },
    React.createElement('div', null,
      React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 'Chains'),
      React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
        availableChains.map(chain => 
          React.createElement('button', {
            key: chain.id,
            onClick: () => !chain.disabled && handleChainToggle(chain),
            className: `relative flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
              chain.disabled 
                ? 'opacity-50 cursor-not-allowed bg-gray-700'
                : selectedChains.some(c => c.id === chain.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`,
            disabled: chain.disabled
          },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement(Image, {
                src: chain.icon,
                alt: `${chain.name} icon`,
                width: 20,
                height: 20,
                className: 'w-5 h-5'
              }),
              React.createElement('span', { className: 'text-sm' }, chain.name)
            ),
            chain.disabled && React.createElement('span', {
              className: 'absolute -top-2 -right-2 bg-purple-500 text-xs px-2 py-1 rounded-full'
            }, 'Soon')
          )
        )
      )
    ),
    React.createElement('div', null,
      React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 'Knowledge Base'),
      React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
        availableKnowledgeBases.map(kb => 
          React.createElement('button', {
            key: kb.id,
            onClick: () => !kb.disabled && handleKnowledgeBaseToggle(kb.id),
            className: `relative flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
              kb.disabled 
                ? 'opacity-50 cursor-not-allowed bg-gray-700'
                : selectedKnowledgeBases.includes(kb.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`,
            disabled: kb.disabled
          },
            React.createElement('span', { className: 'text-sm' }, kb.name),
            kb.disabled && React.createElement('span', {
              className: 'absolute -top-2 -right-2 bg-purple-500 text-xs px-2 py-1 rounded-full'
            }, 'Soon')
          )
        )
      )
    ),
    React.createElement('button', {
      onClick: handleSave,
      className: 'w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200'
    }, 'Save Changes'),
    showWalletModal && React.createElement(WalletRequiredModal, {
      onClose: () => setShowWalletModal(false)
    })
  );
};

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  component: FC<unknown>;
  icon: ReactElement;
}

// Update tools registry with new Configuration component
export const tools: ToolConfig[] = [
  {
    id: 'config',
    name: 'Configuration',
    description: 'Modify your chain and knowledge base selections',
    component: ConfigurationComponent as FC<unknown>,
    icon: React.createElement(Settings, { className: "w-6 h-6" })
  },
  {
    id: 'bridge',
    name: 'Bridge',
    description: 'Bridge your tokens across different chains',
    component: BridgeComponent as FC<unknown>,
    icon: React.createElement(ArrowLeftRight, { className: "w-6 h-6" })
  },
  {
    id: 'swap',
    name: 'Swap',
    description: 'Swap your tokens',
    component: ComingSoonComponent as FC<unknown>,
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

export { ConfigurationComponent }; 