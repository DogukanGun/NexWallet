const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-10 h-10 border-4 border-gray-800 border-t-black rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
