import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const getSkeletonClasses = () => {
    const baseClasses = 'skeleton rounded';
    
    switch (variant) {
      case 'text':
        return `${baseClasses} h-4 w-full`;
      case 'circular':
        return `${baseClasses} rounded-full w-10 h-10`;
      case 'rectangular':
        return `${baseClasses} w-full h-20`;
      case 'card':
        return `${baseClasses} w-full h-48`;
      default:
        return baseClasses;
    }
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={getSkeletonClasses()}
            style={index === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${getSkeletonClasses()} ${className}`}
      style={style}
    />
  );
};

// Skeleton específicos para componentes comuns
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <LoadingSkeleton key={`header-${index}`} variant="text" height="20px" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" height="16px" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ showImage?: boolean }> = ({ showImage = true }) => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    {showImage && <LoadingSkeleton variant="rectangular" height="200px" />}
    <LoadingSkeleton variant="text" height="24px" width="60%" />
    <LoadingSkeleton variant="text" lines={3} />
    <div className="flex space-x-2">
      <LoadingSkeleton variant="rectangular" height="36px" width="80px" />
      <LoadingSkeleton variant="rectangular" height="36px" width="80px" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <LoadingSkeleton variant="text" height="16px" width="80px" />
              <LoadingSkeleton variant="text" height="24px" width="60px" />
            </div>
            <LoadingSkeleton variant="circular" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton showImage={false} />
      <CardSkeleton showImage={false} />
    </div>
  </div>
);