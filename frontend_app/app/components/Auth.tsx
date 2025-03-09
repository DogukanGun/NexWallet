'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuthProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: () => void;
}

export default function Auth({ isOpen, onClose, onAuthSuccess }: AuthProps) {
    const [authInProgress, setAuthInProgress] = useState(false);
    const [popupWindow, setPopupWindow] = useState<Window | null>(null);

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

    const exchangeCodeForToken = async (code: string) => {
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4 border border-gray-700">
                <div className="flex justify-center mb-6">
                    <div className="bg-black p-3 rounded-full">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 text-white">
                            <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Sign in with X</h3>
                <p className="text-gray-300 mb-6 text-center">
                    Authentication is required to access the full features of NexAI Agents. Your X account will be used for authentication only.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={handleLogin}
                        disabled={authInProgress}
                        className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-300 flex items-center justify-center w-full"
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