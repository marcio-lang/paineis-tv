
import { ReactNode, useState } from 'react';
import { cn } from '../../utils/cn';

interface AccordionItem {
  key: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultActiveKey?: string[];
  multiple?: boolean;
  className?: string;
  bordered?: boolean;
}

export function Accordion({ 
  items, 
  defaultActiveKey = [],
  multiple = false,
  className,
  bordered = true
}: AccordionProps) {
  const [activeKeys, setActiveKeys] = useState<string[]>(defaultActiveKey);

  const handleToggle = (key: string) => {
    if (multiple) {
      setActiveKeys(prev => 
        prev.includes(key) 
          ? prev.filter(k => k !== key)
          : [...prev, key]
      );
    } else {
      setActiveKeys(prev => 
        prev.includes(key) ? [] : [key]
      );
    }
  };

  return (
    <div className={cn(
      'divide-y divide-gray-200 dark:divide-gray-700',
      bordered && 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
      className
    )}>
      {items.map((item, index) => {
        const isActive = activeKeys.includes(item.key);
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div key={item.key} className="bg-white dark:bg-gray-800">
            <button
              className={cn(
                'w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                item.disabled && 'opacity-50 cursor-not-allowed',
                !bordered && isFirst && 'rounded-t-lg',
                !bordered && isLast && !isActive && 'rounded-b-lg'
              )}
              onClick={() => !item.disabled && handleToggle(item.key)}
              disabled={item.disabled}
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {item.title}
              </span>
              <i className={cn(
                'ri-arrow-down-s-line transition-transform duration-200',
                isActive && 'transform rotate-180',
                item.disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
              )}></i>
            </button>
            
            <div className={cn(
              'overflow-hidden transition-all duration-200',
              isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <div className="px-4 pb-4 text-gray-700 dark:text-gray-300">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
