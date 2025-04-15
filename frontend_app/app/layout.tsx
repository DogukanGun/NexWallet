import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ContextProvider from "./context";
import "@reown/appkit-wallet-button/react";
import { ModalProvider } from "./providers/ModalWrapper";
import InnerLayout from "./components/InnerLayout";
import React from 'react';
import { LoadingProvider } from './context/LoadingContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AuthProvider from "./providers/AuthProvider";
import AppKitProvider from "./providers/AppKitProvider";
import { ThemeProvider } from '@/store/ThemeContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexWallet",
  description: "AI powered wallet for the future",
  icons: {
    icon: "/n.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-base-100 text-base-content`}>
        <ThemeProvider>
          <AppKitProvider>
            <ContextProvider>
              <ModalProvider>
                <AuthProvider>
                  <LoadingProvider>
                    <div className="min-h-screen flex flex-col bg-gradient-to-b from-base-200 to-base-100">
                      <InnerLayout>{children}</InnerLayout>
                    </div>
                  </LoadingProvider>
                </AuthProvider>
              </ModalProvider>
            </ContextProvider>
          </AppKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
