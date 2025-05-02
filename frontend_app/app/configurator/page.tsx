"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfigStore } from '../store/configStore';
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { updateLocalToken } from "@/lib/jwt";
import { apiService, SaveAgentApiServiceResponse, SavedVoice } from "../services/ApiService";
import { getElizaService } from '@/eliza';
import SavedAgentsModal from "./components/SavedAgentsModal";
import { useTheme } from '@/store/ThemeContext';
import ElizaAutoSelectModal from './components/ElizaAutoSelectModal';

// CSS Classes
const cardContainerClass = "flex flex-col gap-4 w-full max-w-4xl mx-auto p-4";
const buttonTextClass = "text-sm font-medium";
const buttonContentClass = "flex items-center gap-2";
const buttonClass = (theme: string) => `w-full px-4 py-3 rounded-lg ${
  theme === 'dark' 
    ? 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white border border-gray-800'
    : 'bg-white hover:bg-blue-50 text-gray-400 border border-gray-100'
} transition-all duration-300 relative`;
const selectedButtonClass = (theme: string) => `w-full px-4 py-3 rounded-lg ${
  theme === 'dark'
    ? 'bg-purple-600 hover:bg-purple-700 text-white'
    : 'bg-blue-200 hover:bg-blue-300 text-blue-600'
} transition-all duration-300 relative`;

// Types
interface AppChain {
  id: ChainId;
  name: string;
  elizaMandatory: boolean;
  isEmbedded: boolean;
  disabled: boolean;
  icon: string;
  maintenanceMode?: boolean;
}

enum ChainId {
  SOLANA = "solana",
  BASE = "base",
  ARBITRUM = "arbitrum",
  OPTIMISM = "optimism",
  POLYGON = "polygon",
  BNB = "bnb",
  STARKNET = "starknet"
}

interface KnowledgeBase {
  id: string;
  name: string;
  disabled: boolean;
}

<<<<<<< HEAD
=======
interface LLMProvider {
  id: string;
  name: string;
  disabled: boolean;
}

interface AgentType {
  id: string;
  name: string;
  disabled: boolean;
}

>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f
// Components
import {
  Header,
  ProgressIndicator,
  ChainSelection,
  CharacterSelection,
  VoiceSelection,
<<<<<<< HEAD
=======
  FooterActions,
>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f
  WalletRequiredModal,
  TwitterLoginModal,
  LogoutModal,
  GermanAnimation,
  USAAnimation,
  TurkishAnimation,
  SaveAgentModal,
  WarningModal
} from './components';

import Accordion from "../components/Accordion";
import PaymentRequiredModal from "../components/PaymentRequiredModal";
import TelegramNoticeModal from '../components/TelegramNoticeModal';
import RoadmapModal from '../components/RoadmapModal';
import AuthProvider from '../providers/AuthProvider';
import useAuthModal from '../hooks/useAuthModal';
import useCurrentUserId from "../hooks/useCurrentUserId";

// Data constants
const chains: AppChain[] = [
  {
    id: ChainId.SOLANA,
    name: "Solana",
    isEmbedded: false,
    disabled: false,
    elizaMandatory: false,
    icon: "/icons/solana.svg",
  },
  {
    id: ChainId.BNB,
    name: "BNB Chain",
    disabled: false,
    isEmbedded: false,
<<<<<<< HEAD
    elizaMandatory: false,
=======
    elizaMandatory: true,
>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f
    icon: "/icons/bnbchain.svg",
  },
  {
    id: ChainId.STARKNET,
    name: "StarkNet",
    disabled: false,
    isEmbedded: false,
<<<<<<< HEAD
    elizaMandatory: false,
=======
    elizaMandatory: true,
>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f
    icon: "/icons/starknet.svg",
  },
  {
    id: ChainId.BASE,
    name: "Base",
<<<<<<< HEAD
    disabled: false,
    isEmbedded: true,
    elizaMandatory: false,
    icon: "/icons/base.svg",
=======
    disabled: true,
    isEmbedded: true,
    elizaMandatory: true,
    icon: "/icons/base.svg",
    maintenanceMode: true
>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f
  },
  {
    id: ChainId.ARBITRUM,
    name: "Arbitrum",
    disabled: true,
    isEmbedded: true,
    elizaMandatory: true,
    icon: "/icons/arbitrum.svg",
    maintenanceMode: true
  },
  {
    id: ChainId.OPTIMISM,
    name: "Optimism",
    disabled: true,
    isEmbedded: true,
    elizaMandatory: true,
    icon: "/icons/optimism.svg",
    maintenanceMode: true
  },
  {
    id: ChainId.POLYGON,
    name: "Polygon",
    disabled: true,
    isEmbedded: true,
    elizaMandatory: true,
    icon: "/icons/polygon.svg",
  },
];

const knowledgeBases: KnowledgeBase[] = [
  {
    id: "cookieDao",
    name: "Cookie Dao",
    disabled: false,
  },
  {
    id: "messari",
    name: "Messari",
    disabled: false,
  },
  {
    id: "eliza",
    name: "Eliza",
    disabled: false,
  }
];

const llmProviders = [
  {
    id: "openai", 
    name: "OpenAI",
    disabled: false
  },
  {
    id: "llama_onchain", 
    name: "Llama 3.1 Onchain - Powered by Lilypad",
    disabled: false
  },
  {
    id: "deepseek_onchain", 
    name: "DeepSeek Onchain - Powered by Lilypad",
    disabled: false
  },
  {
    id: "claude", 
    disabled: true,
    name: "Claude"
  },
  {
    id: "llama", 
    disabled: true,
    name: "Llama 3.1"
  },
];

const agentTypes = [
  { id: "voice", name: "Voice Agent", disabled: false },
  { id: "text", name: "Text Agent", disabled: false },
];

export default function Configurator() {
  const router = useRouter();
  const { allAccounts } = useAppKitAccount();
  const { open } = useAppKit();
  const { isAuthenticated, userData } = useConfigStore();
  const { userId } = useCurrentUserId();
  const { handleLogout } = useAuthModal();
  const { theme } = useTheme();

  // State Management
  const [selectedChains, setSelectedChains] = useState<AppChain[]>([]);
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedLLM, setSelectedLLM] = useState("");
  const [selectedAgentType, setSelectedAgentType] = useState("");
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedConnectionType, setSelectedConnectionType] = useState("apiKeys");

  // UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [agentName, setAgentName] = useState('');
  const [characters, setCharacters] = useState<{name: string, description: string}[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [savedVoices, setSavedVoices] = useState<SavedVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [savedAgents, setSavedAgents] = useState<SaveAgentApiServiceResponse[]>([]);

  // Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showTelegramNotice, setShowTelegramNotice] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedAgentsModal, setShowSavedAgentsModal] = useState(false);
  const [showElizaAutoSelectModal, setShowElizaAutoSelectModal] = useState(false);

  // Animation States
  const [showGermanyAnimation, setShowGermanyAnimation] = useState(false);
  const [showUSAAnimation, setShowUSAAnimation] = useState(false);
  const [showAtaturkAnimation, setShowAtaturkAnimation] = useState(false);

  // Event Handlers
  const handleChainSelection = (chainId: string) => {
    const selectedChain = chains.find(chain => chain.id === chainId);
    if (selectedChain) {
      setSelectedChains(prev =>
        prev.some(chain => chain.id === selectedChain.id) 
          ? prev.filter(chain => chain.id !== chainId) 
          : [...prev, selectedChain]
      );

      // Check if the selected chain requires Eliza and auto-select it
      if (selectedChain.elizaMandatory) {
        const elizaKnowledgeBase = knowledgeBases.find(kb => kb.id === "eliza");
        if (elizaKnowledgeBase && !selectedKnowledgeBases.some(kb => kb.id === "eliza")) {
          setSelectedKnowledgeBases(prev => [...prev, elizaKnowledgeBase]);
          setShowElizaAutoSelectModal(true);
        }
      }
    }
  };

  const handleLLMSelection = (llmId: string) => {
    if (selectedChains.length === 0) {
      setShowWarningModal(true);
      return;
    }

    const selectedProvider = llmProviders.find(provider => provider.id === llmId);
    if (selectedProvider?.disabled) return;

    // Check if we're selecting or deselecting
    const isDeselecting = selectedLLM === llmId;

    // Only show payment modal when selecting (not deselecting) paid providers
    if (!isDeselecting && (llmId === 'claude' || llmId === 'openai')) {
      setSelectedProvider(llmId === 'claude' ? 'Claude' : 'OpenAI');
      setShowPaymentModal(true);
    }
    
    // Toggle selection
    const newLLM = isDeselecting ? "" : llmId;
    setSelectedLLM(newLLM);
    useConfigStore.getState().setConfig({
      ...useConfigStore.getState(),
      llmProvider: newLLM,
      isOnchain: newLLM === 'llama_onchain' || newLLM === 'deepseek_onchain',
      modelName: newLLM
    });
  };

  const handleAgentTypeSelection = (typeId: string) => {
    const selectedType = agentTypes.find(type => type.id === typeId);
    if (selectedType?.disabled) return;

    const isVoiceAgent = typeId === "voice";
    const isSolanaSelected = selectedChains.some(chain => chain.id === "solana");

    if (isVoiceAgent && !isSolanaSelected) return;

    // Toggle selection
    const isDeselecting = selectedAgentType === typeId;
    const newType = isDeselecting ? "" : typeId;
    setSelectedAgentType(newType);
    
    const hasElizaSelected = selectedKnowledgeBases.some(kb => kb.id === "eliza");
    if (hasElizaSelected && newType !== "") {
      const nextSection = isVoiceAgent ? 5 : 6;
      setTimeout(() => setOpenSection(nextSection), 300);
    }
  };

  const handleStart = async () => {
    const config = {
      chains: selectedChains,
      llmProvider: selectedLLM,
      agentType: selectedAgentType,
      isPointSystemJoined: selectedConnectionType === "join",
      selectedVoice: selectedVoice || 'voice1',
      modelName: selectedLLM,
      isOnchain: selectedLLM === 'llama_onchain' || selectedLLM === 'deepseek_onchain',
      character: selectedCharacter
    };

    useConfigStore.getState().setConfig(config);

    const requiresEvmWallet = selectedChains.some(chain => 
      [ChainId.ARBITRUM, ChainId.BASE, ChainId.OPTIMISM, ChainId.POLYGON, ChainId.BNB, ChainId.STARKNET].includes(chain.id)
    );
    const hasEvmWallet = allAccounts.filter(account => account.namespace === "eip155").length > 0;
    const hasSolanaWallet = allAccounts.filter(account => account.namespace === "solana").length > 0;
    const requireSolanaWallet = selectedChains.some(chain => chain.id === ChainId.SOLANA);

    if ((requiresEvmWallet && !hasEvmWallet) || (requireSolanaWallet && !hasSolanaWallet)) {
      setShowWalletModal(true);
      return;
    }

    const res = await apiService.updateToken(userId!);
    updateLocalToken(res.token);

    router.push(selectedAgentType === "voice" ? "/voice" : "/chat");
  };

  const handleCharacterSelection = (character: string) => {
    setSelectedCharacter(character);
    
    if (character === "friedrichmerz") {
      setShowGermanyAnimation(true);
      setTimeout(() => setShowGermanyAnimation(false), 5000); // Auto close after 5 seconds
    } else if (character === "donaldtrump") {
      setShowUSAAnimation(true);
      setTimeout(() => setShowUSAAnimation(false), 5000); // Auto close after 5 seconds
    } else if (character === "mustafakemalataturk") {
      setShowAtaturkAnimation(true);
      setTimeout(() => setShowAtaturkAnimation(false), 5000); // Auto close after 5 seconds
    }
  };

  // Validation
  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return selectedChains.length > 0;
      case 2: return true;
      case 3: return selectedLLM !== "";
      case 4: return selectedAgentType !== "";
      default: return false;
    }
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      apiService.getMyAgents().then(setSavedAgents);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const loadVoices = async () => {
      if (selectedAgentType === 'voice') {
        setIsLoadingVoices(true);
        try {
          const [regularVoices, ipfsVoices] = await Promise.all([
            apiService.getMyVoices(),
            apiService.getMyIpfsVoices()
          ]);
          
          const allVoices = [...regularVoices, ...ipfsVoices];
          const uniqueVoices = Array.from(new Map(allVoices.map(voice => [voice.voice_id, voice])).values());
          setSavedVoices(uniqueVoices);
        } catch (error) {
          console.error('Error loading voices:', error);
        } finally {
          setIsLoadingVoices(false);
        }
      }
    };

    loadVoices();
  }, [selectedAgentType]);

  useEffect(() => {
    const fetchCharacters = async () => {
      if (selectedKnowledgeBases.some(kb => kb.id === "eliza")) {
        try {
          setLoadingCharacters(true);
          const elizaService = getElizaService();
          const characterNames = await elizaService.getCharacters();
          
          const characterDescriptions: {[key: string]: string} = {
            "Pirate": "Talks like a swashbuckling pirate",
            "Shakespeare": "Speaks in Shakespearean style",
            "CryptoWizard": "Mystical crypto advisor",
            "FriedrichMerz": "German politician's perspective and only speaks in German",
            "DonaldTrump": "Mimics Trump's speaking style",
            "ElonMusk": "Tech visionary and entrepreneur",
            "KevinHart": "Comedian's energetic style",
            "MustafaKemalAtaturk": "Modern Turkey's founding father and only speaks in Turkish"
          };
          
          setCharacters(characterNames.map(name => ({
            name,
            description: characterDescriptions[name] || `Character with ${name} personality`
          })));
        } catch (error) {
          console.error('Error fetching characters:', error);
        } finally {
          setLoadingCharacters(false);
        }
      }
    };
    
    fetchCharacters();
  }, [selectedKnowledgeBases]);

  return (
    <AuthProvider>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {/* Animations */}
            {showGermanyAnimation && <GermanAnimation onClose={() => setShowGermanyAnimation(false)} />}
            {showUSAAnimation && <USAAnimation onClose={() => setShowUSAAnimation(false)} />}
            {showAtaturkAnimation && <TurkishAnimation onClose={() => setShowAtaturkAnimation(false)} />}

            {/* Header */}
            <Header
              isAuthenticated={isAuthenticated}
              userData={userData}
              onLoginClick={() => setShowLoginModal(true)}
              onLogoutClick={() => setShowLogoutModal(true)}
            />

            {/* Progress Indicator */}
            <ProgressIndicator
              currentSection={openSection || 0}
              isStepValid={isStepValid}
            />

            {/* Main Configuration Area */}
            <div className="max-w-3xl mx-auto px-4">
              <div className={`space-y-4 rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-[#1A1A1A] border-gray-800'
                  : 'bg-white border-gray-100'
              } border`}>
                {/* Chain Selection */}
                <Accordion
                  title={
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'dark'
                          ? 'bg-[#2A2A2A] text-white'
                          : 'bg-blue-50 text-blue-400 font-medium'
                      }`}>1</div>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-400 font-medium'}>Select Chains</span>
                      {isStepValid(1) && <span className="text-green-500 ml-auto">✓</span>}
                    </div>
                  }
                  isOpen={openSection === 1}
                  onToggle={() => setOpenSection(openSection === 1 ? null : 1)}
                  isValid={isStepValid(1)}
                  className={`${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white hover:bg-blue-50'} rounded-lg transition-colors duration-200`}
                >
                  <div className={theme === 'dark' ? '' : 'bg-white'}>
                    <ChainSelection
                      chains={chains}
                      selectedChains={selectedChains}
                      activeFilter={activeFilter}
                      isDropdownOpen={isDropdownOpen}
                      onChainSelect={handleChainSelection}
                      onFilterToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                      onWalletTypeSelect={(isEmbedded) => {
                        const filterType = isEmbedded ? "embedded" : "browser";
                        setActiveFilter(prev => prev === filterType ? null : filterType);
                        setIsDropdownOpen(false);
                      }}
                      buttonClass={buttonClass(theme)}
                      selectedButtonClass={selectedButtonClass(theme)}
                      theme={theme}
                    />
                  </div>
                </Accordion>

                {/* Knowledge Base Selection */}
                <Accordion
                  title={
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'dark'
                          ? 'bg-[#2A2A2A] text-white'
                          : 'bg-blue-50 text-blue-400 font-medium'
                      }`}>2</div>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-400 font-medium'}>Knowledge Bases</span>
                      {isStepValid(2) && <span className="text-green-500 ml-auto">✓</span>}
                    </div>
                  }
                  isOpen={openSection === 2}
                  onToggle={() => setOpenSection(openSection === 2 ? null : 2)}
                  isValid={isStepValid(2)}
                  className={`${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white hover:bg-blue-50'} rounded-lg transition-colors duration-200`}
                >
                  <div>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>
                      Knowledge Bases
                    </h2>
                    <div className={cardContainerClass}>
                      {knowledgeBases.map((kb) => (
                        <button
                          key={kb.id}
                          onClick={() => {
                            setSelectedKnowledgeBases((prev) =>
                              prev.some(k => k.id === kb.id)
                                ? prev.filter(k => k.id !== kb.id)
                                : [...prev, kb]
                            );
                          }}
                          className={`
                            ${selectedKnowledgeBases.some(k => k.id === kb.id) ? selectedButtonClass(theme) : buttonClass(theme)}
                            relative
                          `}
                          disabled={kb.disabled}
                        >
                          <div className={buttonContentClass}>
                            <span className={buttonTextClass}>{kb.name}</span>
                          </div>
                          {kb.disabled && (
                            <span className="absolute -top-2 -right-2 bg-purple-500 text-xs px-2 py-1 rounded-full text-white">
                              Coming Soon
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </Accordion>

                {/* LLM Selection */}
                <Accordion
                  title={
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'dark'
                          ? 'bg-[#2A2A2A] text-white'
                          : 'bg-blue-50 text-blue-400 font-medium'
                      }`}>3</div>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-400 font-medium'}>Select LLM Provider</span>
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
                  className={`${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white hover:bg-blue-50'} rounded-lg transition-colors duration-200`}
                >
                  <div>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>
                      Select LLM Provider
                    </h2>
                    <div className={cardContainerClass}>
                      {llmProviders.map((provider) => {
                        const isDisabled = 
                          (provider.id === "claude" && (selectedChains.some(chain => chain.id === ChainId.BASE) || selectedChains.some(chain => chain.id === ChainId.OPTIMISM))) ||
                          (selectedChains.length === 0);

                        return (
                          <button
                            key={provider.id}
                            onClick={() => handleLLMSelection(provider.id)}
                            className={`
                              ${isDisabled ? "opacity-50 cursor-not-allowed" : selectedLLM === provider.id ? selectedButtonClass(theme) : buttonClass(theme)}
                              relative
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

                {/* Agent Type Selection */}
                <Accordion
                  title={
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'dark'
                          ? 'bg-[#2A2A2A] text-white'
                          : 'bg-blue-50 text-blue-400 font-medium'
                      }`}>4</div>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-400 font-medium'}>Select Agent Type</span>
                      {isStepValid(4) && <span className="text-green-500 ml-auto">✓</span>}
                    </div>
                  }
                  isOpen={openSection === 4}
                  onToggle={() => setOpenSection(openSection === 4 ? null : 4)}
                  isValid={isStepValid(4)}
                  className={`${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white hover:bg-blue-50'} rounded-lg transition-colors duration-200`}
                >
                  <div>
                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>
                      Select Agent Type
                    </h2>
                    <div className={cardContainerClass}>
                      {agentTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handleAgentTypeSelection(type.id)}
                          className={`
                            ${type.disabled
                              ? "opacity-50 cursor-not-allowed"
                              : selectedAgentType === type.id
                                ? selectedButtonClass(theme)
                                : buttonClass(theme)
                            }
                            relative
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

                {/* Voice Selection */}
                {selectedAgentType === 'voice' && (
                  <Accordion
                    title={
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          theme === 'dark'
                            ? 'bg-[#2A2A2A] text-white'
                            : 'bg-blue-50 text-blue-400 font-medium'
                        }`}>5</div>
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-400 font-medium'}>Voice Selection</span>
                      </div>
                    }
                    isOpen={openSection === 5}
                    onToggle={() => setOpenSection(openSection === 5 ? null : 5)}
                    isValid={true}
                    className={`${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white hover:bg-blue-50'} rounded-lg transition-colors duration-200`}
                  >
                    <VoiceSelection
                      selectedVoice={selectedVoice}
                      savedVoices={savedVoices}
                      isLoadingVoices={isLoadingVoices}
                      onVoiceSelect={setSelectedVoice}
                    />
                  </Accordion>
                )}

                {/* Character Selection */}
                <Accordion
                  title={
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'dark'
                          ? 'bg-[#2A2A2A] text-white'
                          : 'bg-blue-50 text-blue-400 font-medium'
                      }`}>{selectedAgentType === 'voice' ? 6 : 5}</div>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-400 font-medium'}>Character Selection</span>
                      {(!selectedKnowledgeBases.some(kb => kb.id === "eliza") || selectedAgentType === "") && (
                        <div className="ml-auto flex gap-2">
                          {!selectedKnowledgeBases.some(kb => kb.id === "eliza") && (
                            <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                              Requires Eliza
                            </span>
                          )}
                          {selectedAgentType === "" && (
                            <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                              Requires Chat Agent
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  }
                  isOpen={openSection === (selectedAgentType === 'voice' ? 6 : 5)}
                  onToggle={() => {
                    if (selectedKnowledgeBases.some(kb => kb.id === "eliza") && selectedAgentType !== "") {
                      setOpenSection(openSection === (selectedAgentType === 'voice' ? 6 : 5) ? null : (selectedAgentType === 'voice' ? 6 : 5));
                    }
                  }}
                  isValid={true}
                  className={(!selectedKnowledgeBases.some(kb => kb.id === "eliza") || selectedAgentType === "") ? "opacity-60 cursor-not-allowed" : `${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white hover:bg-blue-50'} rounded-lg transition-colors duration-200`}
                >
                  <CharacterSelection
                    characters={characters}
                    selectedCharacter={selectedCharacter}
                    onCharacterSelect={handleCharacterSelection}
                    loadingCharacters={loadingCharacters}
                  />
                </Accordion>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={`fixed bottom-0 left-0 right-0 ${
              theme === 'dark'
                ? 'bg-gradient-to-t from-black to-transparent'
                : 'bg-gradient-to-t from-white to-transparent'
            } py-6`}>
              <div className="container mx-auto px-4">
                <div className={`p-4 rounded-xl backdrop-blur-md ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border-gray-800'
                    : 'bg-white/80 border-gray-200'
                } border`}>
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowSavedAgentsModal(true)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                          theme === 'dark'
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        Saved Agents
                      </button>
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                          theme === 'dark'
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        Save Configuration
                      </button>
                    </div>
                    <button
                      onClick={handleStart}
                      disabled={!isStepValid(1) || !isStepValid(3) || !isStepValid(4)}
                      className={`px-8 py-2 rounded-lg font-medium transition-all duration-200 ${
                        !isStepValid(1) || !isStepValid(3) || !isStepValid(4)
                          ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modals */}
            {showWalletModal && (
              <div className={`fixed inset-0 flex items-center justify-center z-50 ${
                theme === 'dark' ? 'bg-black/50' : 'bg-gray-500/50'
              }`}>
                <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200'
                } border`}>
                  <WalletRequiredModal onClose={() => {
                    setShowWalletModal(false);
                    open();
                  }} />
                </div>
              </div>
            )}
            {showLoginModal && <TwitterLoginModal onClose={() => setShowLoginModal(false)} />}
            {showLogoutModal && (
              <LogoutModal 
                onClose={() => setShowLogoutModal(false)}
                onLogout={handleLogout}
              />
            )}
            {showPaymentModal && (
              <div className={`fixed inset-0 flex items-center justify-center z-50 ${
                theme === 'dark' ? 'bg-black/50' : 'bg-gray-500/50'
              }`}>
                <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200'
                } border`}>
                  <PaymentRequiredModal
                    provider={selectedProvider}
                    onClose={() => setShowPaymentModal(false)}
                  />
                </div>
              </div>
            )}
            {showWarningModal && (
              <div className={`fixed inset-0 flex items-center justify-center z-50 ${
                theme === 'dark' ? 'bg-black/50' : 'bg-gray-500/50'
              }`}>
                <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200'
                } border`}>
                  <WarningModal onClose={() => setShowWarningModal(false)} />
                </div>
              </div>
            )}
            {showTelegramNotice && (
              <TelegramNoticeModal
                isOpen={showTelegramNotice}
                onClose={() => setShowTelegramNotice(false)}
                onConfirm={() => {
                  setShowTelegramNotice(false);
                  window.open("https://t.me/Nexarb_Test_Solana_Bot", "_blank");
                }}
              />
            )}
            {showRoadmap && <RoadmapModal isOpen={showRoadmap} onClose={() => setShowRoadmap(false)} />}
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
            {showElizaAutoSelectModal && (
              <div className={`fixed inset-0 flex items-center justify-center z-50 ${
                theme === 'dark' ? 'bg-black/50' : 'bg-gray-500/50'
              }`}>
                <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200'
                } border`}>
                  <ElizaAutoSelectModal onClose={() => setShowElizaAutoSelectModal(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
