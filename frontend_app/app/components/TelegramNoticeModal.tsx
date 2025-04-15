import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';

interface TelegramNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const TelegramNoticeModal = ({ isOpen, onClose, onConfirm }: TelegramNoticeModalProps) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="modal-styled mx-auto max-w-md w-full">
                    <Dialog.Title className="text-2xl font-bold mb-2 text-gradient-primary">
                        Beta Testing Notice
                    </Dialog.Title>
                    
                    <Dialog.Description className="text-base-content/80 mb-6">
                        Please note that our Telegram bot is currently in beta testing. You may encounter some bugs or limitations.
                    </Dialog.Description>

                    <div className="alert-styled alert-info mb-6">
                        <p>
                            By proceeding, you acknowledge that you&apos;re participating in a beta test and your feedback will help improve the service.
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="btn-gradient-neutral flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="btn-gradient-primary flex-1"
                        >
                            Continue to Telegram
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default TelegramNoticeModal; 