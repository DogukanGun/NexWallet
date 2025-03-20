import { useEffect, useState } from 'react';
import { apiService,SaveAgentApiServiceResponse,SavedAgent } from '../../services/ApiService'; // Ensure the correct import path

const SavedAgentsModal = ({ onClose }: { onClose: () => void }) => {
  const [savedAgents, setSavedAgents] = useState<SaveAgentApiServiceResponse[]>([]);

  useEffect(() => {
    const loadSavedAgents = async () => {
      try {
        const agents = await apiService.getMyAgents();
        setSavedAgents(agents);
      } catch (error) {
        console.error('Error loading saved agents:', error);
      }
    };

    loadSavedAgents();
  }, []); // Empty dependency array to run only on mount

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Your Saved Agents</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        {savedAgents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>You haven't saved any agents yet.</p>
            <p className="text-sm mt-2">Save your first agent configuration to see it here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-white">{agent.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Created {new Date(agent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Load
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.chains.map((chain) => (
                    <span
                      key={chain.id}
                      className="text-xs px-2 py-1 bg-gray-600 rounded-full text-gray-300"
                    >
                      {chain.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAgentsModal; 