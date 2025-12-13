// Sistema de mensagens de erro padronizadas

export interface ErrorMessage {
  code: string;
  message: string;
  userMessage: string;
  category: 'validation' | 'business' | 'system' | 'network';
}

export interface SuccessMessage {
  code: string;
  message: string;
  details?: any;
}

// Mensagens de erro padronizadas
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Validação
  MISSING_CODE: {
    code: 'MISSING_CODE',
    message: 'Código do produto é obrigatório',
    userMessage: 'Por favor, informe o código do produto',
    category: 'validation'
  },
  DUPLICATE_CODE: {
    code: 'DUPLICATE_CODE',
    message: 'Código já está em uso',
    userMessage: 'Este código já está sendo usado por outro produto',
    category: 'validation'
  },
  INVALID_POSITION: {
    code: 'INVALID_POSITION',
    message: 'Posição inválida',
    userMessage: 'A posição deve estar entre 1 e 24 (grid 6x4)',
    category: 'validation'
  },
  POSITION_OCCUPIED: {
    code: 'POSITION_OCCUPIED',
    message: 'Posição já ocupada',
    userMessage: 'Já existe um produto nesta posição',
    category: 'validation'
  },
  INVALID_PRICE: {
    code: 'INVALID_PRICE',
    message: 'Preço inválido',
    userMessage: 'O preço deve ser um valor numérico positivo',
    category: 'validation'
  },
  
  // Negócio
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Produto não encontrado',
    userMessage: 'O produto solicitado não foi encontrado',
    category: 'business'
  },
  PANEL_NOT_FOUND: {
    code: 'PANEL_NOT_FOUND',
    message: 'Painel não encontrado',
    userMessage: 'O painel solicitado não foi encontrado',
    category: 'business'
  },
  DEPARTMENT_NOT_FOUND: {
    code: 'DEPARTMENT_NOT_FOUND',
    message: 'Departamento não encontrado',
    userMessage: 'O departamento solicitado não foi encontrado',
    category: 'business'
  },
  ASSOCIATION_EXISTS: {
    code: 'ASSOCIATION_EXISTS',
    message: 'Associação já existe',
    userMessage: 'Este produto já está associado a este painel',
    category: 'business'
  },
  
  // Sistema
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'Erro no banco de dados',
    userMessage: 'Ocorreu um erro ao acessar os dados. Tente novamente.',
    category: 'system'
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Erro interno do servidor',
    userMessage: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    category: 'system'
  },
  
  // Rede
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Erro de conexão',
    userMessage: 'Verifique sua conexão com a internet e tente novamente.',
    category: 'network'
  },
  TIMEOUT_ERROR: {
    code: 'TIMEOUT_ERROR',
    message: 'Tempo limite excedido',
    userMessage: 'A requisição demorou muito tempo. Tente novamente.',
    category: 'network'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Não autorizado',
    userMessage: 'Você precisa estar logado para acessar este recurso.',
    category: 'network'
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Acesso negado',
    userMessage: 'Você não tem permissão para realizar esta ação.',
    category: 'network'
  }
};

// Mensagens de sucesso padronizadas
export const SUCCESS_MESSAGES: Record<string, SuccessMessage> = {
  PRODUCT_CREATED: {
    code: 'PRODUCT_CREATED',
    message: 'Produto criado com sucesso',
    details: 'O produto foi adicionado ao sistema'
  },
  PRODUCT_UPDATED: {
    code: 'PRODUCT_UPDATED',
    message: 'Produto atualizado com sucesso',
    details: 'As alterações foram salvas'
  },
  PRODUCT_DELETED: {
    code: 'PRODUCT_DELETED',
    message: 'Produto removido com sucesso',
    details: 'O produto foi removido do sistema'
  },
  ASSOCIATION_CREATED: {
    code: 'ASSOCIATION_CREATED',
    message: 'Associação criada com sucesso',
    details: 'O produto foi associado ao painel'
  },
  ASSOCIATION_UPDATED: {
    code: 'ASSOCIATION_UPDATED',
    message: 'Associação atualizada com sucesso',
    details: 'A associação foi atualizada'
  },
  ASSOCIATION_DELETED: {
    code: 'ASSOCIATION_DELETED',
    message: 'Associação removida com sucesso',
    details: 'A associação foi removida'
  },
  BULK_OPERATION_COMPLETED: {
    code: 'BULK_OPERATION_COMPLETED',
    message: 'Operação em lote concluída',
    details: 'Todas as operações foram processadas'
  }
};

// Função para obter mensagem de erro por código
export function getErrorMessage(errorCode: string, fallback?: string): ErrorMessage {
  return ERROR_MESSAGES[errorCode] || {
    code: 'UNKNOWN_ERROR',
    message: fallback || 'Erro desconhecido',
    userMessage: fallback || 'Ocorreu um erro inesperado. Tente novamente.',
    category: 'system'
  };
}

// Função para obter mensagem de sucesso por código
export function getSuccessMessage(successCode: string, details?: any): SuccessMessage {
  const message = SUCCESS_MESSAGES[successCode];
  if (message) {
    return {
      ...message,
      details: details || message.details
    };
  }
  
  return {
    code: 'UNKNOWN_SUCCESS',
    message: 'Operação concluída com sucesso',
    details: details
  };
}

// Função para extrair código de erro de uma resposta de API
export function extractErrorCode(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.error?.code) {
    return error.response.data.error.code;
  }
  
  if (error?.response?.data?.code) {
    return error.response.data.code;
  }
  
  if (error?.code) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
}

// Função para formatar erro para exibição ao usuário
export function formatErrorForUser(error: any): string {
  const errorCode = extractErrorCode(error);
  const errorMessage = getErrorMessage(errorCode);
  return errorMessage.userMessage;
}

// Função para determinar se é erro de validação
export function isValidationError(error: any): boolean {
  const errorCode = extractErrorCode(error);
  const errorMessage = getErrorMessage(errorCode);
  return errorMessage.category === 'validation';
}

// Função para determinar se é erro de rede
export function isNetworkError(error: any): boolean {
  const errorCode = extractErrorCode(error);
  const errorMessage = getErrorMessage(errorCode);
  return errorMessage.category === 'network';
}

// Função para criar mensagem de erro customizada
export function createErrorMessage(
  code: string,
  message: string,
  userMessage: string,
  category: 'validation' | 'business' | 'system' | 'network' = 'system'
): ErrorMessage {
  return {
    code,
    message,
    userMessage,
    category
  };
}

// Função para criar mensagem de sucesso customizada
export function createSuccessMessage(
  code: string,
  message: string,
  details?: any
): SuccessMessage {
  return {
    code,
    message,
    details
  };
}