import { Dialog } from '@headlessui/react';

interface TelegramNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewRoadmap: () => void;
}

export default function TelegramNoticeModal({ isOpen, onClose, onViewRoadmap }: TelegramNoticeModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800/50 p-6">
          <Dialog.Title className="text-xl font-bold mb-4 text-white">Coming Soon!</Dialog.Title>
          
          <p className="text-gray-300 mb-6">
            Telegram integration is currently in development. Soon you'll be able to interact with your AI assistant directly through Telegram!
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={onViewRoadmap}
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300"
            >
              View Feature Roadmap
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 