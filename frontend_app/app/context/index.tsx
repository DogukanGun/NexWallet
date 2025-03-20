"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { projectId } from "../config";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
export const appKitMetadata = {
  name: "AppKit Next.js Solana",
  description: "AppKit Next.js App Router Solana Example",
  url: "https://github.com/0xonerb/next-reown-appkit-ssr", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}

export default ContextProvider;
