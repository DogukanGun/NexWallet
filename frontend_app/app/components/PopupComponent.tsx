"use client";

import { useState } from "react";
import { FaDollarSign } from "react-icons/fa";

interface PopupComponentProps {
  handleCheckCode: (code: string) => void;
  handleSubscribeWithUSDC: () => void;
  onClose: () => void;
}

const PopupComponent: React.FC<PopupComponentProps> = ({
  handleCheckCode,
  handleSubscribeWithUSDC,
  onClose,
}) => {
  const [accessCode, setAccessCode] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-xl max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <FaDollarSign className="mr-2 text-yellow-400" /> Subscribe to Access
        </h2>
        <p className="text-gray-300 mb-4">
          To ensure the best experience and cover operational costs, we ask for a subscription fee of 10 USDC. Your support helps us maintain and improve the app!
        </p>
        <div className="space-y-4">
          <div className="subscription-options space-y-4">
            <button
              onClick={handleSubscribeWithUSDC}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Subscribe with 10 USDC
            </button>
          </div>

          <div className="mt-6">
            <p className="text-center text-gray-400 mb-2">- OR -</p>
            <p className="text-sm text-gray-300 mb-2">Enter your access code:</p>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg mb-2 text-white"
              placeholder="Enter access code"
            />
            <button
              onClick={() => handleCheckCode(accessCode)}
              className="w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Submit Code
            </button>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupComponent;
