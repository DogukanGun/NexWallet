'use client'

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin`} />
        
        {/* Inner pulsing circle */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-5 h-5' : 'w-8 h-8'} bg-blue-500 rounded-full animate-pulse`} />
      </div>
      
      {text && (
        <div className="mt-4 text-gray-600 dark:text-gray-300 font-medium animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 