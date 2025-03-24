import React from 'react';
import { Agent } from '../data';

interface PredefinedAgentsProps {
  agents: Agent[];
  onAgentSelect: (agent: Agent) => void;
}

const PredefinedAgents: React.FC<PredefinedAgentsProps> = ({ agents, onAgentSelect }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
        <span className="mr-2">🤖</span> Ready-to-Use Agents
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id}
            onClick={() => !agent.description.includes('Coming Soon') && onAgentSelect(agent)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {agent.poweredBy}
                </span>
                {agent.isWalletRequired && (
                  <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
  );
};

export default PredefinedAgents; 