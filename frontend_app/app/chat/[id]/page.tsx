"use client";
import { useParams } from "next/navigation";
import ChatPage from "../components/ChatPage";
import { useEffect, useState } from "react";


export default function ChatWithId() {
    const params = useParams();
  const [initialChatId, setInitialChatId] = useState<string | null>(null);

  useEffect(() => {
    setInitialChatId(params?.id as string);
  }, [params?.id]);

  return initialChatId ? <ChatPage initialChatId={initialChatId} /> : null;
}
