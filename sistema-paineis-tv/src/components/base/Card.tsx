
import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  interactive?: boolean;
  loading?: boolean;
}

export function Card({ 
  children, 
  className, 
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  interactive = false,
  loading = false
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg transition-all duration-200',
        border && 'border border-gray-200 dark:border-gray-700',
        shadowClasses[shadow],
        paddingClasses[padding],
        hover && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        interactive && 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transform transition-transform',
        loading && 'animate-pulse',
        'card-animate',
        className
      )}
    >
      {loading ? (
        <div className="animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded h-full min-h-[100px]" />
      ) : (
        children
      )}
    </div>
  );
}
