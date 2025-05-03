"use client";
import { modal } from "../config";
import { createContext, useContext, ReactNode } from "react";
import logger from '../lib/logger';
import { AppKit } from "@reown/appkit/react";

// Initialize WalletConnect with the logger
if (typeof window !== 'undefined') {
  (window as any).pino = logger;
}

interface AppKitContextType extends AppKit {}

// Create a context to hold the modal instance
export const AppKitContext = createContext<AppKitContextType>(modal as AppKitContextType);

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