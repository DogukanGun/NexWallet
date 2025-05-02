"use client";

import { useNavigationLoading } from "../hooks/useNavigationLoading";
import { useNavigationLoadingContext } from "../context/NavigationLoadingContext";
import LoadingOverlay from "./LoadingOverlay";

export default function NavigationLoader() {
  const isNavigating = useNavigationLoading();
  const { isLoading } = useNavigationLoadingContext();

  // Show loading overlay if either navigation is in progress or manual loading is active
  if (!isNavigating && !isLoading) return null;

  return <LoadingOverlay />;
} 