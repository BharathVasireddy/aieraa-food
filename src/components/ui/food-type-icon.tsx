import React from 'react';

interface FoodTypeIconProps {
  type: 'VEG' | 'NON_VEG' | 'HALAL';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FoodTypeIcon({ type, size = 'md', className = '' }: FoodTypeIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (type === 'VEG') {
    return (
      <div className={`${sizeClasses[size]} ${className} inline-flex items-center justify-center`}>
        <svg viewBox="0 0 256 256" className="w-full h-full">
          {/* Green square border */}
          <rect x="16" y="16" width="224" height="224" fill="none" stroke="#00B04F" strokeWidth="12" rx="8"/>
          {/* Green filled circle */}
          <circle cx="128" cy="128" r="64" fill="#00B04F"/>
        </svg>
      </div>
    );
  }

  if (type === 'NON_VEG') {
    return (
      <div className={`${sizeClasses[size]} ${className} inline-flex items-center justify-center`}>
        <svg viewBox="0 0 256 256" className="w-full h-full">
          {/* Red square border */}
          <rect x="16" y="16" width="224" height="224" fill="none" stroke="#E74C3C" strokeWidth="12" rx="8"/>
          {/* Red filled triangle */}
          <polygon points="128,48 208,192 48,192" fill="#E74C3C"/>
        </svg>
      </div>
    );
  }

  if (type === 'HALAL') {
    return (
      <div className={`${sizeClasses[size]} ${className} inline-flex items-center justify-center`}>
        <svg viewBox="0 0 256 256" className="w-full h-full">
          {/* Brown square border */}
          <rect x="16" y="16" width="224" height="224" fill="none" stroke="#8B4513" strokeWidth="12" rx="8"/>
          {/* Brown filled triangle */}
          <polygon points="128,48 208,192 48,192" fill="#8B4513"/>
        </svg>
      </div>
    );
  }

  return null;
}