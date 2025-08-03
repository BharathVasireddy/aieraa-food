import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary text-white hover:bg-primary/90 border-2 border-primary hover:border-primary/90':
              variant === 'default',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-100 hover:border-gray-200':
              variant === 'secondary',
            'border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300':
              variant === 'outline',
            'text-gray-900 hover:bg-gray-100 border-2 border-transparent': variant === 'ghost',
          },
          {
            'h-10 px-4 text-sm': size === 'sm',
            'h-14 px-6 text-base': size === 'md',
            'h-16 px-8 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
