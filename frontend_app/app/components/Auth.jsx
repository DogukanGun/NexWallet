'use client'

import React, { useEffect, useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { apiService } from '../services/ApiService';
import { lazorMessage } from '@/constants';
import { Connection } from '@solana/web3.js';
import bs58 from 'bs58';

const isBase58 = (str) => /^[A-HJ-NP-Za-km-z1-9]+$/.test(str);


export default function Auth({ isOpen, onClose, onAuthSuccess }) {
    const [authInProgress, setAuthInProgress] = useState(false);
    const [popupWindow, setPopupWindow] = useState(null);
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const { connect, isConnected, publicKey, signMessage } = useWallet(connection);

    // Monitor popup window for completion
    useEffect(() => {
        if (!popupWindow) return;

        const checkPopup = setInterval(() => {
            try {
                // Check if popup is closed
                if (popupWindow.closed) {
                    clearInterval(checkPopup);
                    setAuthInProgress(false);
                    setPopupWindow(null);
                    return;
                }

                // Check if popup has redirected to our redirect URI
                const currentUrl = popupWindow.location.href;
                if (currentUrl.includes('code=')) {
                    // Extract the authorization code
                    const urlObj = new URL(currentUrl);
                    const code = urlObj.searchParams.get('code');

                    if (code) {
                        // Close popup
                        popupWindow.close();
                        clearInterval(checkPopup);
                        setPopupWindow(null);

                        // Exchange code for token
                        exchangeCodeForToken(code);
                    }
                }
            } catch (e) {
                // Cross-origin errors will occur while X is authenticating
                // This is normal - we'll keep polling until we get access
            }
        }, 500);

        return () => clearInterval(checkPopup);
    }, [popupWindow]);

    const exchangeCodeForToken = async (code) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/twitter/callback?code=${code}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json(); // Get error details
                throw new Error(`Authentication failed: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            onAuthSuccess();
            localStorage.setItem('isAuthenticated', 'true');
        } catch (error) {
            console.error('Error during authentication:', error);
        } finally {
            setAuthInProgress(false);
        }
    };

    const handleLogin = () => {
        setAuthInProgress(true);

        // Open popup window
        const width = 600;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        console.log("backendUrl", backendUrl);
        const popup = window.open(
            `${backendUrl}/api/twitter/login`,
            'X Authentication',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );

        if (popup) {
            setPopupWindow(popup);
            popup.focus();
        } else {
            // Fallback to redirect if popup is blocked
            window.location.href = `${backendUrl}/api/twitter/login`;
        }
    };

    // Lazor login handler
    const handleLazorLogin = async () => {
        try {
            console.log("Lazor login initiated");

            // First check if we need to connect
            if (!isConnected) {
                console.log("Not connected, connecting...");
                await connect();
                console.log("Connected:", isConnected, "Public Key:", publicKey?.toString());
            }

            // Create a promise that will resolve when signature is received
            const signature = await new Promise((resolve, reject) => {
                // First add event listener to catch the signature
                const handleSignatureMessage = (event) => {
                    console.log("Received message event:", event.data?.type);
                    if (event.data && event.data.type === "SIGNATURE_CREATED") {
                        console.log("Signature data received:", event.data.data);
                        window.removeEventListener("message", handleSignatureMessage);
                        resolve(event.data.data.normalized);
                    }
                };

                // Add event listener first before initiating the signing process
                window.addEventListener("message", handleSignatureMessage);
                console.log("Event listener added, initiating signature...");

                // Explicitly force a new popup for signing
                const lazorSignUrl = `https://w3s.link/ipfs/bafybeibvvxqef5arqj4uy22zwl3hcyvrthyfrjzoeuzyfcbizjur4yt6by/?action=sign&message=${encodeURIComponent(lazorMessage)}`;
                console.log("Opening signing popup at:", lazorSignUrl);

                const width = 600;
                const height = 600;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;

                const popup = window.open(
                    lazorSignUrl,
                    'LazorSignature',
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
                );

                if (!popup || popup.closed) {
                    console.error("Popup blocked or immediately closed");
                    window.removeEventListener("message", handleSignatureMessage);
                    reject(new Error("Popup blocked. Please allow popups for this site."));
                    return;
                }

                popup.focus();
                console.log("Popup opened and focused");

                // Set timeout to prevent hanging
                setTimeout(() => {
                    if (popup && !popup.closed) {
                        popup.close();
                    }
                    window.removeEventListener("message", handleSignatureMessage);
                    reject(new Error("Signature timeout"));
                }, 60000);
            });

            if (!signature) {
                throw new Error("No signature received");
            }

            console.log("Signature received:", signature);

            // Ensure we're using the base58 string representation of the public key
            let publicKeyBase58 ="";

            if (isBase58(publicKey)) {
                // Public key is already in base58, use it directly
                publicKeyBase58 = publicKey;
            } else {
                // Public key is in base64, convert to base58
                try {
                    const publicKeyBuffer = Buffer.from(publicKey, 'base64');
                    publicKeyBase58 = bs58.encode(publicKeyBuffer);
                } catch (err) {
                    console.error('Error converting public key to base58:', err);
                }
            }
            const publicKeyBase64 = Buffer.from(bs58.decode(publicKeyBase58)).toString('base64');
            console.log("Public Key (base64):", publicKeyBase64);

            const response = await apiService.postLazorLogin(publicKeyBase64, signature);
            console.log("API Response:", response);

            if (response.ok) {
                localStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('authData', JSON.stringify(response.user));
                localStorage.setItem("token", response.token);
                sessionStorage.setItem('userData', JSON.stringify(response.user));
                onAuthSuccess();
                onClose();
            } else {
                console.error("Failed to login with Lazor");
            }
        } catch (error) {
            console.error("Error during Lazor login:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4 border border-gray-700">
                <div className="flex justify-center items-center mb-6 space-x-4">
                    <div className="bg-black p-3 rounded-full">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 text-white">
                            <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                    </div>
                    <div className="text-white text-sm font-bold">OR</div>
                    <div className="bg-white p-3 rounded-full">
                        <img src="/icons/lazor-logo.png" alt="Lazor Logo" className="h-10 w-10" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Sign in with X or Lazor</h3>
                <p className="text-gray-300 mb-6 text-center">
                    Authentication is required to access the full features of NexAI Agents. Your account will be used for authentication only.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleLogin}
                        disabled={authInProgress}
                        className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-300 flex items-center justify-center w-full shadow-md"
                    >
                        {authInProgress ? (
                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 mr-2">
                                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        )}
                        {authInProgress ? 'Authenticating...' : 'Continue with X'}
                    </button>
                    <button
                        onClick={handleLazorLogin}
                        className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition duration-300 flex items-center justify-center w-full shadow-md"
                    >
                        <img src="/icons/lazor-logo.png" alt="Lazor Logo" className="h-5 w-5 mr-2" />
                        Login with Lazor
                    </button>
                </div>
                <div className="mt-4 text-center">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        Continue without signing in
                    </button>
                </div>
            </div>
        </div>
    );
} 