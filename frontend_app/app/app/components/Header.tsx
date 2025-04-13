import React from 'react';
import { useConfigStore } from '../../store/configStore';
import useAuthModal from '../../hooks/useAuthModal';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const { isAuthenticated, userData } = useConfigStore();
  const { handleLogout } = useAuthModal();
  const router = useRouter();

  const handleLogoutClick = () => {
    handleLogout();
    router.refresh();
  };

  return (
    <section className="mb-12 flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to NexAI <span className="text-purple-400">Agents</span>
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Your gateway to blockchain interaction through AI. Choose from our pre-built agents or create your own custom solution.
        </p>
      </div>

      {/* User Profile Section */}
      <div>
        {isAuthenticated && (
          <div className="flex items-center bg-gray-800/50 rounded-lg p-2">
            {userData && (
              <div className="flex items-center mr-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2">
                  {userData.username[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{userData.name}</span>
                  <span className="text-xs text-gray-400">@{userData.username}</span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogoutClick}
              className="px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
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