
import { ReactNode, useState } from 'react';
import { cn } from '../../utils/cn';

interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: string;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tabs({
  items,
  defaultActiveKey,
  onChange,
  type = 'line',
  size = 'md',
  className
}: TabsProps) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    onChange?.(key);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const getTabClasses = (item: TabItem) => {
    const baseClasses = cn(
      'inline-flex items-center font-medium transition-colors whitespace-nowrap cursor-pointer',
      sizeClasses[size],
      item.disabled && 'opacity-50 cursor-not-allowed'
    );

    switch (type) {
      case 'card':
        return cn(
          baseClasses,
          'border border-gray-200 dark:border-gray-600',
          activeKey === item.key
            ? 'bg-primary-500 text-white border-primary-500'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        );
      case 'pill':
        return cn(
          baseClasses,
          'rounded-full',
          activeKey === item.key
            ? 'bg-primary-500 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        );
      default: // line
        return cn(
          baseClasses,
          'border-b-2',
          activeKey === item.key
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        );
    }
  };

  const activeItem = items.find(item => item.key === activeKey);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={cn(
        'flex',
        type === 'line' && 'border-b border-gray-200 dark:border-gray-700',
        type === 'card' && 'space-x-1',
        type === 'pill' && 'space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg'
      )}>
        {items.map((item) => (
          <button
            key={item.key}
            className={getTabClasses(item)}
            onClick={() => !item.disabled && handleTabChange(item.key)}
            disabled={item.disabled}
          >
            {item.icon && (
              <i className={cn(item.icon, 'mr-2')}></i>
            )}
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeItem?.content}
      </div>
    </div>
  );
}
