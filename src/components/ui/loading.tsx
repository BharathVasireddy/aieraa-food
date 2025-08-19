interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ size = 'md', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex space-x-1">
        <div 
          className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse`}
          style={{ animationDelay: '0ms', animationDuration: '1000ms' }}
        ></div>
        <div 
          className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse`}
          style={{ animationDelay: '150ms', animationDuration: '1000ms' }}
        ></div>
        <div 
          className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse`}
          style={{ animationDelay: '300ms', animationDuration: '1000ms' }}
        ></div>
      </div>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loading size="lg" />
      <p className="text-sm text-gray-600 font-medium">Loading...</p>
    </div>
  );
}