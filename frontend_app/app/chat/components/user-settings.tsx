"use client";

import { Button } from "./ui/button";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useConfigStore } from "@/app/store/configStore";
import FeaturePopup from './FeaturePopup';

export default function UserSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { address } = useAppKitAccount();
  const { open, close } = useAppKit();

  const selectedChains = useConfigStore.getState().chains;
  const hasEmbeddedWallet = selectedChains.some(chain => chain.isEmbedded);
  const hasUserWallet = selectedChains.some(chain => !chain.isEmbedded);
  console.log("Features from config store:", hasEmbeddedWallet, hasUserWallet); // Check this output
  const features = useConfigStore.getState().getFeatures();
  console.log("Features from config store:", features); // Check this output

  return (
    <div>
      <div className="flex flex-col gap-2">
        {hasEmbeddedWallet && (
          <Button
            variant="default"
            onClick={() => setIsPopupOpen(true)}
            className="flex justify-start gap-3 w-full h-14 text-base font-normal items-center"
          >
            Bot Features
          </Button>
        )}

        {hasUserWallet && (
          <Button
            variant="default"
            onClick={() => open()}
            className="flex justify-start gap-3 w-full h-14 text-base font-normal items-center"
          >
            Open AppKit
          </Button>
        )}
      </div>

      <div className="text-xs truncate">
        {isLoading ? <Skeleton className="w-20 h-4" /> : address || "Anonymous"}
      </div>

      <FeaturePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        features={features}
      />
    </div>
  );
}
