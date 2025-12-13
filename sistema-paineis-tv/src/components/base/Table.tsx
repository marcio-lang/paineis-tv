
import { ReactNode, useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface Column {
  key: string;
  title?: string;
  label?: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: any) => ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  loading?: boolean;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  emptyMessage?: string;
}

export function Table({ 
  columns, 
  data, 
  pagination,
  loading = false,
  className,
  striped = true,
  hoverable = true,
  emptyMessage = 'Nenhum dado encontrado'
}: TableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderPagination = () => {
    if (!pagination) return null;

    const { current, pageSize, total, onChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - 2 && i <= current + 2)
      ) {
        pages.push(i);
      } else if (
        i === current - 3 ||
        i === current + 3
      ) {
        pages.push('...');
      }
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          Mostrando {(current - 1) * pageSize + 1} a {Math.min(current * pageSize, total)} de {total} resultados
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(current - 1)}
            disabled={current === 1}
          >
            <i className="ri-arrow-left-line"></i>
          </Button>
          {pages.map((page, index) => (
            <span key={index}>
              {page === '...' ? (
                <span className="px-3 py-1 text-gray-500">...</span>
              ) : (
                <Button
                  variant={current === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onChange(page as number)}
                >
                  {page}
                </Button>
              )}
            </span>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(current + 1)}
            disabled={current === totalPages}
          >
            <i className="ri-arrow-right-line"></i>
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
          <span className="ml-2 text-gray-500 dark:text-gray-400">Carregando...</span>
        </div>
      </div>
    );
  }



  // Se não há dados para exibir
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="ri-inbox-line text-4xl text-gray-400 mb-2"></i>
            <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300', className)}>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200',
                    column.width && `w-${column.width}`
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title ?? column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col transition-transform duration-200 hover:scale-110">
                        <i className={cn(
                          'ri-arrow-up-s-line text-xs transition-colors duration-200',
                          sortConfig?.key === column.key && sortConfig.direction === 'asc' 
                            ? 'text-blue-500' 
                            : 'text-gray-400'
                        )}></i>
                        <i className={cn(
                          'ri-arrow-down-s-line text-xs -mt-1 transition-colors duration-200',
                          sortConfig?.key === column.key && sortConfig.direction === 'desc' 
                            ? 'text-blue-500' 
                            : 'text-gray-400'
                        )}></i>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((record, index) => (
              <tr
                key={index}
                className={cn(
                  'transition-all duration-200 transform hover:scale-[1.01]',
                  striped && index % 2 === 1 && 'bg-gray-50 dark:bg-gray-700',
                  hoverable && 'hover:bg-blue-50 dark:hover:bg-gray-600 hover:shadow-sm cursor-pointer'
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {column.render ? column.render(record) : record[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedData.map((record, index) => (
            <div
              key={index}
              className={cn(
                'p-4 transition-all duration-300 transform hover:scale-[1.02]',
                striped && index % 2 === 1 && 'bg-gray-50 dark:bg-gray-700',
                hoverable && 'hover:bg-blue-50 dark:hover:bg-gray-600 hover:shadow-md cursor-pointer active:scale-[0.98]'
              )}
            >
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {column.title ?? column.label}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-[60%] truncate">
                    {column.render ? column.render(record) : record[column.key]}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {renderPagination()}
    </div>
  );
}
