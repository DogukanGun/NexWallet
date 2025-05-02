"use client";
import { useState } from "react";
import { useConfigStore } from "../store/configStore";

const useAuthModal = () => {
  const { setIsAuthenticated } = useConfigStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/twitter/logout', { credentials: 'include' });
      setIsAuthenticated(false);
      setShowLogoutModal(false); // Close the logout modal after logout
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('userData');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    showAuthModal,
    setShowAuthModal,
    showLogoutModal,
    setShowLogoutModal,
    handleLogout,
  };
};

export default useAuthModal;
