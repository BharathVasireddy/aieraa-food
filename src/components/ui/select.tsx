import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'outline';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "appearance-none w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500",
            variant === 'default' && "border-gray-200",
            variant === 'outline' && "border-gray-300",
            "pr-10", // Make room for the chevron
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    );
  }
);

Select.displayName = "Select";