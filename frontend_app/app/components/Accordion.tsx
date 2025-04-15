import React from "react";
import { useTheme } from '@/store/ThemeContext';

interface AccordionProps {
  title: string | React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isValid: boolean;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ title, isOpen, onToggle, children, isValid, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`mb-4 border ${isDark ? 'border-gray-700' : 'border-blue-100'} rounded-lg ${className}`}>
      <button
        className={`w-full px-4 py-3 flex items-center justify-between ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700' 
            : 'bg-blue-50 hover:bg-blue-100'
        } rounded-lg transition-colors duration-200`}
        onClick={onToggle}
      >
        <div className="flex items-center">
          <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-blue-500'}`}>{title}</span>
          {isValid && (
            <svg className="w-5 h-5 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span
          className={`transform transition-transform duration-200 ${isDark ? 'text-white' : 'text-blue-500'}`}
          style={{ transform: isOpen ? "rotate(180deg)" : "" }}
        >
          ▼
        </span>
      </button>
      {isOpen && <div className={`p-4 ${isDark ? 'bg-black' : 'bg-white'}`}>{children}</div>}
    </div>
  );
};

export default Accordion; 