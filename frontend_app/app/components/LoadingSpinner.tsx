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
    <div className="flex justify-center items-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-base-300 animate-spin">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-primary animate-[spin_1s_linear_infinite]"></div>
        </div>
        {/* Inner ring */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-base-300">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-secondary animate-[spin_2s_linear_infinite]"></div>
        </div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 