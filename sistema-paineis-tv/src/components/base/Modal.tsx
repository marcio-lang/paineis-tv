
import { ReactNode, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  maskClosable?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  maskClosable = true,
  className
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closable, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={maskClosable ? onClose : undefined}
        />
        
        {/* Modal */}
        <div className={cn(
          'relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all',
          sizeClasses[size],
          className
        )}>
          {/* Header */}
          {(title || closable) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {closable && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
