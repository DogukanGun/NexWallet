import { AppChain } from '../configurator/data'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserData {
  id: string;
  username: string;
  name: string;
}

interface ConfigState {
  chains: AppChain[]
  llmProvider: string
  agentType: string
  isConfigured: boolean
  isOnchain: boolean
  isPremiumVerified: boolean
  knowledgeBase: string[]
  isPointSystemJoined: boolean
  isAuthenticated: boolean
  userData: UserData | null;
  setConfig: (config: { chains: AppChain[]; llmProvider: string; agentType: string; isPointSystemJoined: boolean }) => void
  clearConfig: () => void
  setPremiumVerified: (verified: boolean) => void
  getFeatures: () => { value: string; label: string; }[]
  setIsAuthenticated: (auth: boolean, userData?: UserData | null) => void
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
      isAuthenticated: false,
      userData: null,
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
          isPointSystemJoined: false,
          isAuthenticated: false,
          userData: null,
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
      setIsAuthenticated: (auth, userData) => {
        set({ isAuthenticated: auth, userData });
        // Save to session storage
        sessionStorage.setItem('isAuthenticated', JSON.stringify(auth));
        sessionStorage.setItem('userData', JSON.stringify(userData));
      },
    }),
    {
      name: 'app-config',
    }
  )
) 