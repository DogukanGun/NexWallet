"use client";
import { useState, useEffect } from "react";
import VideoPlayer from "./components/VideoPlayer";
import { motion } from "framer-motion";
import Image from 'next/image';
import { LandingSection, FeatureCard, ChainCard, GradientButton } from "./components/LandingSection";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const chains = [
    { name: "Solana", icon: "/icons/solana.svg", active: true },
    { name: "BNB Chain", icon: "/icons/bnbchain.svg", active: true },
    { name: "Sonic EVM", icon: "/icons/sonic_svm.jpg", active: true },
    { name: "Base", icon: "/icons/base.svg", comingSoon: true },
    { name: "Ethereum", icon: "/icons/ethereum.svg", comingSoon: true},
    { name: "Arbitrum", icon: "/icons/arbitrum.svg", comingSoon: true },
    { name: "Optimism", icon: "/icons/optimism.svg", comingSoon: true },
    { name: "StarkNet", icon: "/icons/starknet.svg", comingSoon: true },
  ];

  const features = [
    {
      title: "Voice-Enabled Wallet Management",
      description: "Manage your crypto assets with simple voice commands. Send, receive, and check balances by just asking.",
      icon: "/icons/voice.svg",
    },
    {
      title: "Cross-Chain Support",
      description: "Seamlessly interact with multiple blockchains from a single interface, no need to switch between apps.",
      icon: "/icons/blockchain.svg",
    },
    {
      title: "AI-Powered Insights",
      description: "Get real-time market analysis, portfolio recommendations, and transaction explanations in plain language.",
      icon: "/icons/ai.svg",
    },
    {
      title: "Enhanced Security",
      description: "Maintain control of your assets with AI-assisted security checks and transaction verification.",
      icon: "/icons/security.svg",
    },
  ];

  const businessSolutions = [
    {
      title: "HR Assistant Pro",
      description: "Coming Soon: AI-powered recruitment, onboarding, and performance management.",
      icon: "👥",
      comingSoon: true
    },
    {
      title: "Legal Document Analyzer",
      description: "Coming Soon: Intelligent contract review and legal document processing.",
      icon: "⚖️",
      comingSoon: true
    },
    {
      title: "Compliance Guardian",
      description: "Coming Soon: Automated regulatory compliance and risk management.",
      icon: "🛡️",
      comingSoon: true
    },
  ];

  const useCases = [
    {
      title: "Crypto & DeFi",
      description: "Simplify blockchain interactions with voice commands and AI assistance.",
      icon: "🌐",
    },
    {
      title: "Enterprise Solutions",
      description: "Coming Soon: Streamline business operations with AI-powered tools.",
      icon: "🏢",
    },
    {
      title: "Legal & Compliance",
      description: "Coming Soon: Automate legal processes and ensure regulatory compliance.",
      icon: "📜",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url(/nexarb.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-base-100/90 via-base-100/70 to-base-100/90 backdrop-blur-sm z-10" />
        
        <div className="relative z-20 container-styled min-h-screen flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-7xl font-extrabold mb-6 text-gradient-primary">
              NexAI Marketplace
            </h1>
            <h2 className="text-3xl font-bold mb-6 text-base-content">
              AI-Powered Solutions for Blockchain & Business
            </h2>
            <p className="text-xl mb-8 text-base-content/80 max-w-2xl mx-auto">
              From crypto management to enterprise solutions, NexAI brings intelligent automation to every industry. Experience the future of AI-powered tools.
            </p>

            <div className="flex flex-row sm:flex-row justify-center gap-6 items-center">
              <button
                onClick={handleOpenModal}
                className="btn btn-primary rounded-full text-white"
              >
                Watch Demo
              </button>
              <a
                href="#solutions"
                className="btn btn-neutral rounded-full text-white"
              >
                Explore Solutions
              </a>
            </div>
          </motion.div>
        </div>

        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-primary opacity-20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-secondary opacity-20 rounded-full blur-3xl"
          />
        </div>
      </div>

      {/* Use Cases Section */}
      <LandingSection id="solutions" gradient="primary">
        <h2 className="text-4xl font-bold mb-12 text-center text-gradient-primary">
          Comprehensive AI Solutions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="card-styled p-6 text-center"
            >
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
              <p className="text-base-content/80">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </LandingSection>

      {/* Blockchain Features Section */}
      <LandingSection gradient="secondary">
        <h2 className="text-4xl font-bold mb-12 text-center text-gradient-secondary">
          Blockchain Solutions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </LandingSection>

      {/* Business Solutions Section */}
      <LandingSection gradient="neutral">
        <h2 className="text-4xl font-bold mb-12 text-center text-gradient-primary">
          Enterprise Solutions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businessSolutions.map((solution, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="card-styled p-6 text-center relative overflow-hidden"
            >
              <div className="text-4xl mb-4">{solution.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
              <p className="text-base-content/80">{solution.description}</p>
              {solution.comingSoon && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 text-black">
                    Coming Soon
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </LandingSection>

      {/* Chains Section */}
      <LandingSection gradient="secondary">
        <h2 className="text-4xl font-bold mb-12 text-center text-gradient-secondary">
          Supported Chains
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chains.map((chain, index) => (
            <ChainCard key={index} {...chain} />
          ))}
        </div>
      </LandingSection>

      {/* Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="modal-styled w-full max-w-2xl relative bg-base-100 rounded-lg overflow-hidden">
            <button
              onClick={handleCloseModal}
              className="absolute -top-4 -right-4 btn btn-circle btn-md bg-red-500 hover:bg-red-600 text-white border-none shadow-lg z-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video w-full">
              <VideoPlayer 
                videoUrl="https://www.youtube.com/watch?v=fIx24i4zyTw"
                onClose={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
