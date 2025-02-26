"use client";

import { useState } from "react";

interface PopupComponentProps {
  handleCheckCode: (code: string) => void;
  handleSubscribeWithUSDC: () => void;
  handleSubscribeWithODP: () => void;
  onClose: () => void;
}

const PopupComponent: React.FC<PopupComponentProps> = ({
  handleCheckCode,
  handleSubscribeWithUSDC,
  handleSubscribeWithODP,
  onClose,
}) => {
  const [accessCode, setAccessCode] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Subscribe to Access</h2>
        <div className="space-y-4">
          <div className="subscription-options space-y-4">
            <button
              onClick={handleSubscribeWithUSDC}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Subscribe with 10 USDC
            </button>
            
            <button
              onClick={handleSubscribeWithODP}
              className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition duration-300"
            >
              Subscribe with 5,000 ODP
            </button>
          </div>

          <div className="mt-6">
            <p className="text-center text-gray-400 mb-2">- OR -</p>
            <p className="text-sm text-gray-300 mb-2">Enter your access code:</p>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg mb-2 text-white"
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
