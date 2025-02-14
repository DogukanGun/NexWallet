"use client";
import React, { useEffect, useState, ReactNode } from "react";
import { useModal } from "../hooks/useModal";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useAppKit, useAppKitAccount } from "../config";
import { useAppKitProvider } from "@reown/appkit/react";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useSnackbar } from "notistack";
import { apiService } from "../services/ApiService";
import PopupComponent from "../components/PopupComponent";
import { useConfigStore } from "../store/configStore";
import { usePrivy } from "@privy-io/react-auth";

type SubscriptionWrapperProps = {
  children: ReactNode;
};

const SubscriptionWrapper: React.FC<SubscriptionWrapperProps> = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { openModal, closeModal, setModalContent } = useModal();
  const { address, isConnected } = useAppKitAccount();
  const { open, close } = useAppKit();
  const [isLoading, setIsLoading] = useState(false);
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { connection } = useAppKitConnection();
  const { enqueueSnackbar } = useSnackbar();
  const { user, ready } = usePrivy();

  const hasEmbeddedWallet = useConfigStore().chains.some(chain => chain.isEmbedded);
  const hasUserWallet = useConfigStore().chains.some(chain => !chain.isEmbedded);

  const handleCheckCode = async (accessCode: string) => {
    try {
      if (hasUserWallet && !address) {
        console.error("No wallet address found");
        return;
      }
      const identifier = hasEmbeddedWallet ? (user ? user.id : "") : address || "";
      const checkUsercodeRes = await apiService.checkUsercode(accessCode, identifier);
      if (checkUsercodeRes.exists) {
        setIsAllowed(true);
        setShowPopup(false);
      } else {
        console.error("Invalid access code");
      }
    } catch (e) {
      console.error("Failed to verify access code:", e);
    }
  };

  const handleSubscribe = async () => {
    const env = process.env.NODE_ENV;
    if (!isConnected || address === undefined) {
      open();
      enqueueSnackbar("Please connect with a wallet that has funding.", { variant: "error" });
      return;
    }
    const recipientAddress = new PublicKey("2B8gzcafXieWkB2SL9Esnj7h16ECDnsd5msbg42qn1BS");
    const senderAddress = new PublicKey(address);
    const usdcMint = new PublicKey(
      env == "development"
        ? "Es9vMFrzaCERMaVSPyY9KaSk4uKygHNKx5o7pCjHjJ1i"
        : "EPjFWdd5AuLkZkdr9vNdD8xpLdmrQFAhQ5ABw4gMiHQm",
    );
    const userUSDCAddress = await getAssociatedTokenAddress(usdcMint, senderAddress);
    const recipientUSDCAddress = await getAssociatedTokenAddress(usdcMint, recipientAddress);
    const amount = 10 * 10 ** 6; // USDC has 6 decimal places
    const transferInstruction = createTransferInstruction(
      userUSDCAddress,
      recipientUSDCAddress,
      recipientAddress,
      amount,
      [],
      TOKEN_PROGRAM_ID,
    );
    const transaction = new Transaction().add(transferInstruction);
    const hash = await connection?.getLatestBlockhash();
    transaction.recentBlockhash = hash?.blockhash;
    transaction.feePayer = senderAddress;
    const signature = await walletProvider.signAndSendTransaction(transaction);
    if (signature) {
      setShowPopup(false);
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          transactionSignature: signature,
        }),
      });
      if (res.ok) {
        setIsAllowed(true);
      } else {
        console.error("Failed to register subscription:", await res.text());
      }
    }
  };

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setIsLoading(true);
        if(ready && hasEmbeddedWallet && !user){
          return;
        }
        if(hasUserWallet && !address){
          return;
        }
        const response = await apiService.checkUser(address ?? "", user?.id ?? "");
        if (response.isAllowed) {
          setIsAllowed(true);
        } else {
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkSubscriptionStatus();
  }, [ready,hasEmbeddedWallet,hasUserWallet]);

  useEffect(() => {
    if (showPopup) {
      openModal(<PopupComponent handleCheckCode={handleCheckCode} handleSubscribe={handleSubscribe} />);
    } else {
      closeModal();
    }

    return () => {
      if (showPopup) {
        closeModal();
      }
    };
  }, [showPopup, closeModal, handleCheckCode, handleSubscribe, openModal, setModalContent]);

  return (
    <>
      {isLoading && <div className="loading-icon">Loading...</div>}
      {isAllowed && children}
    </>
  );
};

export default SubscriptionWrapper;
