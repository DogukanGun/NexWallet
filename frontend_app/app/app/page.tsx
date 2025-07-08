'use client'

import { useState, useEffect } from 'react'
import { useConfigStore } from '../store/configStore'
import { useRouter } from 'next/navigation'
import { ChainId } from '../configurator/data'
import AuthProvider from '../providers/AuthProvider'
import useAuthModal from '../hooks/useAuthModal'
import { AuthProvider as AuthContextProvider } from '../context/AuthContext'
import { apiService, SaveAgentApiServiceResponse, SavedAgent } from '../services/ApiService'
import { Agent } from './data'
import Header from './components/Header'
import SocialMediaBanner from './components/SocialMediaBanner'
import QuickActions from './components/QuickActions'
import UpcomingFeatures from './components/UpcomingFeatures'
import PredefinedAgents from './components/PredefinedAgents'
import SavedAgents from './components/SavedAgents'
import BusinessTools from './components/BusinessTools'
import { useTheme } from '@/store/ThemeContext'

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const [predefinedAgents, setPredefinedAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Solana AI Bot',
      description: 'Interact with Solana blockchain, manage tokens, and get real-time information. Works in text and voice mode.',
      poweredBy: 'SendAI',
      isWalletRequired: true
    },
    {
      id: '2',
      name: 'Base AI Bot',
      description: 'Navigate Base network, handle transactions, and access DeFi protocols. Works in text mode only.',
      poweredBy: 'Coinbase Agent Kit',
      isWalletRequired: true
    },
    {
      id: '3',
      name: 'Ethereum AI Bot',
      description: 'Manage Ethereum assets, interact with smart contracts, and explore the ecosystem. Works in text mode only.',
      poweredBy: 'Coinbase Agent Kit',
      isWalletRequired: true
    },
    {
      id: '4',
      name: 'Arbitrum AI Bot',
      description: 'Interact with Arbitrum network, manage transactions, and access Layer 2 solutions. Works in text mode only.',
      poweredBy: 'Coinbase Agent Kit',
      isWalletRequired: true
    },
    {
      id: '5',
      name: 'Optimism AI Bot',
      description: 'Navigate Optimism network, handle transactions, and access DeFi protocols. Works in text mode only.',
      poweredBy: 'Coinbase Agent Kit',
      isWalletRequired: true
    },
    {
      id: '6',
      name: 'BNB Chain AI Bot',
      description: 'Coming Soon. Interact with BNB Chain, manage transactions, and access DeFi protocols. Works in text mode only.',
      poweredBy: 'NexArb',
      isWalletRequired: true
    },
    {
      id: '7',
      name: 'Sonic EVM AI Bot',
      description: 'Coming Soon. Navigate Sonic EVM, handle transactions, and access Layer 2 solutions. Works in text mode only.',
      poweredBy: 'NexArb',
      isWalletRequired: true
    },
    {
      id: '8',
      name: 'Base with Llama 3.1',
      description: 'Coming Soon. Interact with Base network using Llama 3.1. Works in text mode only.',
      poweredBy: 'Gaia OnChain - Coinbase Agent Kit',
      isWalletRequired: true
    },
    {
      id: '9',
      name: 'Stellar AI Wallet',
      description: 'Manage Stellar wallets, send payments, swap assets, and more with AI assistance. Works in text mode only.',
      poweredBy: 'NexWallet',
      isWalletRequired: true
    },
  ])
  const { setConfig, isAuthenticated, userData } = useConfigStore();
  const { handleLogout } = useAuthModal();

  const [savedAgents, setSavedAgents] = useState<SaveAgentApiServiceResponse[]>([]);

  const [businessTools, setBusinessTools] = useState([
    {
      id: 'hr1',
      name: 'HR Assistant Pro',
      description: 'Coming Soon. AI-powered HR assistant for recruitment, employee onboarding, and performance management.',
      poweredBy: 'NexAI HR',
      category: 'HR',
      isComingSoon: true
    },
    {
      id: 'legal1',
      name: 'Legal Document Analyzer',
      description: 'Coming Soon. AI-powered legal document analysis and contract review assistant.',
      poweredBy: 'NexAI Legal',
      category: 'Legal',
      isComingSoon: true
    },
    {
      id: 'compliance1',
      name: 'Compliance Guardian',
      description: 'Coming Soon. Automated compliance checking and regulatory adherence tool.',
      poweredBy: 'NexAI Compliance',
      category: 'Legal',
      isComingSoon: true
    },
    {
      id: 'recruit1',
      name: 'Smart Recruiter',
      description: 'Coming Soon. AI-powered candidate screening and interview scheduling assistant.',
      poweredBy: 'NexAI HR',
      category: 'HR',
      isComingSoon: true
    },
    {
      id: 'doc1',
      name: 'Document AI',
      description: 'Coming Soon. Intelligent document processing and management system.',
      poweredBy: 'NexAI Business',
      category: 'Business',
      isComingSoon: true
    },
    {
      id: 'market1',
      name: 'Market Analyzer',
      description: 'Coming Soon. AI-driven market analysis and trend prediction tool.',
      poweredBy: 'NexAI Business',
      category: 'Business',
      isComingSoon: true
    }
  ]);

  useEffect(() => {
    const fetchSavedAgents = async () => {
      try {
        const agents = await apiService.getMyAgents();
        setSavedAgents(agents);
      } catch (error) {
        console.error('Error fetching saved agents:', error);
      }
    };

    fetchSavedAgents();
  }, []);

  const handleAgentSelect = (agent: Agent) => {
    if (agent.id === '9') {
      router.push('/wallet/stellar');
      return;
    }
    // Determine if this is an onchain LLM
    const llmProvider = agent.id === '1' || agent.id === '2' || agent.id === '3' ? 'OpenAI' : 
                         agent.id === '4' ? 'llama_onchain' : ''; 
    
    // Check if this is an onchain model
    const isOnchain = llmProvider === 'llama_onchain';
    
    const config = {
      chains: agent.id === '1' ? [{ id: ChainId.SOLANA, name: 'Solana', isEmbedded: false, disabled: false, icon: '' }] :
        agent.id === '2' ? [{ id: ChainId.BASE, name: 'Base', isEmbedded: false, disabled: false, icon: '' }] :
          agent.id === '3' ? [{ id: ChainId.ETHEREUM, name: 'Ethereum', isEmbedded: false, disabled: false, icon: '' }] :
            agent.id === '4' ? [{ id: ChainId.BASE, name: 'Base with Llama 3.1', isEmbedded: false, disabled: false, icon: '' }] :
              agent.id === '5' ? [{ id: ChainId.ARBITRUM, name: 'Arbitrum', isEmbedded: false, disabled: false, icon: '' }] :
                agent.id === '6' ? [{ id: ChainId.OPTIMISM, name: 'Optimism', isEmbedded: false, disabled: false, icon: '' }] : [],
      llmProvider: llmProvider,
      agentType: agent.name,
      character: null,
      isPointSystemJoined: false,
      modelName: llmProvider, // Set modelName to match llmProvider
      isOnchain: isOnchain // Add isOnchain property
    }
    setConfig(config)
    router.push("/chat");
  }

  const handleLogoutClick = () => {
    handleLogout();
    router.refresh();
  };

  return (
    <AuthContextProvider>
      <AuthProvider>
        <main className={`min-h-screen ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-black to-gray-900 text-white' 
            : 'bg-gradient-to-b from-white to-gray-100 text-gray-900'
          } page-with-navbar`}>
          <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <Header />

            {/* Added Social Media Banner - Immediately visible */}
            <SocialMediaBanner />
            
            {/* Quick Actions Grid */}
            <QuickActions />

            {/* Predefined Agents */}
            <PredefinedAgents agents={predefinedAgents} onAgentSelect={handleAgentSelect} />

            {/* Business Tools Section */}
            <BusinessTools tools={businessTools} />

            {/* Saved Agents Section */}
            <SavedAgents agents={savedAgents} />

            {/* Upcoming Features Section */}
            <UpcomingFeatures />
          </div>
        </main>
      </AuthProvider>
    </AuthContextProvider>
  )
}
