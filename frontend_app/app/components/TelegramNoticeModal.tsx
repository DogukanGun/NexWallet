import { Dialog } from '@headlessui/react';
import React from 'react';

interface TelegramNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const TelegramNoticeModal: React.FC<TelegramNoticeModalProps> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-lg rounded-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800/50 p-6 w-full">
                    <Dialog.Title className="text-2xl font-bold mb-6 text-white">Warning</Dialog.Title>
                    
                    <p className="text-gray-300 mb-6">
                        This Telegram bot is currently working for testnet. Do you want to proceed?
                    </p>
                    
                    <div className="flex gap-4">
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300"
                        >
                            Yes
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
                        >
                            No
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default TelegramNoticeModal; 