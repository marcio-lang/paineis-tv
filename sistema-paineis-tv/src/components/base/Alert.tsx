
import { ReactNode, useState } from 'react';
import { cn } from '../../utils/cn';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string | ReactNode;
  closable?: boolean;
  showIcon?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  type = 'info',
  title,
  message,
  closable = false,
  showIcon = true,
  onClose,
  className
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const typeConfig = {
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-400',
      icon: 'ri-information-line'
    },
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-400',
      icon: 'ri-check-line'
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-400',
      icon: 'ri-alert-line'
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-400',
      icon: 'ri-error-warning-line'
    }
  };

  const config = typeConfig[type];

  return (
    <div className={cn(
      'border rounded-lg p-4',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <i className={cn(config.icon, config.iconColor, 'text-xl')}></i>
          </div>
        )}
        
        <div className={cn('flex-1', showIcon && 'ml-3')}>
          {title && (
            <h3 className={cn('text-sm font-medium', config.textColor)}>
              {title}
            </h3>
          )}
          {message && (
            <div className={cn(
              'text-sm',
              config.textColor,
              title && 'mt-1'
            )}>
              {message}
            </div>
          )}
        </div>

        {closable && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={handleClose}
              className={cn(
                'inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
                config.textColor
              )}
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
