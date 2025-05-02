import React from 'react';

interface ElizaAutoSelectModalProps {
  onClose: () => void;
}

export default function ElizaAutoSelectModal({ onClose }: ElizaAutoSelectModalProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Eliza Auto-Selected</h2>
      <p className="text-gray-600 dark:text-gray-300">
        The selected chain requires Eliza knowledge base. Eliza has been automatically selected for you.
      </p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
} 