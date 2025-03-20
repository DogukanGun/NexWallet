"use client";
import React, { useEffect, useState, ReactNode } from "react";
import { useModal } from "../hooks/useModal";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKit } from "./AppKitProvider";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useSnackbar } from "notistack";
import { apiService } from "../services/ApiService";
import PopupComponent from "../components/PopupComponent";
import { useRouter } from "next/navigation";
import useCurrentUserId from "../hooks/useCurrentUserId";
import LoadingSpinner from '../components/LoadingSpinner';

type SubscriptionWrapperProps = {
  children: ReactNode;
};

const SubscriptionWrapper: React.FC<SubscriptionWrapperProps> = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { openModal, closeModal } = useModal();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const [isLoading, setIsLoading] = useState(true);
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { connection } = useAppKitConnection();
  const { enqueueSnackbar } = useSnackbar();
  const { userId } = useCurrentUserId();
  const router = useRouter();

  const handleCheckCode = async (accessCode: string) => {
    try {
      if (!address) {
        console.error("No wallet address found");
        return;
      }
      const identifier = address;
      const checkUsercodeRes = await apiService.checkUsercode(accessCode, identifier);
      if (checkUsercodeRes.exists) {
        setIsAllowed(true);
        setShowPopup(false);
      } else {
        enqueueSnackbar("Invalid access code", { variant: "error" });
        console.error("Invalid access code");
      }
    } catch (e) {
      console.error("Failed to verify access code:", e);
    }
  };

  const handleSubscribeWithUSDC = async () => {
    const env = process.env.NODE_ENV;
    if (!isConnected || address === undefined) {
      open();
      enqueueSnackbar("Please connect with a wallet that has funding.", { variant: "error" });
      return;
    }

    const senderAddress = new PublicKey(address);
    const recipientAddress = new PublicKey("2B8gzcafXieWkB2SL9Esnj7h16ECDnsd5msbg42qn1BS");

    try {
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
        senderAddress,
        amount,
        [],
        TOKEN_PROGRAM_ID,
      );

      const transaction = new Transaction().add(transferInstruction);
      const hash = await connection?.getLatestBlockhash();
      transaction.recentBlockhash = hash?.blockhash;
      transaction.feePayer = senderAddress;
      
      const signature = await walletProvider.signAndSendTransaction(transaction);
      await handlePaymentSuccess(signature);
    } catch (error) {
      console.error("USDC Payment failed:", error);
      enqueueSnackbar("USDC Payment failed. Please try again.", { variant: "error" });
    }
  };

  const handlePaymentSuccess = async (signature: string) => {
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
      enqueueSnackbar("Subscription payment successful!", { variant: "success" });
    } else {
      console.error("Failed to register subscription:", await res.text());
      enqueueSnackbar("Failed to register subscription", { variant: "error" });
    }
  };

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        if (!userId) {
          setIsLoading(false);
          return;
        }

        const response = await apiService.checkUser(userId);
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
  }, [userId]);

  useEffect(() => {
    if (showPopup) {
      openModal(
        <PopupComponent 
          handleCheckCode={handleCheckCode} 
          handleSubscribeWithUSDC={handleSubscribeWithUSDC}
          onClose={()=>{
            closeModal();
            router.push("/app");
          }}
        />
      );
    } else {
      closeModal();
    }

    return () => {
      if (showPopup) {
        closeModal();
      }
    };
  }, [showPopup]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-gray-50/90 dark:bg-gray-900/90 flex items-center justify-center z-50">
          <LoadingSpinner size="large" text="Checking subscription..." />
        </div>
      )}
      {isAllowed && children}
    </>
  );
};

export default SubscriptionWrapper;
