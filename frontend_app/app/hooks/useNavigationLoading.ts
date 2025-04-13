"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const startLoading = () => {
      setIsLoading(true);
    };

    const stopLoading = () => {
      setIsLoading(false);
    };

    // Start loading when navigation starts
    startLoading();

    // Stop loading after a short delay to allow for page content to be rendered
    // eslint-disable-next-line prefer-const
    timeoutId = setTimeout(stopLoading, 100);

    // Clean up on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, searchParams]);

  // Additional effect to ensure loading state is cleared when component mounts/unmounts
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  return isLoading;
} 