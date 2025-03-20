"use client";

import { Message, useChat } from "@ai-sdk/react";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import type { Provider } from "@reown/appkit-adapter-solana";
import { ChatLayout } from "./chat/chat-layout";
import { useAppKitAccount } from "@reown/appkit/react";
import { VersionedTransaction } from "@solana/web3.js";
import { useAppKitProvider } from "@reown/appkit/react";
import SubscriptionWrapper from "../../providers/SubscriptionWrapper";
import RequireConfig from "../../components/RequireConfig";
import { apiService } from "@/app/services/ApiService";
import WalletButton from "../../components/WalletButton";
import { useRouter } from "next/navigation";
import { useConfigStore } from "../../store/configStore";
import { ChainId } from "@/app/configurator/data";
import { TextUIPart, UIMessage } from "@ai-sdk/ui-utils";
import { Tools } from './tools/Tools';
import { ToolConfig } from '../config/tools';
import { motion, AnimatePresence } from "framer-motion";

interface ChatPageProps {
  initialChatId?: string;
}

// Enhanced security theme with more vivid colors and clearer distinction
const securityColors = {
  basic: {
    primary: 'from-indigo-500 to-violet-600',
    hover: 'hover:from-indigo-600 hover:to-violet-700',
    badge: 'bg-indigo-500',
    border: 'border-indigo-400/30',
    glow: 'shadow-indigo-500/20',
    text: 'text-indigo-300',
    background: 'from-gray-900 to-indigo-950',
    accentBackground: 'bg-indigo-950/40',
    icon: 'text-indigo-400'
  },
  advanced: {
    primary: 'from-emerald-500 to-cyan-500',
    hover: 'hover:from-emerald-600 hover:to-cyan-600',
    badge: 'bg-emerald-500',
    border: 'border-emerald-400/30',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-300',
    background: 'from-gray-900 to-emerald-950',
    accentBackground: 'bg-emerald-950/40',
    icon: 'text-emerald-400'
  }
};

export default function ChatPage({ initialChatId }: ChatPageProps) {
  const { messages, input, handleInputChange, isLoading, error, stop, setMessages, setInput } =
    useChat({
      onResponse: (response) => {
        if (response) {
          setLoadingSubmit(false);
        }
      },
      onError: (error) => {
        setLoadingSubmit(false);
        toast.error("An error occurred. Please try again.");
      },
    });
  const [chatId, setChatId] = React.useState<string>("");
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const router = useRouter();
  const stores = useConfigStore();
  const [showWalletModal, setShowWalletModal] = React.useState(false);
  const [selectedTool, setSelectedTool] = React.useState<ToolConfig | null>(null);
  const [securityLevel, setSecurityLevel] = React.useState<'basic' | 'advanced'>('basic');
  const [showSecurityBadge, setShowSecurityBadge] = React.useState(false);
  const [securityTransition, setSecurityTransition] = React.useState(false);

  // Enhanced animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Security transition effect
  useEffect(() => {
    if (securityLevel) {
      setSecurityTransition(true);
      const timer = setTimeout(() => setSecurityTransition(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [securityLevel]);

  useEffect(() => {
    const loadHistoricalMessages = () => {
      if (initialChatId) {
        const storedMessages = localStorage.getItem(`chat_${initialChatId}`);
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages);
          setChatId(initialChatId);
        }
      } else {
        // Generate a new chat ID for new chats
        const id = uuidv4();
        setChatId(id);
      }
    };

    // Ensure messages are loaded only if they are empty
    if (messages.length === 0) {
      loadHistoricalMessages();
    }
  }, [setMessages, initialChatId, messages.length]);

  const addMessage = (innerMessage: Message) => {
    const uiMessage: UIMessage = {
      ...innerMessage,
      parts: [{ type: 'text', text: innerMessage.content } as TextUIPart]
    };
    messages.push(uiMessage);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };

  const handleSolAi = async (transaction: string) => {
    const serializedTransaction = Buffer.from(transaction, "base64");
    const tx = VersionedTransaction.deserialize(serializedTransaction);
    try {
      await walletProvider.signAndSendTransaction(tx);
    } catch (e) {
      console.log(e);
      addMessage({
        role: "assistant",
        content: "Transaction failed, please try again",
        id: chatId,
      });
      setMessages([...messages]);
      setLoadingSubmit(false);
    }
  };

  const handleSubmitProduction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addMessage({ role: "user", content: input, id: chatId });
    setInput("");

    try {
      const { text, op, transaction } = await apiService.postChat(input, address ?? "", messages, stores.chains, stores.knowledgeBase);
      console.log("text", text);
      console.log("op", op);
      console.log("transaction", transaction);
      if (op === ChainId.SOLANA && transaction) {
        handleSolAi(transaction);
      } else {
        addMessage({ role: "assistant", content: text, id: chatId });
        setMessages([...messages]);
        setLoadingSubmit(false);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error("An error occurred. Please try again.");
      setLoadingSubmit(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setShowSecurityBadge(true);
    setMessages([...messages]);
    handleSubmitProduction(e);
  };

  // Enhanced wallet modal with animated security visuals
  const WalletModal = () => (
    <AnimatePresence>
      {showWalletModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-gradient-to-br ${securityColors[securityLevel].background} rounded-2xl 
              p-8 max-w-md w-full mx-4 border ${securityColors[securityLevel].border} 
              shadow-2xl shadow-${securityColors[securityLevel].glow}`}
          >
            <div className="space-y-7 relative">
              {/* Decorative security elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-gradient-to-r 
                 opacity-80 blur-sm" />
              <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r 
                 opacity-80 blur-sm" />

              <div className="text-center space-y-3">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center 
                    bg-gradient-to-r ${securityColors[securityLevel].primary} p-1 
                    shadow-lg ${securityColors[securityLevel].glow}`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={securityLevel === 'advanced'
                          ? "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"}
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {securityLevel === 'advanced' ? 'Enhanced Security Chat' : 'Secure Chat'}
                </h2>
                <p className={`${securityColors[securityLevel].text} text-sm`}>
                  {securityLevel === 'advanced'
                    ? 'Connect your wallet for maximum security and transaction verification'
                    : 'Connect your wallet to access AI-powered crypto assistance'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <WalletButton
                  className={`w-full bg-gradient-to-r ${securityColors[securityLevel].primary} 
                    ${securityColors[securityLevel].hover} text-white rounded-lg py-3.5 font-medium 
                    transition-all duration-300 transform hover:scale-102 shadow-lg ${securityColors[securityLevel].glow}
                    flex items-center justify-center gap-2`}
                />
                <button
                  onClick={() => router.push('/app')}
                  className={`px-4 py-3 ${securityColors[securityLevel].accentBackground} 
                    text-gray-300 rounded-lg hover:bg-gray-700/80 transition-all duration-200
                    border ${securityColors[securityLevel].border}`}
                >
                  Return Home
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Show security badge when transactions are being processed
  useEffect(() => {
    if (loadingSubmit) {
      setShowSecurityBadge(true);
    } else {
      // Keep the badge visible for a moment after loading completes
      const timer = setTimeout(() => setShowSecurityBadge(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [loadingSubmit]);

  // Enhanced security badge with animations
  const SecurityBadge = () => (
    <AnimatePresence>
      {showSecurityBadge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`absolute bottom-24 right-4 ${securityColors[securityLevel].badge} 
            text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg 
            ${loadingSubmit ? 'animate-pulse' : ''}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={securityLevel === 'advanced'
                ? "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"}
            />
          </svg>
          <span className="font-medium">
            {loadingSubmit
              ? (securityLevel === 'advanced' ? 'Verifying Securely...' : 'Processing...')
              : (securityLevel === 'advanced' ? 'Enhanced Security' : 'Standard Security')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Enhanced security toggle with better visual differentiation
  const SecurityToggle = () => (
    <motion.div
      className="absolute top-4 right-4 z-10 flex items-center bg-gray-800/60 p-1 rounded-full backdrop-blur-sm 
        border border-gray-700 shadow-lg"
      animate={{
        boxShadow: securityTransition
          ? `0 0 20px 3px ${securityLevel === 'advanced' ? '#10b981' : '#6366f1'}`
          : 'none'
      }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => setSecurityLevel('basic')}
        className={`px-4 py-1.5 rounded-full transition-all duration-300 flex items-center gap-2 ${securityLevel === 'basic'
            ? `bg-gradient-to-r ${securityColors.basic.primary} text-white font-medium`
            : 'text-gray-400 hover:text-gray-200'
          }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Basic</span>
      </button>
      <button
        onClick={() => setSecurityLevel('advanced')}
        className={`px-4 py-1.5 rounded-full transition-all duration-300 flex items-center gap-2 ${securityLevel === 'advanced'
            ? `bg-gradient-to-r ${securityColors.advanced.primary} text-white font-medium`
            : 'text-gray-400 hover:text-gray-200'
          }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Advanced</span>
      </button>
    </motion.div>
  );

  // Security transition effect overlay
  const SecurityTransition = () => (
    <AnimatePresence>
      {securityTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed inset-0 z-50 pointer-events-none backdrop-blur-sm flex items-center justify-center
            ${securityLevel === 'advanced' ? 'bg-emerald-950/80' : 'bg-indigo-950/80'}`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-white text-4xl font-bold flex flex-col items-center gap-6 
              p-8 rounded-2xl ${securityLevel === 'advanced' ? 'bg-emerald-900/50' : 'bg-indigo-900/50'}`}
          >
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={securityLevel === 'advanced'
                  ? "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  : "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"}
              />
            </svg>
            <span className="text-center">
              {securityLevel === 'advanced' ? 'Enhanced Security Activated' : 'Standard Security Mode'}
            </span>
            <span className="text-lg font-normal opacity-80">
              {securityLevel === 'advanced'
                ? 'Maximum protection enabled for your transactions'
                : 'Basic security features activated'}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.main
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={`flex h-[calc(100vh-64px)] flex-col items-center relative 
        transition-all duration-500 bg-black
        ${securityLevel === 'advanced'
          ? 'from-gray-900 to-emerald-950'
          : 'from-gray-900 to-indigo-950'}`}
    >
      <WalletModal />
      <SecurityTransition />

      <RequireConfig>
        <SubscriptionWrapper>
          <div className="w-full h-full mt-5 bg-black relative">
            <SecurityToggle />
            <SecurityBadge />

            <ChatLayout
              chatId={chatId}
              messages={messages}
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              loadingSubmit={loadingSubmit}
              error={error}
              stop={stop}
              navCollapsedSize={10}
              defaultLayout={[30, 160]}
              formRef={formRef}
              setMessages={setMessages}
              setInput={setInput}
              securityLevel={securityLevel}
              sidebarClassName="bg-gray-800"
            />

            <Tools
              onToolSelect={setSelectedTool}
              selectedTool={selectedTool}
              securityLevel={securityLevel}
            />
          </div>
        </SubscriptionWrapper>
      </RequireConfig>
    </motion.main>
  );
} 