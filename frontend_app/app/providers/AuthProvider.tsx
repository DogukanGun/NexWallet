"use client"
import React, { useEffect, useState } from 'react';
import { useConfigStore } from '../store/configStore';
import Auth from '../components/Auth';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setIsAuthenticated } = useConfigStore();
  const pathname = usePathname();
  const {
    showAuthModal,
    setShowAuthModal,
    showLogoutModal,
    setShowLogoutModal,
    handleLogout,
  } = useAuth();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip authentication check for the root path
    if (pathname === '/') {
      setLoading(false);
      return;
    }


    const checkAuthStatus = async () => {
      try {
        // First check localStorage for fresh auth data
        const authDataString = localStorage.getItem('authData');
        if (authDataString) {
          try {
            const authData = JSON.parse(authDataString);
            const timestamp = authData.timestamp;
            const now = new Date().getTime();
            
            // If auth data is fresh (less than 10 seconds old)
            if (now - timestamp < 10000 && authData.authenticated && authData.user) {
              console.log('Found fresh auth data in localStorage:', authData);
              setIsAuthenticated(true, authData.user);
              localStorage.removeItem('authData'); // Clear it after using
              setLoading(false);
              setShowAuthModal(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing auth data from localStorage:', e);
          }
        }

        // Then check sessionStorage
        const userDataString = sessionStorage.getItem('userData');
        const isAuthenticatedString = sessionStorage.getItem('isAuthenticated');
        
        if (userDataString && userDataString !== "undefined" && isAuthenticatedString === 'true') {
          const userData = JSON.parse(userDataString);
          console.log('User already authenticated from session storage:', userData);
          setIsAuthenticated(true, userData);
          setLoading(false);
        } else {
          setIsAuthenticated(false);
          setShowAuthModal(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setShowAuthModal(true);
        setLoading(false);
      }
    };

    checkAuthStatus();
    
    // Set up polling to check for auth data every second
    const authCheckInterval = setInterval(() => {
      const authDataString = localStorage.getItem('authData');
      if (authDataString) {
        try {
          const authData = JSON.parse(authDataString);
          const timestamp = authData.timestamp;
          const now = new Date().getTime();
          
          // If auth data is fresh (less than 10 seconds old)
          if (now - timestamp < 10000 && authData.authenticated && authData.user) {
            console.log('Found fresh auth data in localStorage during polling:', authData);
            setIsAuthenticated(true, authData.user);
            localStorage.removeItem('authData'); // Clear it after using
            setShowAuthModal(false);
          }
        } catch (e) {
          console.error('Error parsing auth data from localStorage during polling:', e);
        }
      }
    }, 1000);

    // Also keep the message event listener as a backup
    const handleAuthSuccessMessage = (event: MessageEvent) => {
      
      if (event.data && event.data.type === 'AUTH_SUCCESS') {
        const userData = event.data.user;
        console.log('Auth success message received with user data:', userData);
        
        if (userData) {
          setIsAuthenticated(true, userData);
          console.log('Authentication successful, user data saved:', userData);
        }
        handleAuthSuccess();
      }
    };

    window.addEventListener('message', handleAuthSuccessMessage);

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('message', handleAuthSuccessMessage);
    };
  }, [setIsAuthenticated, pathname, setShowAuthModal]);

  const handleAuthSuccess = () => {
    // Close the auth modal after successful authentication
    setShowAuthModal(false);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" text="Authenticating..." />
      </div>
    );
  }

  return (
    <>
      {showAuthModal && (
        <Auth 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess} 
        />
      )}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Logout Confirmation</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="ml-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default AuthProvider; 