import React from 'react';
import { useTheme } from '@/store/ThemeContext';

interface BusinessTool {
  id: string;
  name: string;
  description: string;
  poweredBy: string;
  category: string;
  isComingSoon: boolean;
}

interface BusinessToolsProps {
  tools: BusinessTool[];
}

const BusinessTools: React.FC<BusinessToolsProps> = ({ tools }) => {
  const { theme } = useTheme();

  return (
    <section className="mt-12">
      <h2 className={`text-2xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Business Solutions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`p-6 rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-50'
            } transition-all duration-300 shadow-lg cursor-not-allowed opacity-80`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {tool.name}
              </h3>
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 text-black">
                Coming Soon
              </span>
            </div>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {tool.description}
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Powered by {tool.poweredBy}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}>
                {tool.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BusinessTools; 