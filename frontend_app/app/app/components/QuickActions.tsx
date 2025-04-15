import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/store/ThemeContext';

const QuickActions: React.FC = () => {
  const { theme } = useTheme();

  return (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <span className="mr-2">⚡</span> Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Agent Card */}
        <Link href="/configurator"
          className={`group relative overflow-hidden p-6 
            ${theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-700'
              : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'} 
            backdrop-blur-sm rounded-xl border hover:border-purple-500 
            transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="relative">
            <div className={`p-3 ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} rounded-xl w-fit mb-4`}>
              <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} group-hover:text-purple-500`}>
              Create Agent
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Build your custom AI agent with specific capabilities
            </p>
            <div className={`flex items-center text-sm group-hover:translate-x-2 transition-transform ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Get Started
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Voice Modification Preview Card */}
        <Link href="/app/voice-customization"
          className={`group relative overflow-hidden p-6 
            ${theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-700'
              : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'} 
            backdrop-blur-sm rounded-xl border hover:border-blue-500 
            transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="relative">
            <div className={`p-3 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-xl w-fit mb-4`}>
              <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} group-hover:text-blue-500`}>
              Voice Customization
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Customize your AI agent&apos;s voice and speaking style
            </p>
            <div className={`flex items-center text-sm group-hover:translate-x-2 transition-transform ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Get Started
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
              In Beta
            </span>
          </div>
        </Link>

        {/* Import Agent Card */}
        <div className={`relative overflow-hidden p-6 
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-700'
            : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'} 
          backdrop-blur-sm rounded-xl border cursor-not-allowed`}>
          <div className="absolute top-3 right-3">
            <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className={`p-3 ${theme === 'dark' ? 'bg-gray-700/20' : 'bg-gray-100'} rounded-xl w-fit mb-4`}>
            <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Import Agent</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Import your existing AI agent configuration</p>
        </div>
      </div>
    </section>
  );
};

export default QuickActions; 