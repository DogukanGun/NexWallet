"use client";
import '../lib/buffer-polyfill';
import { modal } from "../config";
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import logger from '../lib/logger';
import { AppKit } from "@reown/appkit/react";
import ErrorBoundary from '../components/ErrorBoundary';

// Initialize WalletConnect with the logger
if (typeof window !== 'undefined') {
  (window as any).pino = logger;
  
  // Add a global error handler for uncaught promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    // Check if this is a buffer error we want to ignore
    if (event.reason && event.reason.message && 
        (event.reason.message.includes("Dynamic require of \"buffer\"") ||
         event.reason.message.includes("Cannot read properties of undefined"))) {
      
      // Log it but prevent app from crashing
      console.warn('Caught buffer-related error (continuing anyway):', event.reason);
      event.preventDefault();
    }
  });
}

interface AppKitContextType extends AppKit {}

// Create a context to hold the modal instance
export const AppKitContext = createContext<AppKitContextType>(modal as AppKitContextType);

// Export a hook to use the AppKit modal
export function useAppKit() {
  return useContext(AppKitContext);
}

export default function AppKitProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  
  // Allow the app to render even if there are buffer-related errors
  useEffect(() => {
    try {
      // This marks the component as ready to render its children
      setIsReady(true);
    } catch (error) {
      console.error("Error in AppKitProvider:", error);
      // Still mark as ready so the app can continue
      setIsReady(true);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppKitContext.Provider value={modal}>
        {children}
      </AppKitContext.Provider>
    </ErrorBoundary>
  );
} 