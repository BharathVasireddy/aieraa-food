'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  variant,
  size,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      variant={variant}
      size={size}
      className={cn(
        'relative',
        loading && 'text-transparent',
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText && <span className="text-current">{loadingText}</span>}
        </div>
      )}
      {children}
    </Button>
  );
}