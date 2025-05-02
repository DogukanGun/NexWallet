import { useConfigStore } from '@/app/store/configStore';
import React from 'react';

interface FeaturePopupProps {
  isOpen: boolean;
  onClose: () => void;
  features: { value: string; label: string; }[]; // Update type to match the structure
}

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const FeaturePopup: React.FC<FeaturePopupProps> = ({ isOpen, onClose, features }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bot Features</h2>
        <ul className="mt-2 space-y-2">
          {features.length > 0 ? (
            features.map((feature, index) => (
              <li key={index} className="py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                {capitalizeFirstLetter(feature.label)} - {capitalizeFirstLetter(feature.value)}
              </li>
            ))
          ) : (
            <li className="py-2 px-4 text-gray-500">No features available.</li> // Fallback message
          )}
        </ul>
        <p className="text-gray-700 text-sm mt-4">Editing these features will come soon.</p>
        <div className="flex justify-center mt-4">
          <button 
            onClick={onClose} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturePopup; 