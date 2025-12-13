// Tipos principais do sistema de produtos do açougue

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  position?: number;
  isActive: boolean;
  category: string;
  unit: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  panelIds?: string[];
}

export interface Panel {
  id: string;
  name: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPanelAssociation {
  id: string;
  productId: string;
  panelId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PositionConflict {
  position: number;
  products: Product[];
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

// Tipos para formulários
export interface ProductFormData {
  code: string;
  name: string;
  description?: string;
  price: number;
  position?: number;
  isActive: boolean;
  category: string;
  unit: string;
  imageUrl?: string;
}

// Tipos para filtros e pesquisa
export interface ProductFilters {
  search?: string;
  category?: string;
  status?: 'all' | 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  hasPosition?: boolean;
}

// Tipos para ordenação
export interface SortConfig {
  field: keyof Product;
  direction: 'asc' | 'desc';
}

// Enum para categorias
export enum ProductCategory {
  BOVINA = 'BOVINA',
  SUINA = 'SUINA',
  FRANGO = 'FRANGO',
  PEIXE = 'PEIXE',
  EMBUTIDOS = 'EMBUTIDOS',
  OUTROS = 'OUTROS'
}

// Enum para unidades
export enum ProductUnit {
  KG = 'KG',
  UN = 'UN',
  CX = 'CX',
  PC = 'PC'
}

// Tipos para mensagens de erro
export interface ErrorMessage {
  code: string;
  message: string;
  field?: string;
  type: 'validation' | 'business' | 'system' | 'network';
}

export interface SuccessMessage {
  code: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

// Tipos para hooks customizados
export interface UseCodeValidationReturn {
  code: string;
  setCode: (code: string) => void;
  isValid: boolean;
  error?: string;
  isChecking: boolean;
  suggestions: string[];
  validateCode: () => Promise<void>;
  generateCodeSuggestion: (baseName?: string) => string;
}

export interface UsePositionConflictReturn {
  positionConflicts: PositionConflict[];
  checkPositionConflict: (position: number, productId?: string) => PositionConflict | null;
  getPositionSuggestions: (productId?: string) => number[];
  getNextAvailablePosition: () => number;
}

export interface UseDebouncedSearchReturn<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: T[];
  isSearching: boolean;
  clearSearch: () => void;
}

export interface UseMessageHandlingReturn {
  loading: boolean;
  error: string | null;
  success: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  clearMessages: () => void;
  handleApiResponse: <T>(promise: Promise<ApiResponse<T>>) => Promise<T | null>;
}

// Tipos para componentes
export interface ProductTableColumn {
  key: keyof Product;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, product: Product) => React.ReactNode;
}

export interface QuickActionProps {
  product: Product;
  onAssociate: (panelId: string, position?: number) => Promise<void>;
  onDisassociate: (panelId: string) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export interface MultiSelectProps {
  products: Product[];
  selectedProductIds: string[];
  onSelectionChange: (ids: string[]) => void;
  className?: string;
}

// Constantes úteis
export const PRODUCT_CATEGORIES = [
  { value: '', label: 'Todas as Categorias' },
  { value: 'BOVINA', label: 'Bovina' },
  { value: 'SUINA', label: 'Suína' },
  { value: 'FRANGO', label: 'Frango' },
  { value: 'PEIXE', label: 'Peixe' },
  { value: 'EMBUTIDOS', label: 'Embutidos' },
  { value: 'OUTROS', label: 'Outros' }
];

export const PRODUCT_UNITS = [
  { value: 'KG', label: 'Quilograma (KG)' },
  { value: 'UN', label: 'Unidade (UN)' },
  { value: 'CX', label: 'Caixa (CX)' },
  { value: 'PC', label: 'Peça (PC)' }
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' }
];

// Funções utilitárias
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const generateProductCode = (name: string, existingCodes: string[]): string => {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
  
  let code = base;
  let counter = 1;
  
  while (existingCodes.includes(code)) {
    code = `${base}-${counter.toString().padStart(2, '0')}`;
    counter++;
  }
  
  return code;
};

export const validateProductCode = (code: string): ValidationResult => {
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      error: 'Código é obrigatório'
    };
  }
  
  if (code.length < 2) {
    return {
      isValid: false,
      error: 'Código deve ter pelo menos 2 caracteres'
    };
  }
  
  if (!/^[A-Z0-9-]+$/.test(code)) {
    return {
      isValid: false,
      error: 'Código deve conter apenas letras maiúsculas, números e hífens'
    };
  }
  
  return {
    isValid: true
  };
};