"use client";

import React, { useEffect, useState } from "react";
import { ChatProps } from "./chat";
import { Button } from "../ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { AnimatePresence } from "framer-motion";
import { ImageIcon, StopIcon } from "@radix-ui/react-icons";
import { Mic, SendHorizonal, Cuboid } from "lucide-react";
import { CharacterSelector } from "./character-selector";

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  setInput
}: ChatProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [characterMode, setCharacterMode] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>, {
        data: { 
          useCharacter: characterMode, 
          characterName: selectedCharacter 
        }
      });
    }
  };

  const toggleCharacterMode = () => {
    setCharacterMode(!characterMode);
    if (characterMode && !selectedCharacter) {
      setSelectedCharacter("Pirate"); // Default character
    }
  };

  const selectCharacter = (name: string) => {
    setSelectedCharacter(name);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="p-4 pb-7 flex justify-between w-full items-center gap-2">
      <AnimatePresence initial={false}>
        <div className="w-full items-center flex relative gap-2">
          <div className="absolute left-3 z-10 flex items-center gap-2">
            <Button className="shrink-0 rounded-full" variant="ghost" size="icon">
              <ImageIcon className="w-5 h-5" />
            </Button>
            
            {/* Character selector */}
            <CharacterSelector 
              enabled={characterMode}
              selectedCharacter={selectedCharacter}
              onToggle={toggleCharacterMode}
              onSelect={selectCharacter}
            />
          </div>
          <form 
            onSubmit={(e) => handleSubmit(e, {
              data: { 
                useCharacter: characterMode, 
                characterName: selectedCharacter 
              }
            })} 
            className="w-full items-center flex relative gap-2"
          >
            <TextareaAutosize
              autoComplete="off"
              value={input}
              ref={inputRef}
              onKeyDown={handleKeyPress}
              onChange={handleInputChange}
              name="message"
              placeholder="Enter your prompt here"
              className="w-full max-h-24 px-[110px] py-4 text-sm placeholder:text-gray-400 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 bg-[#2a0e0e] rounded-full flex items-center h-16 resize-none overflow-hidden shadow-md transition duration-300"
            />

            {!isLoading ? (
              <div className="flex absolute right-3 items-center">
                <Button
                  className="shrink-0 rounded-full"
                  variant="ghost"
                  size="icon"
                  type="submit"
                  disabled={isLoading || !input.trim()}
                >
                  <SendHorizonal className="w-5 h-5 " />
                </Button>
              </div>
            ) : (
              <div className="flex absolute right-3 items-center">
                <Button
                  className="shrink-0 rounded-full"
                  variant="ghost"
                  size="icon"
                  type="button"
                  disabled={true}
                >
                  <Mic className="w-5 h-5 " />
                </Button>
                <Button
                  className="shrink-0 rounded-full"
                  variant="ghost"
                  size="icon"
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    stop();
                  }}
                >
                  <StopIcon className="w-5 h-5  " />
                </Button>
              </div>
            )}
          </form>
        </div>
      </AnimatePresence>
    </div>
  );
}
