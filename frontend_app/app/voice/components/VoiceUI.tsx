"use client";
import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import type { Provider } from "@reown/appkit-adapter-solana";
import { useVoiceStore, ExtendedUIMessage } from '../store/voiceStore';
import { AudioWaveform } from './AudioWaveform';
import { BsPerson, BsRobot } from 'react-icons/bs';
import { apiService } from '@/app/services/ApiService';
import { useAppKitAccount } from "@reown/appkit/react";
import { useConfigStore } from "../../store/configStore";
import { ChainId } from "@/app/configurator/data";
import { useAppKitProvider } from "@reown/appkit/react";
import { VersionedTransaction } from "@solana/web3.js";
import { toast } from "sonner";

interface ComponentConfig {
  name: string;
  type: string;
  validation: string;
  placeholder?: string;
  required?: boolean;
}

interface VoiceUIProps {
  onCancel?: () => void;
}

export default function VoiceUI({ onCancel }: VoiceUIProps) {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const stores = useConfigStore();
  
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
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [showVerification, setShowVerification] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const { selectedVoice,  } = useConfigStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [formComponents, setFormComponents] = useState<ComponentConfig[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isValidForm, setIsValidForm] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [voiceHistory]);

  // Validate the form whenever formData or formComponents change
  useEffect(() => {
    if (formComponents.length === 0) {
      setIsValidForm(false);
      return;
    }

    // Check if all required fields have values
    const allRequiredFieldsFilled = formComponents
      .filter(comp => comp.required)
      .every(comp => formData[comp.name] && formData[comp.name].trim() !== '');

    setIsValidForm(allRequiredFieldsFilled);
  }, [formData, formComponents]);

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
        await handleTranscription(audioBlob);
      };

      mediaRecorder.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Error accessing microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isListening) {
      mediaRecorder.current.stop();
      setIsListening(false);
      setIsProcessing(true);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await apiService.postTranscribe(formData);
      setTranscribedText(response.text);
      setShowVerification(true);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error("Error transcribing audio. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSolAi = async (transaction: string) => {
    try {
      const serializedTransaction = Buffer.from(transaction, "base64");
      const tx = VersionedTransaction.deserialize(serializedTransaction);
      await walletProvider.signAndSendTransaction(tx);
      toast.success("Transaction sent successfully!");
    } catch (e) {
      console.error(e);
      addMessage({
        type: 'assistant',
        content: "Transaction failed, please try again",
      });
      setIsProcessing(false);
    }
  };

  const handleVerification = async (approved: boolean) => {
    setShowVerification(false);
    setTranscribedText("");

    if (!approved) return;

    try {
        toast.loading("Converting your voice to text...");
        
        setIsProcessing(true);
        addMessage({
            type: 'user',
            content: transcribedText,
        });

        toast.loading("Processing your request...");
        const response = await apiService.postChat(
            transcribedText,
            address ?? "",
            voiceHistory,
            stores.chains,
            stores.knowledgeBase,
            stores.llmProvider
        );

        // Check if response contains form components
        if (response.components) {
            try {
                if (Array.isArray(response.components) && response.components.length > 0) {
                    // Pre-fill form with known values from params
                    setFormData(response.params?.known_values || {});
                    setFormComponents(response.components);
                    setShowForm(true);
                    
                    // Add AI's response to chat
                    addMessage({
                        type: 'assistant',
                        content: response.text || "Please provide the following information:",
                    });
                    
                    setIsProcessing(false);
                    return;
                }
            } catch (e) {
                console.error('Error handling form components:', e);
            }
        }

        // Continue with normal flow if no form components
        if (response.op === ChainId.SOLANA && response.transaction) {
            await handleSolAi(response.transaction);
        }

        toast.loading("Converting response to voice...");
        setIsVoiceProcessing(true);
        const voiceResponse = await apiService.processVoiceResponse(
            response.text,
            selectedVoice
        );

        let currentText = '';
        const textToType = response.text;
        setIsAIResponding(true);

        addMessage({
            type: 'assistant',
            content: '',
        });

        const audio = new Audio(`data:audio/wav;base64,${voiceResponse.audioData}`);
        audio.onended = () => {
            setIsAIResponding(false);
            setIsVoiceProcessing(false);
        };
        
        audio.play();
        
        for (let i = 0; i < textToType.length; i++) {
            currentText += textToType[i];
            setVoiceHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].content = currentText;
                return newHistory;
            });
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        toast.success("Response complete!");

    } catch (error) {
        console.error('Error processing chat:', error);
        toast.error("Error processing your message. Please try again.");
        setIsAIResponding(false);
        setIsVoiceProcessing(false);
    } finally {
        setIsProcessing(false);
    }
};

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitting(true);

    try {
        // Validate required fields
        const missingFields = formComponents
            .filter(comp => comp.required && !formData[comp.name])
            .map(comp => comp.name);

        if (missingFields.length > 0) {
            toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
            setIsFormSubmitting(false);
            return;
        }

        // Combine existing conversation context with form data
        const lastUserMessage = voiceHistory[voiceHistory.length - 2]?.content || '';
        const formSubmissionData = {
            original_request: lastUserMessage,
            form_data: formData,
            action: 'form_submission'
        };

        const response = await apiService.postChat(
            JSON.stringify(formSubmissionData),
            address ?? "",
            voiceHistory,
            stores.chains,
            stores.knowledgeBase,
            stores.llmProvider
        );

        // Check if we need more information
        if (response.components) {
            try {
                if (Array.isArray(response.components) && response.components.length > 0) {
                    // Keep existing form data and add new components
                    setFormComponents(response.components);
                    toast.info("Please provide additional information");
                    setIsFormSubmitting(false);
                    return;
                }
            } catch (e) {
                console.error('Error handling form components:', e);
            }
        }

        // If we have a transaction, execute it
        if (response.op === ChainId.SOLANA && response.transaction) {
            await handleSolAi(response.transaction);
        }

        // Add form submission to chat history
        addMessage({
            type: 'user',
            content: `Submitted: ${JSON.stringify(formData)}`,
        });

        // Process AI response
        setIsVoiceProcessing(true);
        const voiceResponse = await apiService.processVoiceResponse(
            response.text,
            selectedVoice
        );

        let currentText = '';
        const textToType = response.text;
        setIsAIResponding(true);

        addMessage({
            type: 'assistant',
            content: '',
        });

        const audio = new Audio(`data:audio/wav;base64,${voiceResponse.audioData}`);
        audio.onended = () => {
            setIsAIResponding(false);
            setIsVoiceProcessing(false);
        };
        
        audio.play();
        
        for (let i = 0; i < textToType.length; i++) {
            currentText += textToType[i];
            setVoiceHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].content = currentText;
                return newHistory;
            });
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        // Reset form state only if we're done with all inputs
        if (!response.components) {
            setShowForm(false);
            setFormData({});
            setFormComponents([]);
        }

    } catch (error) {
        console.error('Error submitting form:', error);
        toast.error("Error submitting form. Please try again.");
        setIsFormSubmitting(false);
    } finally {
        // Always reset the form submitting state, regardless of components
        setIsFormSubmitting(false);
    }
};

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9); // Simple unique ID generator
  };

  const addMessage = (message: { type: 'user' | 'assistant', content: string }) => {
    const newMessage: ExtendedUIMessage = {
      ...message,
      timestamp: new Date().toISOString(),
      id: generateUniqueId(),
      role: message.type === 'user' ? 'user' : 'assistant',
      parts: []
    };

    setVoiceHistory((prev: ExtendedUIMessage[]): ExtendedUIMessage[] => [
      ...prev,
      newMessage
    ]);
  };

  const handleCancel = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
    setIsProcessing(false);
    setIsAIResponding(false);
    
    // Create the user and assistant messages with all required properties
    const userMessage: ExtendedUIMessage = {
      type: 'user',
      content: 'Voice message',
      timestamp: new Date().toISOString(),
      id: generateUniqueId(), // Generate a unique ID
      role: 'user', // Set role
      parts: [] // Initialize parts as needed
    };

    const assistantMessage: ExtendedUIMessage = {
      type: 'assistant',
      content: 'Voice message cancelled',
      timestamp: new Date().toISOString(),
      id: generateUniqueId(), // Generate a unique ID
      role: 'assistant', // Set role
      parts: [] // Initialize parts as needed
    };

    setVoiceHistory((prev: ExtendedUIMessage[]): ExtendedUIMessage[] => [
      ...prev,
      userMessage,
      assistantMessage
    ]);

    if (onCancel) onCancel();
  };

  const StatusIndicator = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      <span>{message}</span>
    </div>
  );

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
                  : 'bg-white shadow-md mr-4 text-gray-800'
              }`}>
                {message.type === 'assistant' && (
                  <div className="flex items-center mb-2 text-blue-500">
                    <BsRobot className="mr-2" />
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                )}
                {message.type === 'user' && (
                  <div className="flex items-center mb-2 text-white">
                    <BsPerson className="mr-2" />
                    <span className="text-sm font-medium">You</span>
                  </div>
                )}
                <p>{message.content}</p>
                {message.type === 'assistant' && (
                  <AudioWaveform isActive={isAIResponding} color="#2563eb" />
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Form Display */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg p-8 shadow-xl border border-gray-200 mx-auto my-4 max-w-2xl"
              >
                <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">Please provide the following information:</h3>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {formComponents.map((component, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                        {component.name.replace(/_/g, ' ')} {component.required && <span className="text-red-500">*</span>}
                      </label>
                      {component.type === 'text_area' ? (
                        <textarea
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base bg-white shadow-inner"
                          placeholder={component.placeholder}
                          value={formData[component.name] || ''}
                          onChange={(e) => handleInputChange(component.name, e.target.value)}
                          required={component.required}
                          rows={4}
                        />
                      ) : component.type === 'select' ? (
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base bg-white shadow-inner"
                          value={formData[component.name] || ''}
                          onChange={(e) => handleInputChange(component.name, e.target.value)}
                          required={component.required}
                        >
                          <option value="">Select {component.name.replace(/_/g, ' ')}</option>
                          {/* Add options based on your requirements */}
                        </select>
                      ) : (
                        <input
                          type={component.validation === 'number' ? 'number' : 'text'}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base bg-white shadow-inner"
                          placeholder={component.placeholder}
                          value={formData[component.name] || ''}
                          onChange={(e) => handleInputChange(component.name, e.target.value)}
                          required={component.required}
                        />
                      )}
                      {component.placeholder && (
                        <p className="text-xs text-gray-500 mt-1">{component.placeholder}</p>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({});
                      }}
                      className="px-5 py-2.5 text-gray-700 bg-white hover:bg-gray-100 rounded-md transition-colors border border-gray-300 font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isFormSubmitting}
                      className={`px-5 py-2.5 text-white rounded-md transition-all shadow-sm font-medium text-sm flex items-center justify-center min-w-[100px] ${
                        isFormSubmitting 
                          ? 'bg-blue-400' 
                          : isValidForm 
                            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                            : 'bg-blue-500 opacity-80'
                      }`}
                    >
                      {isFormSubmitting ? (
                        <>
                          <span className="animate-pulse mr-2">⚪</span>
                          <span>Submitting...</span>
                        </>
                      ) : 'Submit'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Verification Modal */}
        <AnimatePresence>
          {showVerification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
              >
                <h3 className="text-xl font-semibold mb-4">Verify Transcription</h3>
                <p className="text-gray-600 mb-4">Is this transcription correct?</p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-800">{transcribedText}</p>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleVerification(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  >
                    Record Again
                  </button>
                  <button
                    onClick={() => handleVerification(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Area */}
        <div className="p-6 bg-white border-t">
          <div className="flex justify-center items-center space-x-4">
            <AudioWaveform isActive={isListening} color="#ef4444" />
          </div>
          
          <div className="flex justify-center items-center mt-6 space-x-4">
            {!isListening && !isProcessing && !showVerification && !showForm && (
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
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm 
              px-6 py-3 rounded-full shadow-lg border border-gray-200 z-50">
              <StatusIndicator 
                message={
                  isVoiceProcessing ? "Converting response to voice..." :
                  isAIResponding ? "AI is responding..." :
                  "Processing your request..."
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 