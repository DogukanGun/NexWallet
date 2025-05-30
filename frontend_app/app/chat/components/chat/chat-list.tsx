import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChatProps } from "./chat";
import Image from "next/image";
import {MessageRenderer} from "../MessageRenderer";
import { AgentSwapHandler } from "@/components/AgentSwapHandler";

export default function ChatList({ messages, isLoading, loadingSubmit }: ChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [name, setName] = React.useState<string>("");

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const username = localStorage.getItem("ollama_user");
    if (username) {
      setName(username);
    }
  }, []);

  if (messages.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="relative flex flex-col gap-4 items-center justify-center w-full h-full">
          <div></div>
          <div className="flex flex-col gap-4 items-center">
            <Image
              src="/nexarb.png"
              alt="AI"
              width={200}
              height={200}
              className="object-contain"
            />
            <p className="text-center text-white text-lg text-muted-foreground">How can I help you today?</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="scroller" className="w-full overflow-y-scroll overflow-x-hidden h-full justify-end">
      <div className="w-full flex flex-col overflow-x-hidden overflow-y-hidden min-h-full justify-end">
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <motion.div
              layout
              initial={{ opacity: 0, scale: 1, y: 20, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 20, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                message.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div className="flex gap-3 items-center">
                {message.role === "user" && (
                  <div className="flex items-end gap-3">
                    <span className="bg-black p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
                      {message.content}
                    </span>
                    <Avatar className="flex justify-start items-center overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors duration-200">
                      <AvatarImage
                        src="/"
                        alt="user"
                        width={6}
                        height={6}
                        className="object-contain rounded-full"
                      />
                      <AvatarFallback className="rounded-full flex items-center justify-center">
                        <i className="fas fa-male text-white"></i>
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                {message.role === "assistant" && (
                  <div className="flex items-end gap-2">
                    <Avatar className="flex justify-start items-center border-2 border-gray-300 hover:border-blue-500 transition-colors duration-200">
                      <AvatarImage
                        src="/nexarb.png"
                        alt="AI"
                        width={6}
                        height={6}
                        className="object-contain rounded-full"
                      />
                    </Avatar>
                    <span className="bg-black p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
                      <MessageRenderer message={message} />
                      {isLoading && messages.indexOf(message) === messages.length - 1 && (
                        <span className="animate-pulse bg-black" aria-label="Typing">
                          ...
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
            
            {message.role === "assistant" && 
             message.content.toLowerCase().includes("swap") && 
             index > 0 && 
             messages[index-1].role === "user" && (
              <div className="w-full flex justify-center my-2">
                <AgentSwapHandler query={messages[index-1].content} />
              </div>
            )}
          </React.Fragment>
        ))}
        {loadingSubmit && (
          <div className="flex pl-4 pb-4 gap-2 items-center">
            <Avatar className="flex justify-start items-center">
              <AvatarImage
                src="/nexarb.png"
                alt="AI"
                width={6}
                height={6}
                className="object-contain dark:invert"
              />
            </Avatar>
            <div className="bg-black p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
              <div className="flex gap-1">
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_1s_ease-in-out_infinite] dark:bg-slate-300"></span>
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_0.5s_ease-in-out_infinite] dark:bg-slate-300"></span>
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_1s_ease-in-out_infinite] dark:bg-slate-300"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div id="anchor" ref={bottomRef}></div>
    </div>
  );
}
