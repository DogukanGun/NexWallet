import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Chain {
  chainId: number;
  name: string;
  address: string;
  isEmbedded: boolean;
}

export interface KnowledgeBase {
  id: string;
  name: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  disabled: boolean;
}

interface ConfigState {
  chains: Chain[];
  knowledgeBases: KnowledgeBase[];
  llmProvider: string;
  agentType: string;
  setChains: (chains: Chain[]) => void;
  setKnowledgeBases: (knowledgeBases: KnowledgeBase[]) => void;
  setLLMProvider: (provider: string) => void;
  setAgentType: (type: string) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      chains: [],
      knowledgeBases: [],
      llmProvider: 'openai',
      agentType: 'text',
      setChains: (chains) => set({ chains }),
      setKnowledgeBases: (knowledgeBases) => set({ knowledgeBases }),
      setLLMProvider: (llmProvider) => set({ llmProvider }),
      setAgentType: (agentType) => set({ agentType }),
    }),
    {
      name: 'config-storage',
    }
  )
); 