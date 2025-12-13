import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface UseDebouncedSearchProps<T> {
  data: T[];
  searchFields: Array<keyof T>;
  debounceMs?: number;
  minSearchLength?: number;
  caseSensitive?: boolean;
  customFilter?: (item: T, query: string) => boolean;
}

interface UseDebouncedSearchReturn<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
  filteredData: T[];
  isSearching: boolean;
  searchResultsCount: number;
  clearSearch: () => void;
  hasActiveSearch: boolean;
}

export function useDebouncedSearch<T>({
  data = [],
  searchFields,
  debounceMs = 300,
  minSearchLength = 1,
  caseSensitive = false,
  customFilter
}: UseDebouncedSearchProps<T>): UseDebouncedSearchReturn<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce da query de pesquisa
  useEffect(() => {
    setIsSearching(true);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.length < minSearchLength) {
      setDebouncedQuery('');
      setIsSearching(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debounceMs, minSearchLength]);

  // Função de filtragem
  const filterData = useCallback((query: string): T[] => {
    if (!query || query.length < minSearchLength) {
      return data;
    }

    const searchTerm = caseSensitive ? query : query.toLowerCase();
    
    return data.filter(item => {
      // Usar filtro customizado se fornecido
      if (customFilter) {
        return customFilter(item, searchTerm);
      }

      // Filtro padrão: procurar nos campos especificados
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (fieldValue === null || fieldValue === undefined) {
          return false;
        }
        
        const stringValue = String(fieldValue);
        const valueToSearch = caseSensitive ? stringValue : stringValue.toLowerCase();
        
        return valueToSearch.includes(searchTerm);
      });
    });
  }, [data, searchFields, caseSensitive, customFilter, minSearchLength]);

  // Filtrar dados com base na query debounced
  const filteredData = filterData(debouncedQuery);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const hasActiveSearch = searchQuery.length >= minSearchLength;
  const searchResultsCount = filteredData.length;

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    filteredData,
    isSearching,
    searchResultsCount,
    clearSearch,
    hasActiveSearch
  };
}

// Hook para pesquisa com highlighting
interface UseSearchWithHighlightingProps<T> extends UseDebouncedSearchProps<T> {
  highlightClassName?: string;
}

interface UseSearchWithHighlightingReturn<T> extends UseDebouncedSearchReturn<T> {
  highlightText: (text: string, query?: string) => string;
}

export function useSearchWithHighlighting<T>({
  highlightClassName = 'bg-yellow-200 font-medium',
  ...searchProps
}: UseSearchWithHighlightingProps<T>): UseSearchWithHighlightingReturn<T> {
  const searchResult = useDebouncedSearch(searchProps);
  const { debouncedQuery } = searchResult;

  const highlightText = useCallback((text: string, query?: string): string => {
    const searchQuery = query || debouncedQuery;
    
    if (!searchQuery || !text) {
      return text;
    }

    // Simplesmente envolver o texto correspondente com marcações HTML
    const regex = new RegExp(`(${searchQuery})`, searchProps.caseSensitive ? 'g' : 'gi');
    return text.replace(regex, `<mark class="${highlightClassName}">$1</mark>`);
  }, [debouncedQuery, searchProps.caseSensitive, highlightClassName]);

  return {
    ...searchResult,
    highlightText
  };
}

// Hook para pesquisa com histórico
interface UseSearchWithHistoryProps<T> extends UseDebouncedSearchProps<T> {
  maxHistory?: number;
  storageKey?: string;
}

interface UseSearchWithHistoryReturn<T> extends UseDebouncedSearchReturn<T> {
  searchHistory: string[];
  addToHistory: (query: string) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;
}

export function useSearchWithHistory<T>({
  maxHistory = 10,
  storageKey = 'search_history',
  ...searchProps
}: UseSearchWithHistoryProps<T>): UseSearchWithHistoryReturn<T> {
  const searchResult = useDebouncedSearch(searchProps);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const history = JSON.parse(stored);
          if (Array.isArray(history)) {
            setSearchHistory(history.slice(0, maxHistory));
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar histórico de pesquisa:', error);
      }
    }
  }, [storageKey, maxHistory]);

  // Salvar histórico no localStorage
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(searchHistory));
      } catch (error) {
        console.warn('Erro ao salvar histórico de pesquisa:', error);
      }
    }
  }, [searchHistory, storageKey]);

  const addToHistory = useCallback((query: string) => {
    if (!query || query.length < searchProps.minSearchLength || searchProps.minSearchLength === undefined) {
      return;
    }

    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)];
      return newHistory.slice(0, maxHistory);
    });
  }, [maxHistory, searchProps.minSearchLength]);

  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory(prev => prev.filter(item => item !== query));
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    ...searchResult,
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
}

// Hook para pesquisa com sugestões
interface UseSearchWithSuggestionsProps<T> extends UseDebouncedSearchProps<T> {
  suggestionFields?: Array<keyof T>;
  maxSuggestions?: number;
}

interface UseSearchWithSuggestionsReturn<T> extends UseDebouncedSearchReturn<T> {
  suggestions: string[];
  addSuggestion: (suggestion: string) => void;
  removeSuggestion: (suggestion: string) => void;
}

export function useSearchWithSuggestions<T>({
  suggestionFields = [],
  maxSuggestions = 5,
  ...searchProps
}: UseSearchWithSuggestionsProps<T>): UseSearchWithSuggestionsReturn<T> {
  const searchResult = useDebouncedSearch(searchProps);
  const suggestions = useMemo(() => {
    if (!searchResult.searchQuery || searchResult.searchQuery.length < (searchProps.minSearchLength ?? 1)) {
      return [] as string[];
    }

    const query = searchProps.caseSensitive ? searchResult.searchQuery : searchResult.searchQuery.toLowerCase();
    const suggestionSet = new Set<string>();

    (searchProps.data || []).forEach(item => {
      suggestionFields.forEach(field => {
        const fieldValue = (item as any)[field];
        if (fieldValue !== null && fieldValue !== undefined) {
          const stringValue = String(fieldValue);
          const valueToSearch = searchProps.caseSensitive ? stringValue : stringValue.toLowerCase();
          if (valueToSearch.includes(query)) {
            suggestionSet.add(stringValue);
          }
        }
      });
    });

    return Array.from(suggestionSet).slice(0, maxSuggestions);
  }, [searchResult.searchQuery, searchProps.data, suggestionFields, searchProps.caseSensitive, maxSuggestions, searchProps.minSearchLength]);

  const addSuggestion = useCallback((suggestion: string) => {
    searchResult.setSearchQuery(suggestion);
  }, [searchResult.setSearchQuery]);

  const removeSuggestion = useCallback((suggestion: string) => {
    setSuggestions(prev => prev.filter(item => item !== suggestion));
  }, []);

  return {
    ...searchResult,
    suggestions,
    addSuggestion,
    removeSuggestion
  };
}