import React from 'react';
import { useTheme } from '@/store/ThemeContext';

const SocialMediaBanner: React.FC = () => {
  const { theme } = useTheme();

  return (
    <section className="mb-12">
      <div className={`relative overflow-hidden 
        ${theme === 'dark'
          ? 'bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 border-purple-500/20'
          : 'bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-purple-200'} 
        rounded-2xl border p-6`}>
        <div className="relative flex items-center justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Join Our Community
              </h2>
            </div>

            <p className={`mb-4 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Stay at the forefront of AI innovation! Follow us on X for exclusive updates,
              early access to new features, and be part of our growing community of AI enthusiasts.
            </p>

            <div className="flex items-center gap-4">
              <a href="https://x.com/NexArb_" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 
                text-white rounded-lg transition-colors duration-200">
                <span>Follow Us</span>
              </a>
              <span className={`text-sm ${theme === 'dark' ? 'text-purple-400/80' : 'text-purple-700'}`}>
                Join 5k+ AI enthusiasts
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaBanner; 