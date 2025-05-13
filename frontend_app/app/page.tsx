"use client";
import { useState, useEffect } from "react";
import VideoPlayer from "./components/VideoPlayer";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import Link from "next/link";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      title: "Voice-Enabled Crypto Management",
      description: "Control your digital assets with natural voice commands. Send, receive, and manage your portfolio effortlessly.",
      icon: "/icons/voice.svg",
      color: "from-violet-500 to-purple-500",
      stats: ["98% Accuracy", "24/7 Available", "Multi-language"]
    },
    {
      title: "Cross-Chain Operations",
      description: "One interface for all your blockchain needs. Seamlessly bridge assets and interact across multiple chains.",
      icon: "/icons/blockchain.svg",
      color: "from-blue-500 to-cyan-500",
      stats: ["8+ Chains", "Instant Swaps", "Low Fees"]
    },
    {
      title: "AI Market Intelligence",
      description: "Make informed decisions with real-time AI analysis, market insights, and personalized recommendations.",
      icon: "/icons/ai.svg",
      color: "from-emerald-500 to-green-500",
      stats: ["Real-time Data", "Custom Alerts", "Price Predictions"]
    }
  ];

  const supportedChains = [
    { name: "Solana", icon: "/icons/solana.svg", tps: "65,000", tvl: "$890M" },
    { name: "BNB Chain", icon: "/icons/bnbchain.svg", tps: "300", tvl: "$4.2B" },
    { name: "Sonic EVM", icon: "/icons/sonic_svm.jpg", tps: "45,000", tvl: "$150M" },
    { name: "Base", icon: "/icons/base.svg", status: "Coming Soon" },
    { name: "Ethereum", icon: "/icons/ethereum.svg", status: "Coming Soon" },
    { name: "Arbitrum", icon: "/icons/arbitrum.svg", status: "Coming Soon" }
  ];

  const testimonials = [
    {
      name: "Alex Thompson",
      role: "DeFi Protocol Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
      quote: "NexAI has revolutionized how I manage my crypto portfolio. The voice commands are incredibly intuitive."
    },
    {
      name: "Sarah Chen",
      role: "Blockchain Developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf",
      quote: "The cross-chain capabilities are unmatched. It's made development and testing so much more efficient."
    },
    {
      name: "Michael Roberts",
      role: "Investment Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=c0aede",
      quote: "The AI insights have helped us make better investment decisions. It's like having a crypto expert 24/7."
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-base-100 to-base-200">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url(/nexarb.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.1
          }}
        />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative container mx-auto px-4 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-8">
              <Image src="/n.png" alt="NexAI Logo" width={120} height={120} className="rounded-2xl" />
            </div>
            <h1 className="text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
              The Future of Blockchain
            </h1>
            <p className="text-2xl mb-8 text-base-content/80">
              Experience the power of AI-driven crypto management with voice commands, 
              cross-chain operations, and intelligent market insights.
            </p>
            
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-lg btn-primary rounded-full px-8 hover:scale-105 transition"
              >
                Watch Demo
              </button>
              <Link
                href="/app"
                className="btn btn-lg btn-outline rounded-full px-8 hover:scale-105 transition"
              >
                Launch App
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-3 gap-8">
              <div className="stat-card">
                <h3 className="text-4xl font-bold text-primary">$2.5B+</h3>
                <p>Total Volume</p>
              </div>
              <div className="stat-card">
                <h3 className="text-4xl font-bold text-primary">50K+</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-card">
                <h3 className="text-4xl font-bold text-primary">8+</h3>
                <p>Chains Supported</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-base-200/50">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-20">
            Powerful Features for Modern Finance
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="feature-card bg-base-100 p-8 rounded-2xl shadow-xl"
            >
              <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                <Image src="/icons/voice.svg" alt="Voice Control" width={32} height={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Voice-Enabled Crypto Management</h3>
              <p className="text-base-content/70 mb-6">Control your digital assets with natural voice commands. Send, receive, and manage your portfolio effortlessly.</p>
              <div className="grid grid-cols-3 gap-4">
                {["98% Accuracy", "24/7 Available", "Multi-language"].map((stat, i) => (
                  <div key={i} className="text-sm font-medium text-base-content/60">{stat}</div>
                ))}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="feature-card bg-base-100 p-8 rounded-2xl shadow-xl"
            >
              <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Image src="/icons/blockchain.svg" alt="Blockchain" width={32} height={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Cross-Chain Operations</h3>
              <p className="text-base-content/70 mb-6">One interface for all your blockchain needs. Seamlessly bridge assets and interact across multiple chains.</p>
              <div className="grid grid-cols-3 gap-4">
                {["8+ Chains", "Instant Swaps", "Low Fees"].map((stat, i) => (
                  <div key={i} className="text-sm font-medium text-base-content/60">{stat}</div>
                ))}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="feature-card bg-base-100 p-8 rounded-2xl shadow-xl"
            >
              <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                <Image src="/icons/ai.svg" alt="AI Intelligence" width={32} height={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Market Intelligence</h3>
              <p className="text-base-content/70 mb-6">Make informed decisions with real-time AI analysis, market insights, and personalized recommendations.</p>
              <div className="grid grid-cols-3 gap-4">
                {["Real-time Data", "Custom Alerts", "Price Predictions"].map((stat, i) => (
                  <div key={i} className="text-sm font-medium text-base-content/60">{stat}</div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-12">
            Powerful Architecture
          </h2>
          <p className="text-xl text-center text-base-content/80 mb-12 max-w-3xl mx-auto">
            Built with security and scalability in mind, our architecture ensures seamless operations across multiple chains.
          </p>
          <div className="flex justify-center">
            <Image 
              src="/images/NexWalletArch.png" 
              alt="NexWallet Architecture" 
              width={800} 
              height={400} 
              className="rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Chains Section */}
      <section className="py-20 bg-base-200/50">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-20">
            Supported Networks
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Solana", icon: "/icons/solana.svg", tps: "65,000", tvl: "$890M" },
              { name: "BNB Chain", icon: "/icons/bnbchain.svg", tps: "300", tvl: "$4.2B" },
              { name: "Ethereum", icon: "/icons/ethereum.svg", tps: "15", tvl: "$28B" },
              { name: "Base", icon: "/icons/base.svg", status: "Coming Soon" },
              { name: "Arbitrum", icon: "/icons/arbitrum.svg", status: "Coming Soon" },
              { name: "Optimism", icon: "/icons/optimism.svg", status: "Coming Soon" }
            ].map((chain, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="chain-card bg-base-100 p-6 rounded-xl text-center"
              >
                <Image
                  src={chain.icon}
                  alt={chain.name}
                  width={48}
                  height={48}
                  className="mx-auto mb-4"
                />
                <h3 className="font-bold mb-2">{chain.name}</h3>
                {chain.tps ? (
                  <>
                    <p className="text-sm text-base-content/60">TPS: {chain.tps}</p>
                    <p className="text-sm text-base-content/60">TVL: {chain.tvl}</p>
                  </>
                ) : (
                  <span className="text-sm text-yellow-500">{chain.status}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-base-200/50">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-20">
            What Our Users Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="testimonial-card bg-base-100 p-8 rounded-2xl shadow-xl"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full bg-base-200"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <p className="text-sm text-base-content/60">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-base-content/80 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HR.NexArb Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-12">
            <div className="max-w-3xl mx-auto text-center">
              <Image 
                src="/n.png" 
                alt="NexArb Logo" 
                width={80} 
                height={80} 
                className="mx-auto mb-8 rounded-xl"
              />
              <h2 className="text-4xl font-bold text-white mb-6">
                Discover HR.NexArb
              </h2>
              <p className="text-white/90 text-xl mb-8">
                Experience the power of AI in HR management. Our sister platform at hr.nexarb.com revolutionizes recruitment, onboarding, and employee management with cutting-edge AI technology.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-2">AI Recruitment</h3>
                  <p className="text-white/80">Smart candidate matching and automated screening</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-2">Intelligent Onboarding</h3>
                  <p className="text-white/80">Personalized employee onboarding experiences</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-2">Performance Analytics</h3>
                  <p className="text-white/80">AI-driven performance tracking and insights</p>
                </div>
              </div>
              <a
                href="https://hr.nexarb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg bg-white text-emerald-500 hover:bg-white/90 rounded-full px-8"
              >
                Visit HR.NexArb
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-white/90 text-xl mb-8">
              Join thousands of users who are already transforming their crypto experience.
            </p>
            <Link
              href="/app"
              className="btn btn-lg bg-white text-purple-500 hover:bg-white/90 rounded-full px-8"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          >
            <div className="modal-styled w-full max-w-4xl relative bg-base-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 btn btn-circle btn-sm bg-red-500 hover:bg-red-600 text-white border-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="aspect-video w-full">
                <VideoPlayer 
                  videoUrl="https://www.youtube.com/watch?v=fIx24i4zyTw"
                  onClose={() => setIsModalOpen(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
