"use client";
import React from "react";
import { createContext } from "react";
import Modal from "../components/Modal";
import { AuthProvider } from "../context/AuthContext";

interface ModalContextValue {
  closeModal: () => void;
  setModalContent: (content: React.ReactNode) => void;
  openModal: (content: React.ReactNode) => void;
  isOpen: boolean;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [modalContent, setModalContent] = React.useState<React.ReactNode>(null);

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
  };

  return (
    <AuthProvider>
      <ModalContext.Provider value={{ openModal, closeModal, isOpen, setModalContent }}>
        {children}
        <Modal isOpen={isOpen} onClose={closeModal}>
          {modalContent}
        </Modal>
      </ModalContext.Provider>
    </AuthProvider>
  );
}
