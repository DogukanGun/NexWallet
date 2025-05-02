"use client";
import React, { createContext, useContext, useState } from "react";
import { useConfigStore } from "../store/configStore";

interface AuthContextValue {
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (value: boolean) => void;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setIsAuthenticated } = useConfigStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/twitter/logout', { credentials: 'include' });
      setIsAuthenticated(false);
      setShowLogoutModal(false); // Close the logout modal after logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      showAuthModal, 
      setShowAuthModal, 
      showLogoutModal, 
      setShowLogoutModal,
      handleLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 