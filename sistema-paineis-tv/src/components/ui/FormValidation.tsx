import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '../base/Input';
import { Button } from '../base/Button';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rules?: ValidationRule[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidation?: boolean;
  validateOnChange?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  rules = [],
  placeholder,
  required = false,
  disabled = false,
  className = '',
  showValidation = true,
  validateOnChange = true
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (val: string) => {
    const newErrors: string[] = [];
    
    if (required && !val.trim()) {
      newErrors.push(`${label} é obrigatório`);
    }
    
    rules.forEach(rule => {
      if (val && !rule.test(val)) {
        newErrors.push(rule.message);
      }
    });
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  useEffect(() => {
    if (validateOnChange && touched) {
      validate(value);
    }
  }, [value, validateOnChange, touched]);

  const handleBlur = () => {
    setTouched(true);
    validate(value);
    onBlur?.();
  };

  const handleChange = (val: string) => {
    onChange(val);
    if (!validateOnChange && touched) {
      validate(val);
    }
  };

  const isValid = errors.length === 0 && touched && value.trim() !== '';
  const hasErrors = errors.length > 0 && touched;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Input
          name={name}
          label={label}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          error={hasErrors}
          required={required}
          rightIcon={type === 'password' ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 active:scale-95 focus-ring-animated"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : isValid ? (
            <CheckCircle className="w-4 h-4 text-green-500 animate-bounce-in" />
          ) : hasErrors ? (
            <AlertCircle className="w-4 h-4 text-red-500 animate-shake" />
          ) : undefined}
          aria-invalid={hasErrors}
          aria-describedby={hasErrors ? `${name}-error` : undefined}
        />
      </div>

      {showValidation && hasErrors && (
        <div id={`${name}-error`} className="space-y-1 animate-shake" role="alert">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-sm text-red-600 dark:text-red-400 animate-slide-in-up bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 animate-pulse" />
              <span className="font-medium">{error}</span>
            </div>
          ))}
        </div>
      )}

      {showValidation && isValid && (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400 animate-bounce-in bg-green-50 dark:bg-green-900/20 p-2 rounded-md border border-green-200 dark:border-green-800">
          <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
          <span className="font-medium">Campo válido ✓</span>
        </div>
      )}
    </div>
  );
};

interface FormProps {
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  validateOnSubmit?: boolean;
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  className = '',
  validateOnSubmit = true
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-6 ${className}`}
      noValidate
    >
      {children}
      {React.Children.toArray(children).some(child => 
        React.isValidElement(child) && child.type === Button
      ) ? null : (
        <Button 
          type="submit" 
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full"
        >
          Enviar
        </Button>
      )}
    </form>
  );
};

// Validation rules helpers
export const validationRules = {
  email: {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Digite um email válido'
  },
  
  minLength: (min: number) => ({
    test: (value: string) => value.length >= min,
    message: `Deve ter pelo menos ${min} caracteres`
  }),
  
  maxLength: (max: number) => ({
    test: (value: string) => value.length <= max,
    message: `Deve ter no máximo ${max} caracteres`
  }),
  
  password: {
    test: (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
    message: 'Senha deve ter 8+ caracteres, incluindo maiúscula, minúscula, número e símbolo'
  },
  
  confirmPassword: (originalPassword: string) => ({
    test: (value: string) => value === originalPassword,
    message: 'As senhas não coincidem'
  }),
  
  phone: {
    test: (value: string) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value),
    message: 'Digite um telefone válido: (11) 99999-9999'
  },
  
  cpf: {
    test: (value: string) => {
      const cpf = value.replace(/\D/g, '');
      if (cpf.length !== 11) return false;
      
      // Check for repeated digits
      if (/^(\d)\1{10}$/.test(cpf)) return false;
      
      // Validate CPF algorithm
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      return remainder === parseInt(cpf.charAt(10));
    },
    message: 'Digite um CPF válido'
  },
  
  cnpj: {
    test: (value: string) => {
      const cnpj = value.replace(/\D/g, '');
      if (cnpj.length !== 14) return false;
      
      // Check for repeated digits
      if (/^(\d)\1{13}$/.test(cnpj)) return false;
      
      // Validate CNPJ algorithm
      let length = cnpj.length - 2;
      let numbers = cnpj.substring(0, length);
      const digits = cnpj.substring(length);
      let sum = 0;
      let pos = length - 7;
      
      for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      
      let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== parseInt(digits.charAt(0))) return false;
      
      length = length + 1;
      numbers = cnpj.substring(0, length);
      sum = 0;
      pos = length - 7;
      
      for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      
      result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      return result === parseInt(digits.charAt(1));
    },
    message: 'Digite um CNPJ válido'
  },
  
  url: {
    test: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Digite uma URL válida'
  },
  
  numeric: {
    test: (value: string) => /^\d+$/.test(value),
    message: 'Digite apenas números'
  },
  
  alphanumeric: {
    test: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    message: 'Digite apenas letras e números'
  }
};