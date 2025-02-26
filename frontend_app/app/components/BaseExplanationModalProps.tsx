import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { enqueueSnackbar } from "notistack";

interface BaseExplanationModalProps {
  onClose: () => void;
  onAuthenticated: () => void;
}

const BaseExplanationModal: React.FC<BaseExplanationModalProps> = ({ onClose, onAuthenticated }) => {
  const { ready, authenticated, login } = usePrivy();
  const [loginClicked, setLoginClicked] = useState(false);

  const handleLogin = () => {
    if (ready) {
      setLoginClicked(true);
      login(); // Trigger the login process without await
    }
  };

  useEffect(() => {
    if (authenticated && loginClicked) {
      enqueueSnackbar("Wallet connected", { variant: "success" });
      onAuthenticated();
    }
  }, [authenticated, loginClicked]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Base Process</h3>
        <p className="text-gray-300 mb-6">
          To use Base, please follow these steps:
        </p>
        <ol className="list-decimal list-inside text-gray-300 mb-6">
          <li>Login with Provy wallet</li>
          <li>Sign smart contract to get app key</li>
          <li>Then use the contract</li>
        </ol>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300`}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseExplanationModal; 