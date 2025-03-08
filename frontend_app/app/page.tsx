"use client";
import { useState, useEffect } from "react";
import VideoPlayer from "./components/VideoPlayer";
import { motion } from "framer-motion";
import Image from 'next/image';

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
    { name: "Base", icon: "/icons/base.svg", active: true },
    { name: "Ethereum", icon: "/icons/ethereum.svg", active: true },
    { name: "Arbitrum", icon: "/icons/arbitrum.svg", active: true },
    { name: "Optimism", icon: "/icons/optimism.svg", active: true },
    { name: "BNB Chain", icon: "/icons/bnbchain.svg", comingSoon: true },
    { name: "Sonic EVM", icon: "/icons/sonic_svm.jpg", comingSoon: true },
    { name: "StarkNet", icon: "/icons/starknet.svg", comingSoon: true },
  ];

  const knowledgeBases = [
    { name: "Cookie.dao", icon: "/icons/cookiefun.png", active: true },
    { name: "ChainLink", icon: "/icons/chainlink.svg", comingSoon: true },
  ];

  const walletIntegrations = [
    { name: "Reown Wallet", icon: "/icons/reown.svg", active: true },
    { name: "MetaMask", icon: "/icons/metamask.svg", active: true },
    { name: "Phantom", icon: "/icons/phantom.svg", active: true, comingSoon: false},
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

  const useCases = [
    {
      title: "Crypto Newcomers",
      description: "Simplifies the complex world of blockchain with natural language interaction.",
      icon: "👨‍💻",
    },
    {
      title: "DeFi Enthusiasts",
      description: "Provides quick access to multiple protocols without navigating complex interfaces.",
      icon: "📈",
    },
    {
      title: "NFT Collectors",
      description: "Easily manage and track your digital art collection across platforms.",
      icon: "🖼️",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section - Updated with clearer value proposition */}
      <div
        className="hero min-h-screen relative"
        style={{
          backgroundImage: "url(/nexarb.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay bg-opacity-70 bg-gradient-to-b from-purple-900/80 to-orange-500/80"></div>
        
        <div className="hero-content text-neutral-content z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl relative"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-7xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                NexAI
              </h1>
              <h2 className="text-3xl font-bold mb-6 text-center text-white">
                Your AI-Powered Crypto Assistant
              </h2>
              <p className="text-xl mb-8 font-light text-white drop-shadow-md text-center max-w-2xl mx-auto">
                Interact with your crypto wallets through natural conversation. NexAI simplifies blockchain management with voice commands and AI intelligence.
                Your AI-Powered Crypto Assistant&apos;s features are designed to enhance your experience.
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenModal}
                className="px-10 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(251,146,60,0.5)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 text-lg"
              >
                Watch Demo
              </motion.button>
              
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 text-lg"
              >
                Learn More
              </motion.a>
            </div>

            <div className="absolute -z-10 w-[200px] h-[200px] bg-orange-500/30 rounded-full blur-3xl left-1/2 transform -translate-x-1/2"></div>
          </motion.div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
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
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
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
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"
          />
        </div>
        
        {/* Floating tech symbols */}
        <div className="absolute w-full h-full pointer-events-none overflow-hidden">
          {['₿', 'Ξ', 'Ӿ', '◎', '₳'].map((symbol, index) => (
            <motion.div
              key={index}
              initial={{ y: -20, x: Math.random() * 100 - 50, opacity: 0 }}
              animate={{ 
                y: ['0vh', '100vh'],
                opacity: [0, 1, 1, 0],
                x: (Math.random() * 100 - 50) + index * 200
              }}
              transition={{ 
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                delay: index * 2,
                ease: "linear"
              }}
              className="absolute text-white/20 text-4xl font-bold"
            >
              {symbol}
            </motion.div>
          ))}
        </div>
      </div>

      {/* How it Works Section - New */}
      <section id="features" className="py-20 bg-gradient-to-b from-black to-purple-900/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              How NexAI Works
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              NexAI brings the power of conversational AI to your crypto experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="rounded-xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-gray-700/50">
                <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
                  <Image
                    src="/icons/demo-interface.png" 
                    alt="NexAI Interface"
                    width={600}
                    height={350}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleOpenModal}
                      className="px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-lg z-10"
                    >
                      Watch Demo
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-6 text-white">Talk to Your Wallet</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500/20 p-3 rounded-full">
                    <span className="text-orange-400 font-bold">01</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h4>
                    <p className="text-gray-300">
                      Easily connect your preferred crypto wallet with a single click
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500/20 p-3 rounded-full">
                    <span className="text-orange-400 font-bold">02</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Ask What You Need</h4>
                    <p className="text-gray-300">
                      Use natural language to request transactions, check balances, or get market insights
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500/20 p-3 rounded-full">
                    <span className="text-orange-400 font-bold">03</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Confirm and Execute</h4>
                    <p className="text-gray-300">
                      Review the AI&apos;s actions and confirm transactions with your wallet&apos;s security
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features - New */}
      <section className="py-20 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Key Features
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              NexAI combines AI intelligence with blockchain technology to simplify your crypto experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="p-8 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-orange-500/50 h-full flex flex-col">
                  <div className="mb-6 bg-orange-500/20 w-16 h-16 flex items-center justify-center rounded-full">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={30}
                      height={30}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 flex-grow">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases - New */}
      <section className="py-20 bg-gradient-to-b from-black to-purple-900/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Perfect For
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              NexAI helps various users simplify their blockchain interactions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="p-8 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-orange-500/50 h-full">
                  <div className="text-5xl mb-6">{useCase.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-4">{useCase.title}</h3>
                  <p className="text-gray-300">{useCase.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chains Section - Updated with better description */}
      <section className="py-20 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Supported Chains
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              NexAI works across major blockchain networks, allowing you to manage all your assets with a single interface
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {chains.map((chain, index) => (
              <motion.div
                key={chain.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-orange-500/50 ${chain.comingSoon ? 'opacity-70' : ''}`} style={{ height: '180px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4">
                      <Image
                        src={chain.icon}
                        alt={`${chain.name} logo`}
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">{chain.name}</h3>
                      {chain.comingSoon && (
                        <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full whitespace-nowrap">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrated Sections - Combines knowledge base and wallet integrations */}
      <section className="py-20 bg-gradient-to-b from-black to-purple-900/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Knowledge Base Integration */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  Knowledge Base Integration
                </h2>
                <p className="text-gray-300 mb-8">
                  NexAI connects to specialized blockchain data providers, ensuring you get accurate and real-time information for all your queries
                </p>
              </motion.div>

              <div className="grid grid-cols-2 gap-6">
                {knowledgeBases.map((kb, index) => (
                  <motion.div
                    key={kb.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    <div className={`p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-orange-500/50 ${kb.comingSoon ? 'opacity-70' : ''}`} style={{ height: '180px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 flex items-center justify-center mb-4">
                          <Image
                            src={kb.icon}
                            alt={`${kb.name} logo`}
                            width={50}
                            height={50}
                            className="object-contain"
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-white mb-2">{kb.name}</h3>
                          {kb.comingSoon && (
                            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full whitespace-nowrap">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Wallet Integrations */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  Wallet Integrations
                </h2>
                <p className="text-gray-300 mb-8">
                  Connect your favorite wallets securely to NexAI and manage them all through natural conversation
                </p>
              </motion.div>

              <div className="grid grid-cols-3 gap-6">
                {walletIntegrations.map((wallet, index) => (
                  <motion.div
                    key={wallet.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    <div className={`p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-orange-500/50 ${wallet.comingSoon ? 'opacity-70' : ''}`} style={{ height: '180px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 flex items-center justify-center mb-4">
                          <Image
                            src={wallet.icon}
                            alt={`${wallet.name} logo`}
                            width={50}
                            height={50}
                            className="object-contain"
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-white mb-2">{wallet.name}</h3>
                          {wallet.comingSoon && (
                            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full whitespace-nowrap">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - New */}
      <section className="py-20 bg-gradient-to-b from-purple-900/20 to-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Experience the Future of Crypto Management?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join NexAI today and start managing your crypto portfolio with the power of conversational AI
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenModal}
              className="px-10 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(251,146,60,0.5)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 text-lg"
            >
              Try Demo Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VideoPlayer videoUrl="/welcome.mp4" onClose={handleCloseModal} />
        </motion.div>
      )}
    </div>
  );
}
