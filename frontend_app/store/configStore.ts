import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConfigState {
  chains: any[];
  llmProvider: string;
  agentType: string;
  isPointSystemJoined: boolean;
  selectedVoice: string;
  temperature: number;
  modelName: string;
  isOnchain: boolean;
  character: string;
  isAuthenticated: boolean;
  userData: any;
  setConfig: (config: Partial<ConfigState>) => void;
  setAuthentication: (isAuthenticated: boolean, userData?: any) => void;
  reset: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      chains: [],
      llmProvider: '',
      agentType: '',
      isPointSystemJoined: false,
      selectedVoice: 'voice1',
      temperature: 0.7,
      modelName: 'gpt-4',
      isOnchain: false,
      character: 'Pirate', // Default character
      isAuthenticated: false,
      userData: null,
      setConfig: (config) => set((state) => ({ ...state, ...config })),
      setAuthentication: (isAuthenticated, userData) => set(() => ({ isAuthenticated, userData })),
      reset: () => set(() => ({
        chains: [],
        llmProvider: '',
        agentType: '',
        isPointSystemJoined: false,
        selectedVoice: 'voice1',
        temperature: 0.7,
        modelName: 'gpt-4',
        isOnchain: false,
        character: 'Pirate',
        isAuthenticated: false,
        userData: null
      }))
    }),
    {
      name: 'config-storage',
    }
  )
); 