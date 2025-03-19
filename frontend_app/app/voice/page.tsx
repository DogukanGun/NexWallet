"use client";
import VoiceUI from "./components/VoiceUI";
import Starter from "./components/Starter";
import { useAppKitAccount } from "../config";
import RequireConfig from "../components/RequireConfig";
import SubscriptionWrapper from "../providers/SubscriptionWrapper";
import { useEffect, useState } from "react";
import { useConfigStore } from "../store/configStore";
import WalletButton from "../components/WalletButton";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isConnected } = useAppKitAccount();
  const router = useRouter();
  const [showWalletModal, setShowWalletModal] = useState(false);
  // Check wallet connection on mount and when connection status changes
  useEffect(() => {
    // Check if the user has configured a chain with an embedded wallet
    const hasUserWallet = useConfigStore.getState().chains.some(chain => !chain.isEmbedded);

    if (!isConnected && hasUserWallet) {
      setShowWalletModal(true);
    } else {
      setShowWalletModal(false);
    }
  }, [isConnected]);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Please connect your wallet to continue using the voice chat.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <WalletButton />
              </div>
              <button
                onClick={() => router.push('/app')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )}
      <RequireConfig>
        <SubscriptionWrapper>
          <div className="w-full">
            {isConnected ? <VoiceUI /> : <Starter />}
          </div>
        </SubscriptionWrapper>
      </RequireConfig>
    </main>
  );
}
