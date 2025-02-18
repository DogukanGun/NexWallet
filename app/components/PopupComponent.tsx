"use client";

import { useState } from "react";

interface PopupComponentProps {
  handleCheckCode: (code: string) => void;
  handleSubscribeWithUSDC: () => void;
  handleSubscribeWithODP: () => void;
}

const PopupComponent: React.FC<PopupComponentProps> = ({
  handleCheckCode,
  handleSubscribeWithUSDC,
  handleSubscribeWithODP,
}) => {
  const [accessCode, setAccessCode] = useState("");

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">Subscribe to Access</h2>
      
      <div className="space-y-4">
        <div className="subscription-options space-y-4">
          <button
            onClick={handleSubscribeWithUSDC}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Subscribe with 10 USDC
          </button>
          
          <button
            onClick={handleSubscribeWithODP}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Subscribe with 5,000 ODP
          </button>
        </div>

        <div className="mt-6">
          <p className="text-center text-gray-600 mb-2">- OR -</p>
          <p className="text-sm mb-2">Enter your access code:</p>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-2"
            placeholder="Enter access code"
          />
          <button
            onClick={() => handleCheckCode(accessCode)}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Submit Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupComponent;
