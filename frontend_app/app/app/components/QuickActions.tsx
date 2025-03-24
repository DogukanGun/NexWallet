import React from 'react';
import Link from 'next/link';

const QuickActions: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
        <span className="mr-2">⚡</span> Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Agent Card */}
        <Link href="/configurator"
          className="group relative overflow-hidden p-6 bg-gradient-to-br from-purple-500/10 to-purple-700/10 
                     backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500 
                     transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="relative">
            <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-purple-400 group-hover:text-purple-300 mb-2">Create Agent</h3>
            <p className="text-gray-400 text-sm mb-4">Build your custom AI agent with specific capabilities</p>
            <div className="flex items-center text-purple-400/50 text-sm group-hover:translate-x-2 transition-transform">
              Get Started
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Voice Modification Preview Card */}
        <Link href="/app/voice-customization"
          className="group relative overflow-hidden p-6 bg-gradient-to-br from-blue-500/10 to-blue-700/10 
                     backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-500 
                     transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="relative">
            <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-400 group-hover:text-blue-300 mb-2">Voice Customization</h3>
            <p className="text-gray-400 text-sm mb-4">Customize your AI agent&apos;s voice and speaking style</p>
            <div className="flex items-center text-blue-400/50 text-sm group-hover:translate-x-2 transition-transform">
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
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-gray-800/30 to-gray-700/30 
                    backdrop-blur-sm rounded-xl border border-gray-700 cursor-not-allowed">
          <div className="absolute top-3 right-3">
            <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="p-3 bg-gray-700/20 rounded-xl w-fit mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Import Agent</h3>
          <p className="text-gray-500 text-sm">Import your existing AI agent configuration</p>
        </div>
      </div>
    </section>

  );
};

export default QuickActions; 