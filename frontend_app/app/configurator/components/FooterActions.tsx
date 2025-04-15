type FooterActionsProps = {
  onShowSavedAgents: () => void;
  onShowSaveModal: () => void;
  onStart: () => void;
  isStartDisabled: boolean;
};

export const FooterActions = ({
  onShowSavedAgents,
  onShowSaveModal,
  onStart,
  isStartDisabled
}: FooterActionsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md py-4 px-4 border-t border-gray-800">
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="flex-1 flex gap-3">
          <button
            onClick={onShowSavedAgents}
            className="px-6 py-3 bg-gray-700 text-white rounded-full font-medium hover:bg-gray-600 transition-all duration-300
              flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Saved Agents</span>
          </button>
          <button
            onClick={onShowSaveModal}
            disabled={isStartDisabled}
            className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>Save Agent</span>
          </button>
        </div>
        <button
          onClick={onStart}
          disabled={isStartDisabled}
          className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium
            disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-300
            flex items-center gap-2"
        >
          <span>Start Agent</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}; 