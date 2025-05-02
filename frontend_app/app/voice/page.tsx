"use client";
import VoiceUI from "./components/VoiceUI";
import Starter from "./components/Starter";
import { useAppKitAccount } from "@reown/appkit/react";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header - With Purple Accent */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Voice-Powered</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Crypto Assistant</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Speak naturally to manage your crypto assets, send transactions, and get real-time information.
          </p>
        </div>
        
        {/* Wallet Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-purple-900/50">
              <h2 className="text-2xl font-bold mb-4 text-center text-white">
                Connect Your Wallet
              </h2>
              <p className="text-gray-300 mb-6 text-center">
                Please connect your wallet to continue using the voice chat.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <WalletButton />
                </div>
                <button
                  onClick={() => router.push('/app')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="relative">
          {/* Decorative Elements - Updated with Purple */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <RequireConfig>
              <SubscriptionWrapper>
                <div className="w-full">
                  {isConnected ? <VoiceUI /> : <Starter />}
                </div>
              </SubscriptionWrapper>
            </RequireConfig>
          </div>
        </div>
      </main>
    </div>
  );
}
