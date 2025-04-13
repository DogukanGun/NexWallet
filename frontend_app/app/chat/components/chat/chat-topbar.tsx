"use client";

import React, { useEffect } from "react";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Sidebar } from "../sidebar";
import { Message } from "ai/react";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";

interface ChatTopbarProps {
  isLoading: boolean;

  chatId?: string;
  messages: Message[];
}

export default function ChatTopbar({ chatId, messages }: ChatTopbarProps) {
  useEffect(() => {
    const env = process.env.NODE_ENV;
  }, []);

  return (
    <div className="w-full flex px-4 py-6  items-center justify-between lg:justify-center ">
      <Sheet>
        <SheetTrigger>
          <HamburgerMenuIcon className="lg:hidden w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="left">
          <Sidebar chatId={chatId || ""} isCollapsed={false} isMobile={false} messages={messages} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
