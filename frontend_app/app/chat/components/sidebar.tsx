"use client";

import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { Message } from "ai/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import SidebarSkeleton from "./sidebar-skeleton";
import UserSettings from "./user-settings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  messages: Message[];
  onClick?: () => void;
  isMobile: boolean;
  chatId: string;
}

export function Sidebar({ messages, isCollapsed, isMobile, chatId }: SidebarProps) {
  const [localChats, setLocalChats] = useState<{ chatId: string; messages: Message[] }[]>([]);
  const [selectedChatId, setSselectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);

  useEffect(() => {
    setSselectedChatId(chatId);
  }, [chatId, setSselectedChatId]);

  useEffect(() => {
    setLocalChats(getLocalstorageChats());
    const handleStorageChange = () => {
      setLocalChats(getLocalstorageChats());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getLocalstorageChats = (): {
    chatId: string;
    messages: Message[];
  }[] => {
    const chats = Object.keys(localStorage).filter((key) => key.startsWith("chat_"));

    if (chats.length === 0) {
      setIsLoading(false);
    }

    // Map through the chats and return an object with chatId and messages
    const chatObjects = chats.map((chat) => {
      const item = localStorage.getItem(chat);
      return item ? { chatId: chat, messages: JSON.parse(item) } : { chatId: "", messages: [] };
    });

    // Sort chats by the createdAt date of the first message of each chat
    chatObjects.sort((a, b) => {
      const aDate = new Date(a.messages[0].createdAt);
      const bDate = new Date(b.messages[0].createdAt);
      return bDate.getTime() - aDate.getTime();
    });

    setIsLoading(false);
    return chatObjects;
  };

  const handleDeleteChat = (chatId: string) => {
    localStorage.removeItem(chatId);
    setLocalChats(getLocalstorageChats());
  };

  const handleChatClick = (chatId: string) => {
    const storedMessages = localStorage.getItem(chatId);
    if (storedMessages) {
      setSelectedMessages(JSON.parse(storedMessages));
      router.push(`/chat/${chatId.substr(5)}`);
    }
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative justify-between group flex flex-col h-full gap-2 p-2 data-[collapsed=true]:p-1 bg-black text-white"
    >
      <div className="flex flex-col justify-between p-2 max-h-fit overflow-y-auto">
        <Button
          onClick={() => {
            router.push("/chat");
          }}
          variant="ghost"
          className="flex justify-between w-full h-12 text-sm font-normal items-center text-white hover:bg-gray-700 hover:text-orange-500 transition-colors duration-200"
        >
          <div className="flex gap-3 items-center">
            {!isCollapsed && !isMobile && (
              <Image
                src="/nexarb.png"
                alt="AI"
                width={28}
                height={28}
                className="dark:invert hidden 2xl:block"
              />
            )}
            New chat
          </div>
          <SquarePen size={16} className="shrink-0 w-4 h-4" />
        </Button>

        <div className="flex flex-col pt-8 gap-2">
          <p className="pl-4 text-xs font-semibold text-orange-500">Your chats</p>
          {localChats.length > 0 && (
            <div>
              {localChats.map(({ chatId, messages }, index) => (
                <div
                  key={index}
                  className="flex justify-between w-full h-12 text-sm font-normal items-center transition duration-300 text-white hover:text-orange-500 cursor-pointer"
                >
                  <div onClick={() => handleChatClick(chatId)} className="flex gap-2 items-center truncate">
                    <div className="flex flex-col">
                      <span className="text-xs font-normal">
                        {messages.length > 0 ? messages[0].content : ""}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex justify-end items-center text-white hover:bg-gray-700 hover:text-orange-500 transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={14} className="shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border border-gray-600 shadow-lg rounded-md">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full flex gap-2 justify-start items-center text-orange-500 hover:bg-orange-500 hover:text-white transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(true);
                            }}
                          >
                            <Trash2 className="shrink-0 w-4 h-4" />
                            Delete chat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 rounded-lg p-4">
                          <DialogHeader className="space-y-4">
                            <DialogTitle className="text-orange-500 text-lg font-semibold">Confirm Deletion</DialogTitle>
                            <DialogDescription className="text-gray-300">
                              Are you sure you want to delete this chat? This action cannot be undone.
                            </DialogDescription>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  handleDeleteChat(chatId);
                                  setIsOpen(false);
                                }}
                                className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
          {isLoading && <SidebarSkeleton />}
        </div>
      </div>
      <div className="justify-end px-2 py-2 w-full border-t border-orange-500">
        <UserSettings />
      </div>
    </div>
  );
}
