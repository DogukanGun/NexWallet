import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { apiService } from '../../services/ApiService';
import { AppChain } from '../data';

interface SaveAgentModalProps {
  onClose: () => void;
  agentName: string;
  setAgentName: (name: string) => void;
  selectedChains: AppChain[];
  selectedLLM: string;
  selectedAgentType: string;
  setSavedAgents: React.Dispatch<React.SetStateAction<any[]>>;
}

export const SaveAgentModal = ({
  onClose,
  agentName,
  setAgentName,
  selectedChains,
  selectedLLM,
  selectedAgentType,
  setSavedAgents
}: SaveAgentModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when modal opens
    inputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!agentName.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const agentData = {
        name: agentName,
        chains: selectedChains.map((chain: AppChain) => chain.id),
        llmProvider: selectedLLM,
        agentType: selectedAgentType,
        description: `Agent configured with ${selectedChains.map(c => c.name).join(', ')} chains`,
      };

      const savedAgent = await apiService.saveAgent(agentData);
      
      setSavedAgents(prev => [...prev, {
        ...savedAgent,
        chains: selectedChains,
        createdAt: new Date().toISOString(),
      }]);

      setAgentName('');
      onClose();
    } catch (error) {
      console.error('Error saving agent:', error);
      setError('Failed to save agent. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Save Your Agent</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter a name for your agent"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ref={inputRef}
            />
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-gray-300">Configuration Summary:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Chains: {selectedChains.map(c => c.name).join(', ')}</li>
              <li>• LLM Provider: {selectedLLM}</li>
              <li>• Agent Type: {selectedAgentType}</li>
            </ul>
          </div>
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={!agentName.trim() || isSaving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                disabled:opacity-50 hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                'Save Agent'
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 