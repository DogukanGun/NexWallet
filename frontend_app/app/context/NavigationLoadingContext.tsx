"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface NavigationLoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useNavigationLoadingContext = () => useContext(NavigationLoadingContext);

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}
