"use client";
import { modal } from "../config";
import { createContext, useContext, ReactNode } from "react";
import logger from '../lib/logger';

// Initialize WalletConnect with the logger
if (typeof window !== 'undefined') {
  (window as any).pino = logger;
}

// Create a context to hold the modal instance
const AppKitContext = createContext(modal);

// Export a hook to use the AppKit modal
export function useAppKit() {
  return useContext(AppKitContext);
}

export default function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <AppKitContext.Provider value={modal}>
      {children}
    </AppKitContext.Provider>
  );
} 