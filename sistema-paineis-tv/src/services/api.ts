// Configuração base da API
const rawApiBaseUrl = (import.meta.env.VITE_API_URL || '').trim() || '/api';
const API_BASE_URL =
  typeof window !== 'undefined' &&
  window.location?.protocol === 'https:' &&
  rawApiBaseUrl.startsWith('http://')
    ? `https://${rawApiBaseUrl.slice('http://'.length)}`
    : rawApiBaseUrl;

// Função para obter o token de autenticação
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Configuração padrão para requests
const getDefaultHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Classe para erros da API
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Função base para fazer requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { skipDefaultHeaders?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const { skipDefaultHeaders, ...requestOptions } = options;
  
  const config: RequestInit = {
    ...requestOptions,
    headers: skipDefaultHeaders 
      ? { ...options.headers }
      : {
          ...getDefaultHeaders(),
          ...options.headers,
        },
  };

  try {
    console.log('🌐 API Request:', { url, method: config.method });
    const response = await fetch(url, config);
    console.log('📡 API Response:', { status: response.status, statusText: response.statusText, url });
    
    // PRIMEIRO: Verificar status 204 (No Content) antes de qualquer outra operação
    if (response.status === 204) {
      console.log('✅ API: Status 204 - No Content');
      return null as T;
    }
    
    // SEGUNDO: Tratar erros HTTP (exceto 204 que já foi tratado)
    if (!response.ok) {
      let errorData: any = {};
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        }
      } catch {
        // Ignorar erros de parsing para mensagens de erro
      }
      
      throw new ApiError(
        (errorData && (errorData.error || errorData.message)) || `HTTP ${response.status}`,
        response.status,
        errorData && errorData.errors
      );
    }

    // TERCEIRO: Para status 201 (Created), verificar se há conteúdo
    if (response.status === 201) {
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text && text.trim()) {
            return JSON.parse(text);
          }
        }
        return null as T;
      } catch {
        return null as T;
      }
    }

    // QUARTO: Para outros status de sucesso, tentar fazer parse JSON
    try {
      const contentType = response.headers.get('content-type');
      console.log('📋 API: Content-Type:', contentType);
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        console.log('📄 API: Response text length:', text?.length);
        if (text && text.trim()) {
          const parsed = JSON.parse(text);
          console.log('✅ API: JSON parsed successfully:', parsed);
          return parsed;
        }
      }
      console.log('⚠️ API: Retornando null - sem conteúdo JSON');
      return null as T;
    } catch (error) {
      console.error('❌ API: Erro ao fazer parse JSON:', error);
      // Se não conseguir fazer parse, retornar null
      return null as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erro de rede ou outros erros
    throw new ApiError(
      'Erro de conexão com o servidor',
      0
    );
  }
}

// Métodos HTTP
export const api = {
  get: <T>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),

  // Para upload de arquivos
  upload: <T>(endpoint: string, formData: FormData) => {
    // Para FormData, não devemos definir Content-Type manualmente
    // O browser define automaticamente como multipart/form-data com boundary
    const headers: HeadersInit = {};
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return apiRequest<T>(endpoint, {
      method: 'POST',
      headers,
      body: formData,
      // Flag especial para não aplicar headers padrão
      skipDefaultHeaders: true,
    });
  },
};

// Interceptor para logout automático em caso de token inválido
const originalRequest = api.get;
api.get = async <T>(endpoint: string) => {
  try {
    return await originalRequest<T>(endpoint);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // Token inválido, fazer logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error;
  }
};

export default api;
