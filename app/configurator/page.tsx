"use client";

import { useState, useEffect, useRef } from "react";
import { buttonClass } from "../components/ButtonClass";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useConfigStore } from '../store/configStore';
import PaymentRequiredModal from "../components/PaymentRequiredModal";
import { apiService } from "../services/ApiService";
import { useAppKitAccount } from "@reown/appkit/react";
import { updateLocalToken } from "@/lib/jwt";
import BaseExplanationModal from "../components/BaseExplanationModalProps";
import { usePrivy } from "@privy-io/react-auth";
import Cookies from 'js-cookie';
import { enqueueSnackbar } from "notistack";
import { useLoading } from '../context/LoadingContext';
import Accordion from "../components/Accordion";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export interface AppChain {
  id: string;
  name: string;
  isEmbedded: boolean;
  disabled: boolean | undefined;
  icon: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  disabled: boolean | undefined;
}

const knowledgeBases: KnowledgeBase[] = [
  {
    id: "cookieDao",
    name: "Cookie Dao",
    disabled: false,
  },
];

const chains: AppChain[] = [
  {
    id: "solana",
    name: "Solana",
    isEmbedded: false,
    disabled: false,
    icon: "/icons/solana.svg",
  },
  {
    id: "base",
    name: "Base",
    disabled: false,
    isEmbedded: true,
    icon: "/icons/base.svg",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    isEmbedded: true,
    disabled: true,
    icon: "/icons/arbitrum.svg",
  },
  {
    id: "eigenlayer",
    name: "Eigenlayer",
    disabled: true,
    isEmbedded: false,
    icon: "/icons/eigenlayer.svg",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    disabled: true,
    isEmbedded: true,
    icon: "/icons/ethereum.svg",
  },
  {
    id: "polygon",
    name: "Polygon",
    disabled: true,
    isEmbedded: false,
    icon: "/icons/polygon.svg",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    disabled: true,
    isEmbedded: false,
    icon: "/icons/avalanche.svg",
  },
];

const llmProviders = [
  {
    id: "claude", disabled: true,
    name: "Claude"
  },
  { id: "openai", name: "OpenAI" },
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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChains, setSelectedChains] = useState<typeof chains[number][]>([]);
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<typeof knowledgeBases[number][]>([]);
  const [selectedLLM, setSelectedLLM] = useState<string>("");
  const [selectedAgentType, setSelectedAgentType] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const { address, isConnected } = useAppKitAccount();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showArbitrumModal, setShowArbitrumModal] = useState(false);
  const { getAccessToken, user } = usePrivy();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>("apiKeys");

  const handleChainSelection = (chainId: string) => {
    const selectedChain = chains.find(chain => chain.id === chainId);

    if (chainId === "base") {
      if (selectedChains.some(chain => chain.id === selectedChain!.id)) {
        setSelectedChains((prev) => prev.filter((chain) => chain.id !== chainId));
        return;
      }
      setShowArbitrumModal(true);
      return;
    }

    setSelectedChains((prev) =>
      prev.some(chain => chain.id === selectedChain!.id) ? prev.filter((chain) => chain.id !== chainId) : [...prev, selectedChain!],
    );
  };

  const handleLLMSelection = (llmId: string) => {
    const selectedProvider = llmProviders.find(provider => provider.id === llmId);
    if (selectedProvider?.disabled) {
      return; // Prevent selection if the provider is disabled
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

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStart = async () => {
    // Save selections into the store
    const config = {
      chains: selectedChains,
      llmProvider: selectedLLM,
      agentType: selectedAgentType,
    };

    useConfigStore.getState().setConfig(config);

    const hasUserWallet = useConfigStore.getState().chains.some(chain => !chain.isEmbedded);

    if (!isConnected && hasUserWallet) {
      setShowWalletModal(true);
      return;
    }

    const res = await apiService.updateToken(hasUserWallet ? address! : user ? user.id : "");
    updateLocalToken(res.token);

    if (selectedAgentType === "voice") {
      router.push("/voice");
    } else if (selectedAgentType === "text") {
      router.push("/chat");
    }
  };

  const selectedButtonClass =
    "px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition duration-300 text-sm";

  const cardContainerClass = "grid grid-cols-2 gap-4 min-h-[160px]";
  const cardClass = "h-[45px] flex items-center justify-center w-full relative";
  const buttonContentClass =
    "absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-[140px]";
  const iconClass = "w-5 h-5 mr-3";
  const buttonTextClass = "text-sm";

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

  const getStepErrorMessage = (step: number) => {
    switch (step) {
      case 1:
        return "Please select at least one chain";
      case 2:
        return "";
      case 3:
        return "Please select an LLM provider";
      case 4:
        return "Please select an agent type";
      default:
        return "";
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

  const onAuthenticated = async () => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/user/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && accessToken) {
        Cookies.set('accessToken', accessToken, { expires: 7 });
        console.log('Access token saved in cookie:', accessToken);
        enqueueSnackbar('Privy token is valid, welcome to NexAI!', { variant: 'success' });
        setSelectedChains((prev) => [...prev, chains.find(chain => chain.id === "base")!]);
        setShowArbitrumModal(false);
      } else {
        console.error('Error in API response:', data);
      }
    } catch (error) {
      console.error('Error signing message:', error);
    }
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
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b bg-black text-white page-with-navbar">
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
      {showArbitrumModal && (
        <BaseExplanationModal
          onClose={() => {
            setSelectedChains((prev) => {
              if (prev.map(chain => chain.id).includes("base")) {
                return prev.filter((chain) => chain.id !== "base");
              }
              return prev;
            });
            setShowArbitrumModal(false);
          }}
          onAuthenticated={onAuthenticated}
        />
      )}

      <div className="w-full h-screen bg-black rounded-none p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-2">
            NexAI Wallet
          </h1>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <Accordion
            title="1. Select Chains"
            isOpen={openSection === 1}
            onToggle={() => setOpenSection(openSection === 1 ? null : 1)}
            isValid={isStepValid(1)}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Select Chains</h2>
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className={`${buttonClass} mb-4 flex items-center bg-gray-200 text-black`}
                >
                  Filter Chain {activeFilter ? `(${activeFilter === 'embedded' ? 'Embedded' : 'Browser'})` : ''}
                  <span className="ml-2">{isDropdownOpen ? '▼' : '▲'}</span>
                </button>
                {isDropdownOpen && (
                  <div ref={dropdownRef} className="absolute bg-white shadow-lg rounded-md mt-2 z-10">
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
          </Accordion>

          <Accordion
            title="2. Knowledge Bases"
            isOpen={openSection === 2}
            onToggle={() => setOpenSection(openSection === 2 ? null : 2)}
            isValid={isStepValid(2)}
          >
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">Knowledge Bases</h2>
              <div className={cardContainerClass}>
                {knowledgeBases.map((kb) => (
                  <button
                    key={kb.id}
                    onClick={() => {
                      const knowledgeBase = knowledgeBases.find(k => k.id === kb.id);
                      setSelectedKnowledgeBases((prev) =>
                        prev.some(kb => kb.id === knowledgeBase!.id)
                          ? prev.filter(kb => kb.id !== knowledgeBase!.id)
                          : knowledgeBase ? [...prev, knowledgeBase] : prev // Add the object if found
                      );
                    }}
                    className={`
                      ${selectedKnowledgeBases.some(kb => kb.id === kb.id) ? selectedButtonClass : buttonClass}
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
            onToggle={() => setOpenSection(openSection === 3 ? null : 3)}
            isValid={isStepValid(3)}
          >
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">Select LLM Provider</h2>
              <div className={cardContainerClass}>
                {llmProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleLLMSelection(provider.id)}
                    className={`
                      ${provider.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : selectedLLM === provider.id
                          ? selectedButtonClass
                          : buttonClass
                      }
                      ${cardClass}
                    `}
                    disabled={provider.disabled}
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
                ))}
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
              <h2 className="text-2xl font-bold mb-4 text-white">Select Agent Type</h2>
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
            title="5. Connection"
            isOpen={openSection === 5}
            onToggle={() => setOpenSection(openSection === 5 ? null : 5)}
            isValid={isConnectionStepValid()}
          >
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">Select Connection Type</h2>
              <div className={cardContainerClass}>
                <button
                  onClick={() => handleConnectionSelection("apiKeys")}
                  className={`
                    ${selectedConnectionType === "apiKeys" ? selectedButtonClass : buttonClass}
                    ${cardClass}
                  `}
                >
                  <span className={buttonTextClass}>Connection with API Keys</span>
                </button>
                <button
                  onClick={() => handleConnectionSelection("gaia")}
                  className={`
                    ${selectedConnectionType === "gaia" ? selectedButtonClass : buttonClass}
                    ${cardClass}
                  `}
                >
                  <span className={buttonTextClass}>Connection with Gaia (OnChain)</span>
                </button>
              </div>
              {!isConnectionStepValid() && (
                <p className="text-red-500">{getConnectionErrorMessage()}</p>
              )}
            </div>
          </Accordion>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleStart}
              className={`${primaryButtonClass} ${!isStepValid(1) || !isStepValid(3) || !isStepValid(4)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }`}
              disabled={!isStepValid(1) || !isStepValid(3) || !isStepValid(4)}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
