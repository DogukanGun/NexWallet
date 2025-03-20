"use client";

import { useState, useEffect, useRef } from "react";
import { buttonClass, selectedButtonClass } from "../components/ButtonClass";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useConfigStore } from '../store/configStore';
import PaymentRequiredModal from "../components/PaymentRequiredModal";
import { apiService, SaveAgentApiServiceResponse } from "../services/ApiService";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { updateLocalToken } from "@/lib/jwt";
import Accordion from "../components/Accordion";
import { WarningModal } from "./components/WarningMode";
import TelegramNoticeModal from '../components/TelegramNoticeModal';
import RoadmapModal from '../components/RoadmapModal';
import { AppChain, ChainId, KnowledgeBase } from "./data";
import AuthProvider from '../providers/AuthProvider';
import useAuthModal from '../hooks/useAuthModal';
import useCurrentUserId from "../hooks/useCurrentUserId";
import { SaveAgentModal } from './components/SaveAgentModal';
import SavedAgentsModal from "./components/SavedAgentsModal";

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
    id: ChainId.BNB,
    name: "BNB",
    disabled: true,
    isEmbedded: false,
    icon: "/icons/bnbchain.svg",
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
  },
  {
    id: ChainId.SONIC_SVM,
    name: "Sonic SVM",
    disabled: true,
    isEmbedded: false,
    icon: "/icons/sonic_svm.jpg",
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

type SavedAgent = {
  id: string;
  name: string;
  chains: AppChain[];
  llmProvider: string;
  agentType: string;
  createdAt: string;
};

export default function Configurator() {
  const router = useRouter();
  const [selectedChains, setSelectedChains] = useState<typeof chains[number][]>([]);
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<typeof knowledgeBases[number][]>([]);
  const [selectedLLM, setSelectedLLM] = useState<string>("");
  const [selectedAgentType, setSelectedAgentType] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const { allAccounts } = useAppKitAccount();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>("apiKeys");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const { open } = useAppKit();
  const [showTelegramNotice, setShowTelegramNotice] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, userData } = useConfigStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { userId } = useCurrentUserId();
  const { handleLogout } = useAuthModal();
  const cardContainerClass = "grid grid-cols-2 gap-2 min-h-[160px]";
  const cardClass = "h-[40px] flex items-center justify-center w-full relative";
  const buttonContentClass =
    "absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-[120px]";
  const iconClass = "w-4 h-4 mr-2";
  const buttonTextClass = "text-xs";
  const [agentName, setAgentName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedAgents, setSavedAgents] = useState<SaveAgentApiServiceResponse[]>([]);
  const [showSavedAgentsModal, setShowSavedAgentsModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleStart = async () => {
    // Save selections into the store
    const config = {
      chains: selectedChains,
      llmProvider: selectedLLM,
      agentType: selectedAgentType,
      isPointSystemJoined: selectedConnectionType === "join",
    };

    useConfigStore.getState().setConfig(config);

    // Check if an EVM wallet is required
    const requiresEvmWallet = selectedChains.some(chain => 
      [ChainId.ARBITRUM, ChainId.BASE, ChainId.ETHEREUM].includes(chain.id)
    );
    const hasEvmWallet = allAccounts.filter(account => account.namespace === "eip155").length > 0;
    const hasSolanaWallet = allAccounts.filter(account => account.namespace === "solana").length > 0;

    const requireSolanaWallet = selectedChains.some(chain => 
      [ChainId.SOLANA].includes(chain.id)
    );

    if (requiresEvmWallet && !hasEvmWallet) {
      setShowWalletModal(true);
      return;
    }

    if (requireSolanaWallet && !hasSolanaWallet) {
      setShowWalletModal(true);
      return;
    }

    const res = await apiService.updateToken(userId!);
    updateLocalToken(res.token);

    if (selectedAgentType === "voice") {
      router.push("/voice");
    } else if (selectedAgentType === "text") {
      router.push("/chat");
    }
  };

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

  const handleLogoutClick = () => {
    handleLogout();
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleLogin = () => {
    // Redirect to the login endpoint
    window.location.href = '/login';
  };

  useEffect(() => {
    const loadSavedAgents = async () => {
      try {
        const agents = await apiService.getMyAgents();
        setSavedAgents(agents);
      } catch (error) {
        console.error('Error loading saved agents:', error);
      }
    };

    if (isAuthenticated) {
      loadSavedAgents();
    }
  }, [isAuthenticated]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white page-with-navbar pb-20 overflow-x-hidden">
        {/* Welcome Section */}
        <section className="pt-12 pb-8 px-4 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-4">
            Welcome to NexAI Configurator
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create your personalized AI assistant in just a few steps. Configure the chains, 
            knowledge base, and interaction type to get started.
          </p>

          {/* Auth Section */}
          <div className="mt-6">
            {isAuthenticated && userData ? (
              <div className="inline-flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-full">
                <span className="text-gray-300">@{userData.username}</span>
                <button
                  onClick={handleLogoutClick}
                  className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                <span>Get Started with</span>
                <Image
                  src="/icons/x.png"
                  alt="X"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
              </button>
            )}
          </div>
        </section>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-between relative">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${openSection === step 
                    ? 'bg-blue-500 text-white' 
                    : isStepValid(step) 
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300'}`}>
                  {isStepValid(step) ? '✓' : step}
                </div>
                <span className="text-xs mt-2 text-gray-400">
                  {step === 1 ? 'Chains' 
                    : step === 2 ? 'Knowledge' 
                    : step === 3 ? 'LLM' 
                    : 'Agent Type'}
                </span>
              </div>
            ))}
            <div className="absolute h-0.5 bg-gray-700 left-0 right-0 top-4 -z-0"></div>
          </div>
        </div>

        {/* Main Configuration Area */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="space-y-4 bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <Accordion
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">1</div>
                  <span>Select Chains</span>
                  {isStepValid(1) && <span className="text-green-500 ml-auto">✓</span>}
                </div>
              }
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
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">2</div>
                  <span>Knowledge Bases</span>
                  {isStepValid(2) && <span className="text-green-500 ml-auto">✓</span>}
                </div>
              }
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
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">3</div>
                  <span>Select LLM Provider</span>
                  {isStepValid(3) && <span className="text-green-500 ml-auto">✓</span>}
                </div>
              }
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
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">4</div>
                  <span>Select Agent Type</span>
                  {isStepValid(4) && <span className="text-green-500 ml-auto">✓</span>}
                </div>
              }
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
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">5</div>
                  <span>Voice & Character Settings</span>
                  <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full">Coming Soon</span>
                </div>
              }
              isOpen={openSection === 5}
              onToggle={() => setOpenSection(openSection === 5 ? null : 5)}
              isValid={true}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Voice Customization</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 opacity-50 cursor-not-allowed">
                      <h4 className="font-medium mb-2">Voice Type</h4>
                      <select disabled className="w-full bg-gray-700 text-gray-400 rounded p-2">
                        <option>Natural</option>
                        <option>Robotic</option>
                        <option>Human-like</option>
                      </select>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 opacity-50 cursor-not-allowed">
                      <h4 className="font-medium mb-2">Accent</h4>
                      <select disabled className="w-full bg-gray-700 text-gray-400 rounded p-2">
                        <option>American</option>
                        <option>British</option>
                        <option>Australian</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Character Personality</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 opacity-50 cursor-not-allowed">
                      <h4 className="font-medium mb-2">Personality Type</h4>
                      <select disabled className="w-full bg-gray-700 text-gray-400 rounded p-2">
                        <option>Professional</option>
                        <option>Friendly</option>
                        <option>Technical</option>
                      </select>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 opacity-50 cursor-not-allowed">
                      <h4 className="font-medium mb-2">Communication Style</h4>
                      <select disabled className="w-full bg-gray-700 text-gray-400 rounded p-2">
                        <option>Formal</option>
                        <option>Casual</option>
                        <option>Technical</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Accordion>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md py-4 px-4 border-t border-gray-800">
          <div className="max-w-3xl mx-auto flex gap-4">
            <div className="flex-1 flex gap-3">
              <button
                onClick={() => setShowSavedAgentsModal(true)}
                className="px-6 py-3 bg-gray-700 text-white rounded-full font-medium hover:bg-gray-600 transition-all duration-300
                  flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Saved Agents</span>
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={!isStepValid(1) || !isStepValid(3) || !isStepValid(4)}
                className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Agent</span>
              </button>
            </div>
            <button
              onClick={handleStart}
              disabled={!isStepValid(1) || !isStepValid(3) || !isStepValid(4)}
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium
                disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-300
                flex items-center gap-2"
            >
              <span>Start Agent</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Authentication Required</h3>
              <p className="text-gray-300 mb-6">
                You need to authenticate with X to access the configurator. Please log in to continue.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Login with X
                </button>
                <button
                  onClick={closeAuthModal}
                  className="ml-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {showPaymentModal && (
          <PaymentRequiredModal
            provider={selectedProvider}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
        {showWalletModal && (
          <WalletRequiredModal
            onClose={() => {
              setShowWalletModal(false)
              open()
            }}
          />
        )}
        {showWarningModal && (
          <WarningModal onClose={() => setShowWarningModal(false)} />
        )}

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

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Logout Confirmation</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-end">
                <button
                  onClick={handleLogoutClick}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="ml-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showSaveModal && (
          <SaveAgentModal 
            onClose={() => setShowSaveModal(false)}
            agentName={agentName}
            setAgentName={setAgentName}
            selectedChains={selectedChains}
            selectedLLM={selectedLLM}
            selectedAgentType={selectedAgentType}
            setSavedAgents={setSavedAgents}
          />
        )}
        {showSavedAgentsModal && <SavedAgentsModal onClose={() => setShowSavedAgentsModal(false)} />}
      </div>
    </AuthProvider>
  );
}
