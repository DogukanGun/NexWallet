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
    { name: "StarkNet", icon: "/icons/starknet.svg", comingSoon: true },
  ];

  const knowledgeBases = [
    { name: "Cookie.dao", icon: "/icons/cookiefun.png", active: true },
    { name: "ChainLink", icon: "/icons/chainlink.svg", comingSoon: true },
  ];

  const walletIntegrations = [
    { name: "Reown Wallet", icon: "/icons/reown.svg", active: true },
    { name: "MetaMask", icon: "/icons/metamask.svg", active: true },
    { name: "Phantom", icon: "/icons/phantom.svg", active: true, comingSoon:false},
  ];

  return (
    <div className="relative overflow-hidden">
      <div
        className="hero min-h-screen relative"
        style={{
          backgroundImage: "url(/nexarb.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay bg-opacity-60 bg-gradient-to-b from-purple-900/70 to-orange-500/70"></div>
        
        <div className="hero-content text-neutral-content text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl relative"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                Welcome to NexAI
              </h1>
              <p className="text-2xl mb-8 font-light text-white drop-shadow-md">
                Manage your wallet by speaking with AI
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenModal}
              className="px-10 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(251,146,60,0.5)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 text-lg"
            >
              Try Demo
            </motion.button>

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
      </div>

      {/* Chains Section */}
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
              Supported Chains
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Seamlessly manage your assets across multiple blockchains with our integrated solution
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {chains.map((chain, index) => (
              <motion.div
                key={chain.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-orange-500/50 ${chain.comingSoon ? 'opacity-70' : ''}`} style={{ width: '150px', height: '200px' }}>
                  <div className="flex flex-col items-center">
                    <Image
                      src={chain.icon}
                      alt={`${chain.name} logo`}
                      width={50}
                      height={50}
                      className="object-cover mb-2"
                    />
                    <div className="mt-2 text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">{chain.name}</h3>
                      {chain.comingSoon && (
                        <span className="text-sm px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full whitespace-nowrap">
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

      {/* Knowledge Base Section */}
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
              Knowledge Base Integration
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Powered by leading blockchain data providers for accurate and real-time information
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {knowledgeBases.map((kb, index) => (
              <motion.div
                key={kb.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-orange-500/50 ${kb.comingSoon ? 'opacity-70' : ''}`} style={{ width: '150px', height: '200px' }}>
                  <div className="flex flex-col items-center">
                    <Image
                      src={kb.icon}
                      alt={`${kb.name} logo`}
                      width={50}
                      height={50}
                      className="object-cover mb-2"
                    />
                    <div className="mt-2 text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">{kb.name}</h3>
                      {kb.comingSoon && (
                        <span className="text-sm px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full whitespace-nowrap">
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

      {/* Wallet Integration Section */}
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
              Wallet Integrations
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Seamlessly connect with your preferred wallet solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {walletIntegrations.map((wallet, index) => (
              <motion.div
                key={wallet.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-300 hover:border-orange-500/50 ${wallet.comingSoon ? 'opacity-70' : ''}`} style={{ width: '150px', height: '200px' }}>
                  <div className="flex flex-col items-center">
                    <Image
                      src={wallet.icon}
                      alt={`${wallet.name} logo`}
                      width={50}
                      height={50}
                      className="object-cover mb-2"
                    />
                    <div className="mt-2 text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">{wallet.name}</h3>
                      {wallet.comingSoon && (
                        <span className="text-sm px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full whitespace-nowrap">
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
