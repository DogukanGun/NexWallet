"use client";
import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceStore, Message } from '../store/voiceStore';
import { Tools } from '@/app/chat/components/tools/Tools';
import { AudioWaveform } from './AudioWaveform';
import { BsRobot } from 'react-icons/bs';

interface VoiceUIProps {
  onCancel?: () => void;
}

export default function VoiceUI({ onCancel }: VoiceUIProps) {
  const { 
    voiceHistory, 
    setVoiceHistory,
    isListening,
    setIsListening,
    isProcessing,
    setIsProcessing,
    isAIResponding,
    setIsAIResponding
  } = useVoiceStore();
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [voiceHistory]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isListening) {
      mediaRecorder.current.stop();
      setIsListening(false);
      setIsProcessing(true);
    }
  };

  const handleCancel = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
    setIsProcessing(false);
    setIsAIResponding(false);
    setVoiceHistory((prev: Message[]): Message[] => [
      ...prev,
      {
        type: 'user',
        content: 'Voice message',
        timestamp: new Date().toISOString()
      },
      {
        type: 'assistant',
        content: 'Voice message cancelled',
        timestamp: new Date().toISOString()
      }
    ]);
    if (onCancel) onCancel();
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setVoiceHistory((prev: Message[]): Message[] => [
        ...prev,
        {
          type: 'user',
          content: 'Voice message',
          timestamp: new Date().toISOString()
        },
        {
          type: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        }
      ]);
      setIsAIResponding(true);
    } catch (error) {
      console.error('Error processing audio:', error);
      setVoiceHistory((prev: Message[]): Message[] => [
        ...prev,
        {
          type: 'user',
          content: 'Voice message',
          timestamp: new Date().toISOString()
        },
        {
          type: 'assistant',
          content: 'Sorry, there was an error processing your voice message.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Messages Area */}
        <div className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-gray-50">
          {voiceHistory.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white ml-4' 
                  : 'bg-white shadow-md mr-4'
              }`}>
                {message.type === 'assistant' && (
                  <div className="flex items-center mb-2 text-blue-500">
                    <BsRobot className="mr-2" />
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                )}
                <p>{message.content}</p>
                {message.type === 'assistant' && (
                  <AudioWaveform isActive={isAIResponding} color="#2563eb" />
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Control Area */}
        <div className="p-6 bg-white border-t">
          <div className="flex justify-center items-center space-x-4">
            <AudioWaveform isActive={isListening} color="#ef4444" />
          </div>
          
          <div className="flex justify-center items-center mt-6 space-x-4">
            {!isListening && !isProcessing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full flex items-center space-x-3 transition-colors shadow-lg"
              >
                <FaMicrophone className="text-xl" />
                <span className="font-medium">Start Recording</span>
              </motion.button>
            )}

            {isListening && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full flex items-center space-x-3 transition-colors shadow-lg"
              >
                <FaStop className="text-xl" />
                <span className="font-medium">Stop Recording</span>
              </motion.button>
            )}

            {(isListening || isProcessing) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-full flex items-center space-x-2 transition-colors shadow-lg"
              >
                <FaTimes className="text-xl" />
                <span className="font-medium">Cancel</span>
              </motion.button>
            )}
          </div>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-gray-600"
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-bounce">Processing</div>
                <div className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</div>
                <div className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</div>
                <div className="animate-bounce" style={{ animationDelay: "0.6s" }}>.</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 