import { create } from 'zustand';

export interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAudioPlaying?: boolean;
}

interface VoiceStore {
  voiceHistory: Message[];
  isListening: boolean;
  isProcessing: boolean;
  isAIResponding: boolean;
  setVoiceHistory: (history: Message[] | ((prev: Message[]) => Message[])) => void;
  setIsListening: (isListening: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setIsAIResponding: (isAIResponding: boolean) => void;
  clearHistory: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  voiceHistory: [],
  isListening: false,
  isProcessing: false,
  isAIResponding: false,
  setVoiceHistory: (history) => set((state) => ({
    voiceHistory: typeof history === 'function' ? history(state.voiceHistory) : history
  })),
  setIsListening: (isListening) => set({ isListening }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setIsAIResponding: (isAIResponding) => set({ isAIResponding }),
  clearHistory: () => set({ voiceHistory: [] }),
})); 