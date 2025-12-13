
import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { ButtonSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    btn-ripple hover-lift transform hover:scale-105 active:scale-95
    focus-ring-animated
  `;

  const variants = {
    primary: `
      bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-xl
      focus:ring-blue-500 hover-glow animate-bounce-in
    `,
    secondary: `
      bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-xl
      focus:ring-gray-500 animate-bounce-in
    `,
    outline: `
      border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500
      text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
      focus:ring-gray-500 animate-bounce-in hover:shadow-md
    `,
    ghost: `
      text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
      focus:ring-gray-500 animate-bounce-in hover:shadow-sm
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-xl
      focus:ring-red-500 hover-glow animate-bounce-in
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={loading ? 'Carregando...' : undefined}
      {...props}
    >
      {loading ? (
        <div className="flex items-center animate-pulse">
          <ButtonSpinner className="mr-2" />
          <span className="animate-typing">Carregando</span>
        </div>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </button>
  );
};
