type LogoutModalProps = {
  onClose: () => void;
  onLogout: () => void;
};

export const LogoutModal = ({ onClose, onLogout }: LogoutModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Logout Confirmation</h3>
        <p className="text-gray-300 mb-6">Are you sure you want to log out?</p>
        <div className="flex justify-end">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
          <button
            onClick={onClose}
            className="ml-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 