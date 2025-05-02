"use client";
import React, { useMemo } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SnackbarProvider } from "notistack";
import { usePathname } from "next/navigation";
import AdminNavbar from "../admin/components/AdminNavbar";
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { useConfigStore } from '../store/configStore';
import { opBNB, base, optimism, polygon, arbitrum, mainnet } from 'wagmi/chains';
import { ChainId } from '../configurator/data';

interface InnerLayoutProps {
  children: React.ReactNode;
}

const InnerLayout: React.FC<InnerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { chains } = useConfigStore();
  
  // Map chain IDs to Wagmi chain objects
  const chainMap: Record<string, any> = {
    [ChainId.BNB]: opBNB,
    [ChainId.BASE]: base,
    [ChainId.OPTIMISM]: optimism,
    [ChainId.POLYGON]: polygon,
    [ChainId.ARBITRUM]: arbitrum,
    [ChainId.ETHEREUM]: mainnet
  };
  
  // Get the selected EVM chain or default to opBNB
  const selectedChain = useMemo(() => {
    if (!chains || chains.length === 0) return opBNB;
    
    // Find the first EVM chain from selected chains
    const evmChain = chains.find(chain => 
      chain.id !== ChainId.SOLANA && 
      chain.id !== ChainId.STARKNET
    );
    
    return evmChain ? chainMap[evmChain.id] || opBNB : opBNB;
  }, [chains]);

  return (
    <div>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={selectedChain}
      >
        <SnackbarProvider maxSnack={2}>
          {pathname?.includes("admin") ? <AdminNavbar /> : <Navbar />}
          {children}
          <Footer />
        </SnackbarProvider>
      </OnchainKitProvider>
    </div>
  );
};

export default InnerLayout;
