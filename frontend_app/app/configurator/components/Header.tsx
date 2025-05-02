import Image from 'next/image';
import { useTheme } from '@/store/ThemeContext';

type HeaderProps = {
  isAuthenticated: boolean;
  userData: { username: string } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
};

export const Header = ({ isAuthenticated, userData, onLoginClick, onLogoutClick }: HeaderProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <section className="pt-12 pb-8 px-4 text-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-4">
        Welcome to NexAI Configurator
      </h1>
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-2xl mx-auto`}>
        Create your personalized AI assistant in just a few steps. Configure the chains, 
        knowledge base, and interaction type to get started.
      </p>

      <div className="mt-6">
        {isAuthenticated && userData ? (
          <div className={`inline-flex items-center gap-3 ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'} px-4 py-2 rounded-full`}>
            <span className={isDark ? 'text-gray-300' : 'text-blue-500'}>@{userData.username}</span>
            <button
              onClick={onLogoutClick}
              className={`text-sm px-3 py-1 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-white hover:bg-blue-100 text-blue-500 border border-blue-100'
              } rounded-full transition-colors flex items-center gap-2`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            <span>Get Started with</span>
            <Image
              src="/icons/x.png"
              alt="X"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
          </button>
        )}
      </div>
    </section>
  );
}; 