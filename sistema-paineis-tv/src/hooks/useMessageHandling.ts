import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ErrorMessage,
  SuccessMessage,
  getErrorMessage,
  getSuccessMessage,
  formatErrorForUser,
  extractErrorCode
} from '../utils/errorMessages';

interface UseMessageHandlingReturn {
  // Estado
  loading: boolean;
  error: ErrorMessage | null;
  success: SuccessMessage | null;
  
  // Ações
  setLoading: (loading: boolean) => void;
  setError: (error: string | Error | any) => void;
  setSuccess: (successCode: string, details?: any) => void;
  clearMessages: () => void;
  
  // Helpers
  showErrorToast: (error: string | Error | any) => void;
  showSuccessToast: (message: string, details?: any) => void;
  handleApiResponse: <T>(response: any, successCode?: string) => Promise<T | null>;
}

export function useMessageHandling(): UseMessageHandlingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<ErrorMessage | null>(null);
  const [success, setSuccessState] = useState<SuccessMessage | null>(null);

  const setError = useCallback((errorData: string | Error | any) => {
    const errorCode = extractErrorCode(errorData);
    const errorMessage = getErrorMessage(errorCode);
    setErrorState(errorMessage);
    setSuccessState(null);
  }, []);

  const setSuccess = useCallback((successCode: string, details?: any) => {
    const successMessage = getSuccessMessage(successCode, details);
    setSuccessState(successMessage);
    setErrorState(null);
  }, []);

  const clearMessages = useCallback(() => {
    setErrorState(null);
    setSuccessState(null);
  }, []);

  const showErrorToast = useCallback((errorData: string | Error | any) => {
    const userMessage = formatErrorForUser(errorData);
    toast.error(userMessage);
  }, []);

  const showSuccessToast = useCallback((message: string, details?: any) => {
    toast.success(message);
  }, []);

  const handleApiResponse = useCallback(async <T>(
    response: any, 
    successCode?: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      
      // Se for uma Promise (fetch), aguardar resposta
      const data = response instanceof Promise ? await response : response;
      
      // Verificar se a resposta indica erro
      if (data.success === false || data.error) {
        setError(data);
        showErrorToast(data);
        return null;
      }
      
      // Verificar códigos de status HTTP
      if (data.status >= 400) {
        const errorData = await data.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData);
        showErrorToast(errorData);
        return null;
      }
      
      // Sucesso
      if (successCode) {
        setSuccess(successCode, data);
      }
      
      // Mostrar toast de sucesso se houver mensagem
      if (successCode && SUCCESS_MESSAGES[successCode]) {
        showSuccessToast(SUCCESS_MESSAGES[successCode].message);
      }
      
      return data;
      
    } catch (error) {
      setError(error);
      showErrorToast(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setError, setSuccess, showErrorToast, showSuccessToast]);

  return {
    loading,
    error,
    success,
    setLoading,
    setError,
    setSuccess,
    clearMessages,
    showErrorToast,
    showSuccessToast,
    handleApiResponse
  };
}

// Hook específico para validação de formulários
export function useFormValidation() {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validateField = useCallback((fieldName: string, value: any, rules: any[]) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: error
        }));
        return error;
      }
    }
    
    // Limpar erro do campo se passou na validação
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    
    return null;
  }, []);
  
  const clearFieldError = useCallback((fieldName: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);
  
  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
  }, []);
  
  const hasErrors = useCallback(() => {
    return Object.keys(validationErrors).length > 0;
  }, [validationErrors]);
  
  return {
    validationErrors,
    validateField,
    clearFieldError,
    clearAllErrors,
    hasErrors
  };
}

// Funções auxiliares de validação comuns
export const validationRules = {
  required: (message: string = 'Campo obrigatório') => (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },
  
  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `Mínimo ${min} caracteres`;
    }
    return null;
  },
  
  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `Máximo ${max} caracteres`;
    }
    return null;
  },
  
  numeric: (message: string = 'Deve ser um número') => (value: any) => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return null;
  },
  
  positive: (message: string = 'Deve ser positivo') => (value: any) => {
    if (value && Number(value) <= 0) {
      return message;
    }
    return null;
  },
  
  range: (min: number, max: number, message?: string) => (value: any) => {
    const num = Number(value);
    if (value && (isNaN(num) || num < min || num > max)) {
      return message || `Deve estar entre ${min} e ${max}`;
    }
    return null;
  },
  
  codeFormat: (message: string = 'Código inválido') => (value: string) => {
    if (value && !/^[A-Z0-9]+$/.test(value.toUpperCase())) {
      return message;
    }
    return null;
  }
};

// Importar mensagens de sucesso para uso no hook
import { SUCCESS_MESSAGES } from '../utils/errorMessages';