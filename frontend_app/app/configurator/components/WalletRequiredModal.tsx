type WalletRequiredModalProps = {
  onClose: () => void;
};

export const WalletRequiredModal = ({ onClose }: WalletRequiredModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Wallet Connection Required</h3>
        <p className="text-gray-300 mb-6">
          The chatbot needs to interact with your wallet. Please connect your wallet before starting.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}; 