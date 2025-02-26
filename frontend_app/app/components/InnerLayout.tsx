"use client";
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SnackbarProvider } from "notistack";
import { usePathname } from "next/navigation";
import AdminNavbar from "../admin/components/AdminNavbar";

interface InnerLayoutProps {
  children: React.ReactNode;
}

const InnerLayout: React.FC<InnerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  return (
    <div>
      <SnackbarProvider maxSnack={2}>
        {pathname?.includes("admin") ? <AdminNavbar /> : <Navbar />}
        {children}
        <Footer />
      </SnackbarProvider>
    </div>
  );
};

export default InnerLayout;
