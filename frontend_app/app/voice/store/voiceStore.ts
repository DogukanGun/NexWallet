import { UIMessage } from 'ai';
import { create } from 'zustand';

export interface ExtendedUIMessage extends UIMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface VoiceStore {
  voiceHistory: ExtendedUIMessage[];
  isListening: boolean;
  isProcessing: boolean;
  isAIResponding: boolean;
  setVoiceHistory: (history: ExtendedUIMessage[] | ((prev: ExtendedUIMessage[]) => ExtendedUIMessage[])) => void;
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
  setVoiceHistory: (history: ExtendedUIMessage[] | ((prev: ExtendedUIMessage[]) => ExtendedUIMessage[])) => set((state) => ({
    voiceHistory: typeof history === 'function' ? history(state.voiceHistory) : history
  })),
  setIsListening: (isListening) => set({ isListening }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setIsAIResponding: (isAIResponding) => set({ isAIResponding }),
  clearHistory: () => set({ voiceHistory: [] }),
})); 