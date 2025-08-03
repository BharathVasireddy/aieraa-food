import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-14 w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-base placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-0 focus:border-primary focus:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
