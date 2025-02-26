"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingOverlay from "./components/LoadingOverlay";

export default function Template({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {isLoading && <LoadingOverlay />}
      {children}
    </>
  );
}
