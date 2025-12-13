
import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  mask?: 'cpf' | 'cnpj' | 'phone' | 'cep' | 'currency';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    mask,
    value,
    onChange,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '');
    const [isFocused, setIsFocused] = useState(false);

    const applyMask = (value: string, maskType: string) => {
      const cleanValue = value.replace(/\D/g, '');
      
      switch (maskType) {
        case 'cpf':
          return cleanValue
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
        case 'cnpj':
          return cleanValue
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
        case 'phone':
          return cleanValue
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d{1,4})/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
        case 'cep':
          return cleanValue
            .replace(/(\d{5})(\d{1,3})/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
        case 'currency':
          const numericValue = cleanValue.replace(/\D/g, '');
          const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
          return formattedValue;
        default:
          return value;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      
      if (mask) {
        newValue = applyMask(newValue, mask);
      }
      
      setInternalValue(newValue);
      
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: newValue }
        };
        onChange(syntheticEvent);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const inputClasses = cn(
      'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 transform',
      'dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400',
      'hover:shadow-md hover:scale-[1.02] focus:scale-[1.02]',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      error 
        ? 'border-red-500 focus:ring-red-500 dark:border-red-400 animate-shake' 
        : isFocused 
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
      className
    );

    const labelClasses = cn(
      'text-sm font-medium transition-colors duration-200',
      error 
        ? 'text-red-600 dark:text-red-400' 
        : isFocused 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-700 dark:text-gray-300'
    );

    return (
      <div className="space-y-2">
        {label && (
          <label className={labelClasses}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300",
              isFocused ? 'text-blue-500 scale-110' : 'text-gray-400 scale-100',
              error && 'text-red-500'
            )}>
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            value={mask ? internalValue : value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightIcon && (
            <div className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 cursor-pointer",
              isFocused ? 'text-blue-500 scale-110' : 'text-gray-400 scale-100 hover:scale-105',
              error && 'text-red-500'
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 animate-slide-in-up flex items-center gap-1">
            <span className="animate-pulse">⚠️</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-opacity duration-300">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
