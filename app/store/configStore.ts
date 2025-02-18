import { AppChain } from '../configurator/data'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ConfigState {
  chains: AppChain[]
  llmProvider: string
  agentType: string
  isConfigured: boolean
  isOnchain: boolean
  isPremiumVerified: boolean
  knowledgeBase: string[]
  isPointSystemJoined: boolean
  setConfig: (config: { chains: AppChain[]; llmProvider: string; agentType: string; isPointSystemJoined: boolean }) => void
  clearConfig: () => void
  setPremiumVerified: (verified: boolean) => void
  getFeatures: () => { value: string; label: string; }[]
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      chains: [],
      llmProvider: '',
      agentType: '',
      isConfigured: false,
      isOnchain: false,
      isPremiumVerified: false,
      knowledgeBase: [],
      isPointSystemJoined: false,
      setConfig: (config) => 
        set({ ...config, isConfigured: true }),
      clearConfig: () => 
        set({ 
          chains: [], 
          llmProvider: '', 
          agentType: '', 
          isConfigured: false,
          isOnchain: false,
          isPremiumVerified: false,
          knowledgeBase: [],
          isPointSystemJoined: false
        }),
      setPremiumVerified: (verified) =>
        set({ isPremiumVerified: verified }),
      getFeatures: () => {
        const { chains, llmProvider, isPointSystemJoined } = get();
        const features = [];
        
        if (chains.length > 0) {
          chains.forEach(chain => {
            features.push({ value: chain.name, label: "chain" });
          });
          features.push({ value: llmProvider, label: "LLM Provider" });
        }
        if (isPointSystemJoined) {
          features.push({ value: "Point System", label: "Joined Point System" });
        }
        return features;
      },
    }),
    {
      name: 'app-config',
    }
  )
) 