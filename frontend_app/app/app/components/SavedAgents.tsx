import { SaveAgentApiServiceResponse } from '@/app/services/ApiService';
import React from 'react';

interface SavedAgentsProps {
  agents: SaveAgentApiServiceResponse[];
}

const SavedAgents: React.FC<SavedAgentsProps> = ({ agents }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
        <span className="mr-2">📁</span> Your Saved Agents
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.length > 0 ? (
          agents.map(agent => (
            <div key={agent.id} className="relative overflow-hidden p-6 bg-gray-800 rounded-lg border border-gray-700 transition-all duration-300 
                                hover:shadow-lg hover:shadow-purple-500/30">
              <h3 className="text-xl font-semibold text-purple-300 mb-2">{agent.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{agent.agentType || 'No description available.'}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Powered by: {agent.chains?.map(chain => chain.name).join(', ')}
                </span>
                {agent.llmProvider && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
  );
};

export default SavedAgents; 