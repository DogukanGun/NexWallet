import React from "react";

interface AccordionProps {
  title: string | React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isValid: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, isOpen, onToggle, children, isValid }) => {
  return (
    <div className="mb-4 border border-gray-700 rounded-lg">
      <button
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 rounded-lg hover:bg-gray-700"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <span className="text-lg font-semibold text-white">{title}</span>
          {isValid && (
            <svg className="w-5 h-5 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span
          className="transform transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "" }}
        >
          ▼
        </span>
      </button>
      {isOpen && <div className="p-4 bg-black">{children}</div>}
    </div>
  );
};

export default Accordion; 