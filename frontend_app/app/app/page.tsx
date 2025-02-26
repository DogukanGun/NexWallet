'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useConfigStore } from '../store/configStore'
import { useRouter } from 'next/navigation'
import { ChainId } from '../configurator/data'

interface Agent {
  id: string
  name: string
  description: string
  poweredBy: string
  isWalletRequired: boolean,
  requiresPrivy?: boolean
}

export default function Home() {
  const router = useRouter();
  const [predefinedAgents, setPredefinedAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Solana AI Bot',
      description: 'Interact with Solana blockchain, manage tokens, and get real-time information. Works in text and voice mode.',
      poweredBy: 'SendAI',
      requiresPrivy: false,
      isWalletRequired: true
    },
    {
      id: '2',
      name: 'Base AI Bot',
      description: 'Navigate Base network, handle transactions, and access DeFi protocols. Works in text mode only.',
      poweredBy: 'OpenAI',
      requiresPrivy: true,
      isWalletRequired: false
    },
    {
      id: '3',
      name: 'Ethereum AI Bot',
      description: 'Manage Ethereum assets, interact with smart contracts, and explore the ecosystem. Works in text mode only.',
      poweredBy: 'Coinbase Agent Kit',
      requiresPrivy: true,
      isWalletRequired: false
    },
    {
      id: '4',
      name: 'Base with Llama 3.1',
      description: 'Coming Soon. Interact with Base network using Llama 3.1. Works in text mode only.',
      poweredBy: 'Gaia OnChain',
      requiresPrivy: true,
      isWalletRequired: false
    }
  ])

  const setConfig = useConfigStore((state) => state.setConfig)

  const handleAgentSelect = (agent: Agent) => {
    const config = {
      chains: agent.id === '1' ? [{ id: ChainId.SOLANA, name: 'Solana', isEmbedded: false, disabled: false, icon: '' }] : 
              agent.id === '2' ? [{ id: ChainId.BASE, name: 'Base', isEmbedded: false, disabled: false, icon: '' }] : 
              agent.id === '3' ? [{ id: ChainId.ETHEREUM, name: 'Ethereum', isEmbedded: false, disabled: false, icon: '' }] : 
              agent.id === '4' ? [{ id: ChainId.BASE, name: 'Base with Llama 3.1', isEmbedded: false, disabled: false, icon: '' }] : [],
      llmProvider: agent.id === '1' || agent.id === '2' || agent.id === '3' ? 'OpenAI' : '',
      agentType: agent.name,
      isPointSystemJoined: false
    }
    setConfig(config)
    router.push("/chat");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b bg-black text-white page-with-navbar">
      <div className="container mx-auto px-4 py-8">
        {/* Main Actions Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Create Your AI Agent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Configurator Card */}
            <Link href="/configurator" 
                  className="block h-[200px] p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Configurator</h3>
              <p className="text-gray-300 text-sm">Create and customize your own AI agent</p>
            </Link>

            {/* Import Agent Card (Disabled) */}
            <div className="relative h-[200px] p-6 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700 cursor-not-allowed">
              <div className="absolute top-3 right-3">
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-400">Import Agent</h3>
              <p className="text-gray-500 text-sm">Import your existing AI agent configuration</p>
            </div>
          </div>
        </section>

        {/* Predefined Agents Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Predefined Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predefinedAgents.map((agent) => (
              <div key={agent.id} 
                   className={`relative h-[200px] p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 ${agent.description.includes('Coming Soon') ? 'opacity-50 cursor-not-allowed' : ''}`}
                   onClick={() => handleAgentSelect(agent)}>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">{agent.name}</h3>
                <p className="text-gray-300 text-sm mb-8">{agent.description}</p>
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Powered by {agent.poweredBy}
                  </span>
                  {agent.requiresPrivy && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      Requires Privy Login
                    </span>
                  )}
                  {agent.isWalletRequired && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      Requires Wallet
                    </span>
                  )}
                </div>
                {agent.description.includes('Coming Soon') && (
                  <span className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
                {agent.name === 'Base with Llama 3.1' && (
                  <span className="absolute top-3 right-24 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    On Chain Bot
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Saved Agents Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Saved Agents
          </h2>
          <div className="h-[200px] p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 flex items-center justify-center">
            <p className="text-gray-300 text-sm text-center">
              Your saved agents will appear here
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
