"use client";

import { useState, useEffect, useRef } from "react";
import { buttonClass, selectedButtonClass } from "../components/ButtonClass";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useConfigStore } from '../store/configStore';
import PaymentRequiredModal from "../components/PaymentRequiredModal";
import { apiService } from "../services/ApiService";
import { useAppKitAccount } from "@reown/appkit/react";
import { updateLocalToken } from "@/lib/jwt";
import Accordion from "../components/Accordion";
import { WarningModal } from "./components/WarningMode";
import TelegramNoticeModal from '../components/TelegramNoticeModal';
import RoadmapModal from '../components/RoadmapModal';
import { AppChain, ChainId, KnowledgeBase } from "./data";


const knowledgeBases: KnowledgeBase[] = [
  {
    id: "cookieDao",
    name: "Cookie Dao",
    disabled: false,
  }
];

const chains: AppChain[] = [
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
  },
  {
    id: ChainId.STARKNET,
    name: "StarkNet",
    disabled: true,
    isEmbedded: false,
    icon: "/icons/starknet.svg",
  },
  {
    id: ChainId.POLYGON,
    name: "Polygon",
    disabled: true,
    isEmbedded: false,
    icon: "/icons/polygon.svg",
  }

];

const llmProviders = [
  {
    id: "openai", name: "OpenAI"
  },
  {
    id: "llama_onchain", name: "Llama 3.1 Onchain - Powered by Gaia"
  },
  {
    id: "claude", disabled: true,
    name: "Claude"
  },
  {
    id: "llama", disabled: true,
    name: "Llama 3.1"
  },
];

const agentTypes = [
  { id: "voice", name: "Voice Agent", disabled: false },
  { id: "text", name: "Text Agent", disabled: false },
];

const primaryButtonClass =
  "px-4 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition duration-300";

const totalSteps = 5; // Update total steps to include the new step

export default function Home() {
  const router = useRouter();
  const [selectedChains, setSelectedChains] = useState<typeof chains[number][]>([]);
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<typeof knowledgeBases[number][]>([]);
  const [selectedLLM, setSelectedLLM] = useState<string>("");
  const [selectedAgentType, setSelectedAgentType] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const { address, isConnected } = useAppKitAccount();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>("apiKeys");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showTelegramNotice, setShowTelegramNotice] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleChainSelection = (chainId: string) => {
    const selectedChain = chains.find(chain => chain.id === chainId);
    setSelectedChains((prev) =>
      prev.some(chain => chain.id === selectedChain!.id) ? prev.filter((chain) => chain.id !== chainId) : [...prev, selectedChain!],
    );
  };

  const handleLLMSelection = (llmId: string) => {
    if (selectedChains.length === 0) {
      setShowWarningModal(true);
      return;
    }

    const selectedProvider = llmProviders.find(provider => provider.id === llmId);
    if (selectedProvider?.disabled) {
      return;
    }

    const isSolanaSelected = selectedChains.some(chain => chain.id === "solana");
    const isBaseSelected = selectedChains.some(chain => chain.id === "base");
    const isEthereumSelected = selectedChains.some(chain => chain.id === "ethereum");

    if (isSolanaSelected && llmId === "llama_onchain") {
      return;
    }

    if ((isBaseSelected || isEthereumSelected) && llmId === "claude") {
      return;
    }

    if (llmId === 'claude' || llmId === 'openai') {
      setSelectedProvider(llmId === 'claude' ? 'Claude' : 'OpenAI');
      setShowPaymentModal(true);
    }
    setSelectedLLM((prev) => (prev === llmId ? "" : llmId));
  };

  const handleAgentTypeSelection = (typeId: string) => {
    const selectedType = agentTypes.find(type => type.id === typeId);
    if (selectedType?.disabled) {
      return; // Prevent selection if the agent type is disabled
    }

    // Check if a chain other than Solana is selected
    const isVoiceAgent = typeId === "voice";
    const isSolanaSelected = selectedChains.some(chain => chain.id === "solana");

    if (isVoiceAgent && !isSolanaSelected) {
      return; // Prevent selection of voice agent if Solana is not selected
    }

    setSelectedAgentType((prev) => (prev === typeId ? "" : typeId));
  };

  const handleConnectionSelection = (connectionType: string) => {
    setSelectedConnectionType(connectionType);
  };

  const handleStart = async () => {
    // Save selections into the store
    const config = {
      chains: selectedChains,
      llmProvider: selectedLLM,
      agentType: selectedAgentType,
      isPointSystemJoined: selectedConnectionType === "join",
    };

    useConfigStore.getState().setConfig(config);

    const hasUserWallet = useConfigStore.getState().chains.some(chain => !chain.isEmbedded);

    if (!isConnected && hasUserWallet) {
      setShowWalletModal(true);
      return;
    }

    const res = await apiService.updateToken(hasUserWallet ? address! : "");
    updateLocalToken(res.token);

    if (selectedAgentType === "voice") {
      router.push("/voice");
    } else if (selectedAgentType === "text") {
      router.push("/chat");
    }
  };


  const cardContainerClass = "grid grid-cols-2 gap-2 min-h-[160px]";
  const cardClass = "h-[40px] flex items-center justify-center w-full relative";
  const buttonContentClass =
    "absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-[120px]";
  const iconClass = "w-4 h-4 mr-2";
  const buttonTextClass = "text-xs";

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return selectedChains.length > 0;
      case 2:
        return true;
      case 3:
        return selectedLLM !== "";
      case 4:
        return selectedAgentType !== "";
      default:
        return false;
    }
  };

  const isConnectionStepValid = () => {
    return selectedConnectionType !== "";
  };

  const getConnectionErrorMessage = () => {
    return "Please select a connection type";
  };

  const WalletRequiredModal = ({ onClose }: { onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-white mb-4">Wallet Connection Required</h3>
          <p className="text-gray-300 mb-6">
            The chatbot needs to interact with your wallet. Please connect your wallet before starting.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleWalletTypeSelection = (isEmbedded: boolean) => {
    const filterType = isEmbedded ? "embedded" : "browser";
    if (activeFilter === filterType) {
      setActiveFilter(null);
      setSelectedChains([]);
    } else {
      setActiveFilter(filterType);
    }
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  const handleTwitterLogin = () => {
    // Implement Twitter OAuth flow here
    console.log("Initiating X login");
    // This would typically redirect to your OAuth endpoint
    setShowLoginModal(false);
  }

  const TwitterLoginModal = ({ onClose }: { onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Connect with X</h3>
          <p className="text-gray-300 mb-6">
            Connect your X account to save your agent configurations and access additional features.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleTwitterLogin}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-all duration-300 border border-gray-700"
            >
              <span>Login with</span>
              <Image 
                src="/icons/x.png" 
                alt="X" 
                width={20} 
                height={20}
                className="w-5 h-5"
              />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b bg-black text-white page-with-navbar pb-20 overflow-x-hidden">
      {showPaymentModal && (
        <PaymentRequiredModal
          provider={selectedProvider}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
      {showWalletModal && (
        <WalletRequiredModal
          onClose={() => setShowWalletModal(false)}
        />
      )}
      {showWarningModal && (
        <WarningModal onClose={() => setShowWarningModal(false)} />
      )}

      <div className="w-full min-h-screen bg-black rounded-none p-4 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-2">
            NexAI Wallet Configurator
          </h1>
          
          {/* X Login Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-gray-700/20 border border-gray-700"
            >
              <span>Login with</span>
              <Image 
                src="/icons/x.png" 
                alt="X" 
                width={20} 
                height={20}
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <Accordion
            title="1. Select Chains"
            isOpen={openSection === 1}
            onToggle={() => setOpenSection(openSection === 1 ? null : 1)}
            isValid={isStepValid(1)}
          >
            <div className="flex flex-col space-y-4">
              <h2 className="text-xl font-bold text-white text-left">Select Chains</h2>
              <div className="">
                <button
                  onClick={toggleDropdown}
                  className={`${buttonClass} mb-4 flex items-center ${activeFilter ? 'bg-blue-500 text-black' : 'bg-gray-200 text-black'} w-full justify-between px-3`}
                >
                  Filter Chain {activeFilter ? `(${activeFilter === 'embedded' ? 'Embedded' : 'Browser'})` : ''}
                  {activeFilter && <span className="ml-2">✔️</span>}
                  <span>{isDropdownOpen ? '▼' : '▲'}</span>
                </button>
                {isDropdownOpen && (
                  <div ref={dropdownRef} className="absolute bg-white shadow-lg rounded-md mt-2">
                    <div
                      onClick={() => handleWalletTypeSelection(true)}
                      className={`w-full text-left px-4 py-2 text-black hover:bg-gray-200 cursor-pointer`}
                    >
                      Embedded Wallet
                    </div>
                    <div
                      onClick={() => handleWalletTypeSelection(false)}
                      className={`w-full text-left px-4 py-2 text-black hover:bg-gray-200 cursor-pointer`}
                    >
                      Browser Wallet
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className={cardContainerClass}>
                  {chains
                    .filter(chain => {
                      if (activeFilter === "embedded") return chain.isEmbedded;
                      if (activeFilter === "browser") return !chain.isEmbedded;
                      return true; // Show all if no filter is active
                    })
                    .map((chain) => (
                      <button
                        key={chain.id}
                        onClick={() => !chain.disabled && handleChainSelection(chain.id)}
                        className={`
                          ${chain.disabled
                            ? "opacity-50 cursor-not-allowed"
                            : selectedChains.some(selectedChain => selectedChain.id === chain.id)
                              ? selectedButtonClass
                              : buttonClass
                          }
                          ${cardClass}
                        `}
                        disabled={chain.disabled}
                      >
                        <div className={buttonContentClass}>
                          <Image
                            src={chain.icon}
                            alt={`${chain.name} icon`}
                            width={20}
                            height={20}
                            className={iconClass}
                          />
                          <span className={buttonTextClass}>{chain.name}</span>
                        </div>
                        {chain.disabled && (
                          <span className="absolute -top-2 -right-2 bg-purple-500 text-xs px-2 py-1 rounded-full text-white">
                            Coming Soon
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </Accordion>

          <Accordion
            title="2. Knowledge Bases"
            isOpen={openSection === 2}
            onToggle={() => setOpenSection(openSection === 2 ? null : 2)}
            isValid={isStepValid(2)}
          >
            <div>
              <h2 className="text-xl font-bold mb-4 text-white text-left">Knowledge Bases</h2>
              <div className={cardContainerClass}>
                {knowledgeBases.map((kb) => (
                  <button
                    key={kb.id}
                    onClick={() => {
                      const knowledgeBase = knowledgeBases.find(k => k.id === kb.id);
                      setSelectedKnowledgeBases((prev) =>
                        prev.some(kb => kb.id === knowledgeBase!.id)
                          ? prev.filter(kb => kb.id !== knowledgeBase!.id)
                          : knowledgeBase ? [...prev, knowledgeBase] : prev
                      );
                    }}
                    className={`
                      ${selectedKnowledgeBases.some(selectedKb => selectedKb.id === kb.id) ? selectedButtonClass : buttonClass}
                      ${cardClass}
                    `}
                  >
                    <span className={buttonTextClass}>
                      {kb.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Accordion>

          <Accordion
            title="3. Select LLM Provider"
            isOpen={openSection === 3}
            onToggle={() => {
              if (selectedChains.length === 0) {
                setShowWarningModal(true);
              } else {
                setOpenSection(openSection === 3 ? null : 3);
              }
            }}
            isValid={isStepValid(3)}
          >
            <div>
              <h2 className="text-xl font-bold mb-4 text-white text-left">Select LLM Provider</h2>
              <div className={cardContainerClass}>
                {llmProviders.map((provider) => {
                  const isDisabled = (provider.id === "llama_onchain" && selectedChains.some(chain => chain.id === "solana")) ||
                                     (provider.id === "claude" && (selectedChains.some(chain => chain.id === "base") || selectedChains.some(chain => chain.id === "ethereum"))) ||
                                     (selectedChains.length === 0); // Disable if no chains are selected

                  return (
                    <button
                      key={provider.id}
                      onClick={() => handleLLMSelection(provider.id)}
                      className={`
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : selectedLLM === provider.id ? selectedButtonClass : buttonClass}
                        ${cardClass}
                      `}
                      disabled={isDisabled}
                    >
                      <div className={buttonContentClass}>
                        <span className={buttonTextClass}>{provider.name}</span>
                      </div>
                      {provider.disabled && (
                        <span className="absolute -top-2 -right-2 bg-purple-500 text-xs px-2 py-1 rounded-full text-white">
                          Coming Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Accordion>

          <Accordion
            title="4. Select Agent Type"
            isOpen={openSection === 4}
            onToggle={() => setOpenSection(openSection === 4 ? null : 4)}
            isValid={isStepValid(4)}
          >
            <div>
              <h2 className="text-xl font-bold mb-4 text-white text-left">Select Agent Type</h2>
              <div className={cardContainerClass}>
                {agentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleAgentTypeSelection(type.id)}
                    className={`
                      ${type.disabled
                        ? "bg-gray-400 opacity-50 cursor-not-allowed"
                        : selectedAgentType === type.id
                          ? selectedButtonClass
                          : buttonClass
                      }
                      ${cardClass}
                    `}
                    disabled={type.disabled}
                  >
                    <div className={buttonContentClass}>
                      <span className={buttonTextClass}>{type.name}</span>
                    </div>
                    {type.disabled && (
                      <span className="absolute -top-2 -right-2 bg-purple-500 text-xs px-2 py-1 rounded-full text-white">
                        Coming Soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Accordion>

          <Accordion
            title="5. Choose Your Character"
            isOpen={openSection === 5}
            onToggle={() => setOpenSection(openSection === 5 ? null : 5)}
            isValid={true}
          >
            <div>
              <h2 className="text-xl font-bold mb-4 text-white text-left">Choose Your Character</h2>
              <p className="text-gray-300 mb-4">
                Select a character for your agent. The agent will talk to you like these characters:
              </p>
              <div className={cardContainerClass}>
                <button
                  onClick={() => {}}
                  className={`${buttonClass} opacity-50 cursor-not-allowed ${cardClass}`}
                  disabled
                >
                  <span className={buttonTextClass}>Elon Musk</span>
                </button>
                <button
                  onClick={() => {}}
                  className={`${buttonClass} opacity-50 cursor-not-allowed ${cardClass}`}
                  disabled
                >
                  <span className={buttonTextClass}>Donald Trump</span>
                </button>
                <button
                  onClick={() => {}}
                  className={`${buttonClass} opacity-50 cursor-not-allowed ${cardClass}`}
                  disabled
                >
                  <span className={buttonTextClass}>Andrew Tate</span>
                </button>
              </div>
              <p className="text-gray-300 mt-4">
                Choose wisely! Your agent will embody the personality of the selected character.
              </p>
            </div>
          </Accordion>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black py-4 px-4 border-t border-gray-800">
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className={`${primaryButtonClass} w-full max-w-xs ${
              !isStepValid(1) || !isStepValid(3) || !isStepValid(4)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={!isStepValid(1) || !isStepValid(3) || !isStepValid(4)}
          >
            Create and Start
          </button>
        </div>
      </div>

      <TelegramNoticeModal
        isOpen={showTelegramNotice}
        onClose={() => setShowTelegramNotice(false)}
        onConfirm={() => {
          setShowTelegramNotice(false);
          window.open("https://t.me/Nexarb_Test_Solana_Bot", "_blank");
        }}
      />

      <RoadmapModal
        isOpen={showRoadmap}
        onClose={() => setShowRoadmap(false)}
      />

      {showLoginModal && (
        <TwitterLoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
