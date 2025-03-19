'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useConfigStore } from '../store/configStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChainId } from '../configurator/data'
import AuthProvider from '../providers/AuthProvider'
import useAuthModal from '../hooks/useAuthModal'
import { AuthProvider as AuthContextProvider } from '../context/AuthContext'
import { apiService, SaveAgentApiServiceResponse, SavedAgent } from '../services/ApiService'

interface Agent {
  id: string
  name: string
  description: string
  poweredBy: string
  isWalletRequired: boolean,
}

interface UserData {
  id: string;
  username: string;
  name: string;
}

// Add new interface for upcoming features
interface UpcomingFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  eta: string; // Estimated time of arrival
}

const TwitterLoginModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Connect with X</h3>
        
        {/* Added social media call-to-action */}
        <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-start space-x-3">
            <span className="text-xl">🚀</span>
            <div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Join our growing community on X for exclusive updates, early access to new features, and be the first to know about upcoming AI innovations!
              </p>
              <div className="flex items-center mt-2 text-xs text-purple-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span>Stay ahead of the curve</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* ... existing button code ... */}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  ])

  const { setConfig, setIsAuthenticated, isAuthenticated, userData } = useConfigStore();
  const { handleLogout } = useAuthModal();
  
  const [savedAgents, setSavedAgents] = useState<SaveAgentApiServiceResponse[]>([]);

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
    const config = {
      chains: agent.id === '1' ? [{ id: ChainId.SOLANA, name: 'Solana', isEmbedded: false, disabled: false, icon: '' }] : 
              agent.id === '2' ? [{ id: ChainId.BASE, name: 'Base', isEmbedded: false, disabled: false, icon: '' }] : 
              agent.id === '3' ? [{ id: ChainId.ETHEREUM, name: 'Ethereum', isEmbedded: false, disabled: false, icon: '' }] : 
              agent.id === '4' ? [{ id: ChainId.BASE, name: 'Base with Llama 3.1', isEmbedded: false, disabled: false, icon: '' }] : 
              agent.id === '5' ? [{ id: ChainId.ARBITRUM, name: 'Arbitrum', isEmbedded: false, disabled: false, icon: '' }] : 
              agent.id === '6' ? [{ id: ChainId.OPTIMISM, name: 'Optimism', isEmbedded: false, disabled: false, icon: '' }] : [],
      llmProvider: agent.id === '1' || agent.id === '2' || agent.id === '3' ? 'OpenAI' : '',
      agentType: agent.name,
      isPointSystemJoined: false
    }
    setConfig(config)
    router.push("/chat");
  }

  const handleLogoutClick = () => {
    handleLogout();
    router.refresh();
  };

  const upcomingFeatures: UpcomingFeature[] = [
    {
      id: 'voice-mod',
      name: 'Voice Modification',
      description: 'Customize your AI agent&apos;s voice with different accents and tones',
      icon: '🎙️',
      eta: 'Q2 2025'
    },
    {
      id: 'character-analysis',
      name: 'Character Analysis',
      description: 'AI-powered personality analysis and behavior prediction',
      icon: '🧠',
      eta: 'Q2 2025'
    },
    {
      id: 'specialized-agents',
      name: 'Specialized Agents',
      description: 'Topic-specific AI agents for finance, legal, tech, and more',
      icon: '🤖',
      eta: 'Q3 2025'
    }
  ];

  return (
    <AuthContextProvider>
      <AuthProvider>
        <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white page-with-navbar">
          <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <section className="mb-12 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome to NexAI <span className="text-purple-400">Agents</span>
                </h1>
                <p className="text-gray-400 max-w-2xl">
                  Your gateway to blockchain interaction through AI. Choose from our pre-built agents or create your own custom solution.
                </p>
              </div>
              
              {/* User Profile Section */}
              <div>
                {isAuthenticated && 
                  <div className="flex items-center bg-gray-800/50 rounded-lg p-2">
                    {userData && (
                      <div className="flex items-center mr-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2">
                          {userData.username[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{userData.name}</span>
                          <span className="text-xs text-gray-400">@{userData.username}</span>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={handleLogoutClick}
                      className="px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 mr-2">
                        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                }
              </div>
            </section>

            {/* Added Social Media Banner - Immediately visible */}
            <section className="mb-12">
              <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 
                            rounded-2xl border border-purple-500/20 p-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-purple-400">
                        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                      </svg>
                      <h2 className="text-xl font-bold text-white">Join Our Community</h2>
                    </div>
                    
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      Stay at the forefront of AI innovation! Follow us on X for exclusive updates, 
                      early access to new features, and be part of our growing community of AI enthusiasts.
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <a href="https://x.com/NexArb_" 
                         target="_blank"
                         rel="noopener noreferrer" 
                         className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 
                                  text-white rounded-lg transition-colors duration-200">
                        <span>Follow Us</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                      <span className="text-sm text-purple-400/80">Join 5k+ AI enthusiasts</span>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
                      <div className="absolute inset-2 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full"></div>
                      <span className="absolute inset-0 flex items-center justify-center text-6xl">🤖</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions Grid */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                <span className="mr-2">⚡</span> Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Create Agent Card */}
                <Link href="/configurator" 
                      className="group relative overflow-hidden p-6 bg-gradient-to-br from-purple-500/10 to-purple-700/10 
                               backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500 
                               transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                  <div className="relative">
                    <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-purple-400 group-hover:text-purple-300 mb-2">Create Agent</h3>
                    <p className="text-gray-400 text-sm mb-4">Build your custom AI agent with specific capabilities</p>
                    <div className="flex items-center text-purple-400/50 text-sm">
                      Get Started <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Import Agent Card */}
                <div className="relative overflow-hidden p-6 bg-gradient-to-br from-gray-800/30 to-gray-700/30 
                              backdrop-blur-sm rounded-xl border border-gray-700 cursor-not-allowed">
                  <div className="absolute top-3 right-3">
                    <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="p-3 bg-gray-700/20 rounded-xl w-fit mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Import Agent</h3>
                  <p className="text-gray-500 text-sm">Import your existing AI agent configuration</p>
                </div>

                {/* Voice Modification Preview Card */}
                <div className="relative overflow-hidden p-6 bg-gradient-to-br from-gray-800/30 to-gray-700/30 
                              backdrop-blur-sm rounded-xl border border-gray-700 cursor-not-allowed">
                  <div className="absolute top-3 right-3">
                    <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="p-3 bg-gray-700/20 rounded-xl w-fit mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Voice Customization</h3>
                  <p className="text-gray-500 text-sm">Customize your AI agent&apos;s voice and speaking style</p>
                </div>
              </div>
            </section>

            {/* Predefined Agents Section with improved cards */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                <span className="mr-2">🤖</span> Ready-to-Use Agents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predefinedAgents.map((agent) => (
                  <div key={agent.id} 
                       onClick={() => !agent.description.includes('Coming Soon') && handleAgentSelect(agent)}
                       className={`relative group overflow-hidden p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 
                                 backdrop-blur-sm rounded-xl border border-gray-700 
                                 ${!agent.description.includes('Coming Soon') ? 'hover:border-purple-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                                 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                    
                    <div className="relative">
                      <h3 className="text-xl font-semibold text-purple-400 group-hover:text-purple-300 mb-3">{agent.name}</h3>
                      <p className="text-gray-300 text-sm mb-6">{agent.description}</p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          {agent.poweredBy}
                        </span>
                        {agent.isWalletRequired && (
                          <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                            Wallet Required
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {agent.description.includes('Coming Soon') && (
                      <span className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Saved Agents Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                <span className="mr-2">📁</span> Your Saved Agents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedAgents.length > 0 ? (
                  savedAgents.map(agent => (
                    <div key={agent.id} className="relative overflow-hidden p-6 bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 
                                        hover:shadow-lg hover:shadow-purple-500/30">
                      <h3 className="text-xl font-semibold text-purple-300 mb-2">{agent.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{agent.agentType || 'No description available.'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          Powered by: {agent.chains?.map(chain => chain.name).join(', ')}
                        </span>
                        {agent.llmProvider && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                            {agent.llmProvider[0].name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center">No saved agents found.</p>
                )}
              </div>
            </section>

            {/* Upcoming Features Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                <span className="mr-2">🔮</span> Coming Soon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingFeatures.map((feature) => (
                  <div key={feature.id} 
                       className="relative overflow-hidden p-6 bg-gradient-to-br from-gray-800/30 to-gray-700/30 
                                 backdrop-blur-sm rounded-xl border border-gray-700">
                    <div className="absolute top-3 right-3">
                      <span className="bg-blue-500/80 text-white text-xs px-3 py-1 rounded-full">
                        {feature.eta}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-700/20 rounded-xl w-fit mb-4">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">{feature.name}</h3>
                    <p className="text-gray-500 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            
          </div>
        </main>
      </AuthProvider>
    </AuthContextProvider>
  )
}
