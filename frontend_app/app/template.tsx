"use client";
import NavigationLoader from "./components/NavigationLoader";
import { NavigationLoadingProvider } from "./context/NavigationLoadingContext";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <NavigationLoadingProvider>
      <NavigationLoader />
      {children}
    </NavigationLoadingProvider>
  );
}
