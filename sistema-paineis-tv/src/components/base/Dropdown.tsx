
import { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface DropdownItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
}

export function Dropdown({ 
  trigger, 
  items, 
  placement = 'bottom-start',
  className 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1'
  };

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className={cn(
          'absolute z-50 min-w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1',
          placementClasses[placement]
        )}>
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                'w-full px-4 py-2 text-left text-sm flex items-center space-x-2 transition-colors',
                item.disabled 
                  ? 'text-gray-400 cursor-not-allowed'
                  : item.danger
                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {item.icon && (
                <i className={cn(item.icon, 'text-base')}></i>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
