import Image from 'next/image';

type AppChain = {
  id: string;
  name: string;
  isEmbedded: boolean;
  disabled: boolean;
  icon: string;
  maintenanceMode?: boolean;
};

type ChainSelectionProps = {
  chains: AppChain[];
  selectedChains: AppChain[];
  activeFilter: string | null;
  isDropdownOpen: boolean;
  onChainSelect: (chainId: string) => void;
  onFilterToggle: () => void;
  onWalletTypeSelect: (isEmbedded: boolean) => void;
  buttonClass: string;
  selectedButtonClass: string;
  theme?: 'dark' | 'light';
};

export const ChainSelection = ({
  chains,
  selectedChains,
  activeFilter,
  isDropdownOpen,
  onChainSelect,
  onFilterToggle,
  onWalletTypeSelect,
  buttonClass,
  selectedButtonClass,
  theme = 'dark',
}: ChainSelectionProps) => {
  const isDark = theme === 'dark';
  
  return (
    <div className="flex flex-col space-y-4">
      <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-500'} text-left`}>Select Chains</h2>
      <div className="relative">
        <button
          onClick={onFilterToggle}
          className={`
            w-full px-4 py-3 rounded-lg transition-all duration-300 relative
            flex items-center justify-between
            ${activeFilter 
              ? 'bg-blue-500 text-white' 
              : isDark 
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
            }
          `}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Chain {activeFilter ? `(${activeFilter === 'embedded' ? 'Embedded' : 'Browser'})` : ''}
          </span>
          <span className="text-lg">{isDropdownOpen ? '▼' : '▲'}</span>
        </button>
        {isDropdownOpen && (
          <div className={`absolute w-full mt-2 ${isDark ? 'bg-white/10' : 'bg-white border border-blue-100'} rounded-lg overflow-hidden z-10`}>
            <button
              onClick={() => onWalletTypeSelect(true)}
              className={`w-full text-left px-4 py-3 ${isDark ? 'text-white hover:bg-white/20' : 'text-blue-500 hover:bg-blue-50'} transition-all duration-300`}
            >
              Embedded Wallet
            </button>
            <button
              onClick={() => onWalletTypeSelect(false)}
              className={`w-full text-left px-4 py-3 ${isDark ? 'text-white hover:bg-white/20' : 'text-blue-500 hover:bg-blue-50'} transition-all duration-300`}
            >
              Browser Wallet
            </button>
          </div>
        )}
      </div>
      <div className={isDark ? '' : 'bg-white border border-blue-100 p-4 rounded-lg'}>
        <div className="grid grid-cols-2 gap-4 min-h-[160px]">
          {chains
            .filter(chain => {
              if (activeFilter === "embedded") return chain.isEmbedded;
              if (activeFilter === "browser") return !chain.isEmbedded;
              return true;
            })
            .map((chain) => (
              <button
                key={chain.id}
                onClick={() => !chain.disabled && onChainSelect(chain.id)}
                className={`
                  ${chain.disabled
                    ? isDark 
                      ? "opacity-40 cursor-not-allowed bg-gray-800 text-gray-500 border border-gray-700" 
                      : "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200"
                    : selectedChains.some(selectedChain => selectedChain.id === chain.id)
                      ? selectedButtonClass
                      : buttonClass
                  }
                  relative p-4 transition-all duration-200
                `}
                disabled={chain.disabled}
              >
                <div className={`flex items-center justify-center gap-2`}>
                  <Image
                    src={chain.icon}
                    alt={`${chain.name} icon`}
                    width={20}
                    height={20}
                    className={`w-5 h-5 ${chain.disabled ? 'grayscale' : ''}`}
                  />
                  <span className="text-sm font-medium">{chain.name}</span>
                </div>
                {chain.disabled && (
                  <span className={`absolute -top-2 -right-2 text-xs px-2 py-1 rounded-full text-white
                    ${chain.maintenanceMode ? 'bg-orange-500' : 'bg-purple-500'}`}
                  >
                    {chain.maintenanceMode ? 'Maintenance' : 'Coming Soon'}
                  </span>
                )}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};