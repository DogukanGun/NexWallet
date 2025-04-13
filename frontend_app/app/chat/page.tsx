"use client";
import ChatPage from "./components/ChatPage";
import AuthProvider from '../providers/AuthProvider';

export default function ChatUI() {
  return (
    <AuthProvider>
      <ChatPage />
    </AuthProvider>
  );
}
