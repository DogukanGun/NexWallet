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

    // Retrieve authentication state from session storage
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    const storedUserData = sessionStorage.getItem('userData');

    if (storedAuth) {
      const isAuthenticated = JSON.parse(storedAuth);
      if (!storedUserData || storedUserData == "undefined"){
        setShowAuthModal(true);
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('userData');
        setLoading(false);
        return;
      }
      const userData = storedUserData ? JSON.parse(storedUserData) : null;
      setIsAuthenticated(isAuthenticated, userData);
      
      // If authenticated, no need to check the API
      if (isAuthenticated) {
        setLoading(false);
        return;
      }
    }

    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/twitter/user', {
          credentials: 'include',
        });
        const data = await response.json();
        console.log('Auth Status:', data);

        setIsAuthenticated(data.authenticated);
        
        if (!data.authenticated) {
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setShowAuthModal(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    const handleAuthSuccessMessage = (event: MessageEvent) => {
      if (event.origin === "http://localhost:3000" && event.data.type === 'AUTH_SUCCESS') {
        handleAuthSuccess();
      }
    };

    // Add event listener for authentication success messages
    window.addEventListener('message', handleAuthSuccessMessage);

    return () => {
      // Clean up the event listener on unmount
      window.removeEventListener('message', handleAuthSuccessMessage);
    };
  }, [setIsAuthenticated, pathname]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Refresh user data
    fetch('http://localhost:8000/api/twitter/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log('User Data:', data);
        if (data.user) {
          setIsAuthenticated(true, data.user);
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
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