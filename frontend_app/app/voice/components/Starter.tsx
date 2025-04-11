import { useEffect, useMemo, useState } from "react";
import Siriwave from "react-siriwave";
import "@reown/appkit-wallet-button/react";
import WalletButton from "@/app/components/WalletButton";
import { useAppKitAccount } from "@reown/appkit/react";
import { FaMicrophone, FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const Starter = () => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { address, isConnected } = useAppKitAccount();
  const [showInfoBox, setShowInfoBox] = useState(false);
  
  useEffect(() => {
    const audio = new Audio();
    audio.src = "/WelcomeMessage.mp3";
    audio.play();
    setAudio(audio);
    audio.onended = () => {
      setAudio(null);
    };
    return () => {
      audio.pause();
      setAudio(null);
    };
  }, []);

  const handleAudio = useMemo(() => {
    return audio !== null && audio.currentTime > 0 && !audio.paused && !audio.ended;
  }, [audio]);

  return (
    <div className="w-full relative">
      <div className="flex flex-col items-center justify-center py-12 px-4">
        {/* Audio Visualizer */}
        <div className="w-full max-w-md mb-8">
          {audio != null ? (
            <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Welcome to NexWallet Voice</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Listening to welcome message...</p>
              </div>
              <Siriwave theme="ios9" autostart={handleAudio} speed={0.15} amplitude={1.5} />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center mb-8">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <FaMicrophone className="text-blue-600 dark:text-blue-400 text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Wallet</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  To start using the voice assistant, please connect your wallet first.
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <WalletButton />
                
                <button
                  onClick={() => setShowInfoBox(!showInfoBox)}
                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <FaInfoCircle className="mr-1" />
                  <span>{showInfoBox ? "Hide information" : "How does this work?"}</span>
                </button>
              </div>
              
              {showInfoBox && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300"
                >
                  <h4 className="font-medium mb-2">Voice Assistant Features:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Send cryptocurrency to other wallets</li>
                    <li>Check your balance and transaction history</li>
                    <li>Get real-time market information</li>
                    <li>Execute trades and swap tokens</li>
                    <li>Manage your digital assets with natural language</li>
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Starter;
