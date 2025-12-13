import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-3';
      case 'lg':
        return 'h-4';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-blue-600';
    }
  };

  const getStripedClasses = () => {
    if (!striped) return '';
    return 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem]';
  };

  const getAnimatedClasses = () => {
    if (!animated) return '';
    return 'animate-pulse';
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label || 'Progresso'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`
        w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden
        ${getSizeClasses()}
      `}>
        <div
          className={`
            ${getSizeClasses()}
            ${getVariantClasses()}
            ${getStripedClasses()}
            ${getAnimatedClasses()}
            transition-all duration-500 ease-out rounded-full
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progresso: ${Math.round(percentage)}%`}
        />
      </div>
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  label,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return '#10b981'; // green-500
      case 'warning':
        return '#f59e0b'; // yellow-500
      case 'error':
        return '#ef4444'; // red-500
      case 'info':
        return '#3b82f6'; // blue-500
      default:
        return '#2563eb'; // blue-600
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
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
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getVariantColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(percentage)}%
            </div>
            {label && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {label}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface StepProgressProps {
  steps: Array<{
    label: string;
    description?: string;
    completed?: boolean;
    current?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  orientation = 'horizontal',
  className = ''
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step.completed 
                  ? 'bg-green-500 text-white' 
                  : step.current 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
                transition-colors duration-200
              `}>
                {step.completed ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-0.5 h-8 mt-2
                  ${step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`
                text-sm font-medium
                ${step.completed || step.current 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                {step.label}
              </h3>
              {step.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2
              ${step.completed 
                ? 'bg-green-500 text-white' 
                : step.current 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }
              transition-colors duration-200
            `}>
              {step.completed ? '✓' : index + 1}
            </div>
            <div className="text-center">
              <h3 className={`
                text-sm font-medium
                ${step.completed || step.current 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                {step.label}
              </h3>
              {step.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`
              flex-1 h-0.5 mx-4
              ${step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
              transition-colors duration-200
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};