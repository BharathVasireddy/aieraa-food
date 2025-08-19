import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: 'default' | 'small';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2",
          variant === 'small' && "h-4 w-4",
          variant === 'default' && "h-5 w-5",
          className
        )}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";