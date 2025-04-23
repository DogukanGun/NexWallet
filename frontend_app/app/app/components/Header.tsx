import React from 'react';
import { useTheme } from '@/store/ThemeContext';
import { FaRobot, FaMicrophone, FaBrain, FaTools } from 'react-icons/fa';
import { MdBusiness } from 'react-icons/md';

const Header = () => {
  const { theme } = useTheme();

  return (
    <div className="mb-12">
      {/* Hero Section */}
      <div className={`text-center py-12 px-4 ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
      } rounded-2xl backdrop-blur-sm shadow-lg mb-8`}>
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          NexWallet AI Marketplace
        </h1>
        <p className={`text-xl mb-8 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Your One-Stop Platform for Advanced AI Solutions
        </p>
        
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className={`p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center mb-3">
              <FaRobot className={`text-3xl ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
              }`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              AI Chatbots
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Blockchain-powered intelligent assistants for seamless interactions
            </p>
          </div>

          <div className={`p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center mb-3">
              <MdBusiness className={`text-3xl ${
                theme === 'dark' ? 'text-green-400' : 'text-green-500'
              }`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Business Solutions
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              HR, Legal, and Business automation tools powered by AI
            </p>
          </div>

          <div className={`p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center mb-3">
              <FaMicrophone className={`text-3xl ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
              }`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Voice Assistants
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Natural voice interactions for blockchain operations
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h4 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>10+</h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>AI Tools</p>
          </div>
          <div>
            <h4 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>5+</h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Blockchains</p>
          </div>
          <div>
            <h4 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>3+</h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Categories</p>
          </div>
          <div>
            <h4 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>24/7</h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 