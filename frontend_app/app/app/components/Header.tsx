import React from 'react';
import { useConfigStore } from '../../store/configStore';
import useAuthModal from '../../hooks/useAuthModal';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/store/ThemeContext';

const Header: React.FC = () => {
  const { isAuthenticated, userData } = useConfigStore();
  const { handleLogout } = useAuthModal();
  const router = useRouter();
  const { theme } = useTheme();

  const handleLogoutClick = () => {
    handleLogout();
    router.refresh();
  };

  return (
    <section className="mb-12 flex justify-between items-center">
      <div>
        <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Welcome to NexAI <span className="text-purple-400">Agents</span>
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Your gateway to blockchain interaction through AI. Choose from our pre-built agents or create your own custom solution.
        </p>
      </div>

      {/* User Profile Section */}
      <div>
        {isAuthenticated && (
          <div className={`flex items-center rounded-lg p-2 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
            {userData && (
              <div className="flex items-center mr-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2">
                  {userData.username[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {userData.name}
                  </span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    @{userData.username}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogoutClick}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Header; 