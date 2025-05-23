import { AppChain } from '../configurator/data'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserData {
  id: string;
  username: string;
  name: string;
}

export interface Config {
  chains: AppChain[];
  llmProvider: string;
  agentType: string;
  isPointSystemJoined: boolean;
  selectedVoice?: string;
  modelName: string;
  character: string | null;
  isOnchain: boolean;
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
  selectedVoice: string;
  character: string | null;
  setConfig: (config: Config) => void
  clearConfig: () => void
  setPremiumVerified: (verified: boolean) => void
  getFeatures: () => { value: string; label: string; }[]
  setIsAuthenticated: (auth: boolean, userData?: UserData | null) => void
  setUserData: (data: UserData | null) => void
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
      selectedVoice: 'voice1',
      character: null,
      setConfig: (config) => 
        set((state) => ({ 
          ...state,
          ...config,
          isConfigured: true,
          selectedVoice: config.selectedVoice || state.selectedVoice
        })),
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
          selectedVoice: 'voice1',
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
      setUserData: (data: UserData | null) => set({ userData: data }),
    }),
    {
      name: 'app-config',
    }
  )
) 