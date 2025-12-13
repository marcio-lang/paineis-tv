import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "border-l-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg";
    switch (toast.type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      case 'info':
        return `${baseStyles} border-blue-500`;
    }
  };

  return (
    <div
      className={`
        ${getStyles()}
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        p-4 pointer-events-auto
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {toast.title}
          </h3>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {toast.message}
            </p>
          )}
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper hooks for common toast types
export const useSuccessToast = () => {
  const { addToast } = useToast();
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);
};

export const useErrorToast = () => {
  const { addToast } = useToast();
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);
};

export const useWarningToast = () => {
  const { addToast } = useToast();
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);
};

export const useInfoToast = () => {
  const { addToast } = useToast();
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);
};