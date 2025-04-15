import Image from 'next/image';

type TwitterLoginModalProps = {
  onClose: () => void;
};

export const TwitterLoginModal = ({ onClose }: TwitterLoginModalProps) => {
  const handleTwitterLogin = () => {
    // Implement Twitter OAuth flow here
    console.log("Initiating X login");
    // This would typically redirect to your OAuth endpoint
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Connect with X</h3>
        <p className="text-gray-300 mb-6">
          Connect your X account to save your agent configurations and access additional features.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleTwitterLogin}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-all duration-300 border border-gray-700"
          >
            <span>Login with</span>
            <Image
              src="/icons/x.png"
              alt="X"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition duration-300"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}; 