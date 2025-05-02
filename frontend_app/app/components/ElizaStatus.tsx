import { useEffect, useState } from 'react';
import axios from 'axios';
import { getElizaService } from '@/eliza';

export default function ElizaStatus() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkElizaStatus = async () => {
      try {
        // Try to get the character list as a way to check if Eliza is running
        const elizaService = getElizaService();
        await elizaService.getCharacters();
        setIsRunning(true);
      } catch (error) {
        console.error('Eliza status check failed:', error);
        setIsRunning(false);
      } finally {
        setChecking(false);
      }
    };

    checkElizaStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkElizaStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (checking) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center bg-gray-900 px-3 py-1.5 rounded-full border border-gray-700 shadow-lg">
        <div className="animate-pulse w-2.5 h-2.5 rounded-full bg-gray-400 mr-2"></div>
        <span className="text-xs text-gray-300">Checking Eliza...</span>
      </div>
    );
  }

  if (!isRunning) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center bg-gray-900 px-3 py-1.5 rounded-full border border-gray-700 shadow-lg">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
        <span className="text-xs text-gray-300">Eliza: Offline</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center bg-gray-900 px-3 py-1.5 rounded-full border border-gray-700 shadow-lg">
      <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div>
      <span className="text-xs text-gray-300">Eliza: Online</span>
    </div>
  );
} 