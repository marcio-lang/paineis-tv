import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-blue-600';
      case 'secondary':
        return 'text-gray-600';
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-400';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${getSizeClasses()} ${getColorClasses()}`}
        style={{
          borderColor: 'currentColor',
          borderTopColor: 'transparent',
        }}
      />
      {text && (
        <span className={`ml-2 text-sm ${getColorClasses()}`}>
          {text}
        </span>
      )}
    </div>
  );
};

// Variações específicas
export const ButtonSpinner: React.FC<{ size?: 'sm' | 'md'; className?: string }> = ({ 
  size = 'sm', 
  className = '' 
}) => (
  <LoadingSpinner size={size} color="white" className={className} />
);

export const PageSpinner: React.FC<{ text?: string }> = ({ text = 'Carregando...' }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const OverlaySpinner: React.FC<{ text?: string }> = ({ text = 'Carregando...' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 shadow-xl">
      <LoadingSpinner size="lg" text={text} />
    </div>
  </div>
);

export default LoadingSpinner;