
import { cn } from '../../utils/cn';

interface ProgressProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  status?: 'normal' | 'success' | 'exception' | 'active';
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
  className?: string;
}

export function Progress({
  percent,
  size = 'md',
  status = 'normal',
  showInfo = true,
  strokeColor,
  trailColor,
  className
}: ProgressProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const getStatusColor = () => {
    if (strokeColor) return strokeColor;
    
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'exception':
        return 'bg-red-500';
      case 'active':
        return 'bg-primary-500';
      default:
        return 'bg-primary-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <i className="ri-check-line text-green-500"></i>;
      case 'exception':
        return <i className="ri-close-line text-red-500"></i>;
      default:
        return null;
    }
  };

  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex-1">
        <div 
          className={cn(
            'w-full rounded-full overflow-hidden',
            sizeClasses[size],
            trailColor || 'bg-gray-200 dark:bg-gray-700'
          )}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              getStatusColor(),
              status === 'active' && 'animate-pulse'
            )}
            style={{ 
              width: `${clampedPercent}%`,
              backgroundColor: strokeColor 
            }}
          />
        </div>
      </div>
      
      {showInfo && (
        <div className="ml-3 flex items-center space-x-1">
          {getStatusIcon() || (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(clampedPercent)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface CircleProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  status?: 'normal' | 'success' | 'exception';
  strokeColor?: string;
  trailColor?: string;
  showInfo?: boolean;
  className?: string;
}

export function CircleProgress({
  percent,
  size = 120,
  strokeWidth = 6,
  status = 'normal',
  strokeColor,
  trailColor = '#f3f4f6',
  showInfo = true,
  className
}: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  const getStatusColor = () => {
    if (strokeColor) return strokeColor;
    
    switch (status) {
      case 'success':
        return '#10b981';
      case 'exception':
        return '#ef4444';
      default:
        return 'var(--primary-500, #3b82f6)';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <i className="ri-check-line text-green-500 text-xl"></i>;
      case 'exception':
        return <i className="ri-close-line text-red-500 text-xl"></i>;
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trailColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStatusColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      
      {showInfo && (
        <div className="absolute inset-0 flex items-center justify-center">
          {getStatusIcon() || (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(clampedPercent)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
