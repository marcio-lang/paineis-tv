import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Panel, ProductPanelAssociation } from '../types';

interface PositionConflict {
  position: number;
  products: Array<{
    id: string;
    name: string;
    code: string;
    department: string;
  }>;
  severity: 'warning' | 'error';
}

interface UsePositionConflictDetectionProps {
  products: Product[];
  panels: Panel[];
  associations: ProductPanelAssociation[];
  onConflictDetected?: (conflicts: PositionConflict[]) => void;
  debounceMs?: number;
}

interface UsePositionConflictDetectionReturn {
  conflicts: PositionConflict[];
  isChecking: boolean;
  checkConflicts: (newProducts?: Product[], newAssociations?: ProductPanelAssociation[]) => void;
  getConflictsForPosition: (position: number) => PositionConflict[];
  getConflictsForProduct: (productId: string) => PositionConflict[];
  hasConflicts: boolean;
  totalConflicts: number;
}

export function usePositionConflictDetection({
  products = [],
  panels = [],
  associations = [],
  onConflictDetected,
  debounceMs = 300
}: UsePositionConflictDetectionProps): UsePositionConflictDetectionReturn {
  const [conflicts, setConflicts] = useState<PositionConflict[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkConflicts = useCallback((newProducts?: Product[], newAssociations?: ProductPanelAssociation[]) => {
    const currentProducts = newProducts || products;
    const currentAssociations = newAssociations || associations;
    
    setIsChecking(true);
    
    // Cancelar timer anterior se existir
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Usar debounce para evitar múltiplas verificações rápidas
    debounceTimerRef.current = setTimeout(() => {
      const detectedConflicts = detectPositionConflicts(currentProducts, currentAssociations);
      setConflicts(detectedConflicts);
      setIsChecking(false);
      
      if (onConflictDetected) {
        onConflictDetected(detectedConflicts);
      }
    }, debounceMs);
  }, [products, associations, onConflictDetected, debounceMs]);

  const detectPositionConflicts = useCallback((products: Product[], associations: ProductPanelAssociation[]): PositionConflict[] => {
    const conflicts: PositionConflict[] = [];
    const positionMap = new Map<number, Array<{ id: string; name: string; code: string; department: string }>>();

    // Agrupar produtos por posição
    associations.forEach(association => {
      if (association.position !== null && association.position !== undefined) {
        const product = products.find(p => p.id === association.productId);
        if (product) {
          const positionData = {
            id: product.id,
            name: product.name,
            code: product.code,
            department: product.department || 'Sem departamento'
          };
          
          if (!positionMap.has(association.position)) {
            positionMap.set(association.position, []);
          }
          positionMap.get(association.position)!.push(positionData);
        }
      }
    });

    // Identificar conflitos (posições com múltiplos produtos)
    positionMap.forEach((productsInPosition, position) => {
      if (productsInPosition.length > 1) {
        conflicts.push({
          position,
          products: productsInPosition,
          severity: 'error' // Conflito direto é sempre erro
        });
      }
    });

    return conflicts;
  }, []);

  const getConflictsForPosition = useCallback((position: number): PositionConflict[] => {
    return conflicts.filter(conflict => conflict.position === position);
  }, [conflicts]);

  const getConflictsForProduct = useCallback((productId: string): PositionConflict[] => {
    return conflicts.filter(conflict => 
      conflict.products.some(product => product.id === productId)
    );
  }, [conflicts]);

  const hasConflicts = conflicts.length > 0;
  const totalConflicts = conflicts.reduce((total, conflict) => total + conflict.products.length, 0);

  // Verificar conflitos automaticamente quando dados mudam
  useEffect(() => {
    checkConflicts();
  }, [products, associations, checkConflicts]);

  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    conflicts,
    isChecking,
    checkConflicts,
    getConflictsForPosition,
    getConflictsForProduct,
    hasConflicts,
    totalConflicts
  };
}

// Hook para validação de posição em tempo real durante edição
export function usePositionValidator() {
  const [positionErrors, setPositionErrors] = useState<Record<string, string>>({});
  const [positionWarnings, setPositionWarnings] = useState<Record<string, string>>({});

  const validatePosition = useCallback((
    position: number | null,
    productId: string,
    existingAssociations: ProductPanelAssociation[],
    ignoreAssociationId?: string
  ): { isValid: boolean; error?: string; warning?: string } => {
    if (position === null || position === undefined) {
      return { isValid: true };
    }

    // Verificar se a posição é válida (número positivo)
    if (position <= 0) {
      const error = 'A posição deve ser maior que 0';
      setPositionErrors(prev => ({ ...prev, [productId]: error }));
      return { isValid: false, error };
    }

    // Verificar conflito com outro produto na mesma posição
    const conflictingAssociations = existingAssociations.filter(assoc => 
      assoc.position === position && 
      assoc.productId !== productId &&
      assoc.id !== ignoreAssociationId
    );

    if (conflictingAssociations.length > 0) {
      const error = `Posição ${position} já está em uso por outro produto`;
      setPositionErrors(prev => ({ ...prev, [productId]: error }));
      return { isValid: false, error };
    }

    // Limpar erros se a posição for válida
    setPositionErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[productId];
      return newErrors;
    });

    // Verificar avisos (por exemplo, posições muito altas ou saltos)
    const maxPosition = Math.max(...existingAssociations.map(assoc => assoc.position || 0), 0);
    if (position > maxPosition + 1 && maxPosition > 0) {
      const warning = `Posição ${position} cria uma lacuna. Considere usar ${maxPosition + 1}`;
      setPositionWarnings(prev => ({ ...prev, [productId]: warning }));
      return { isValid: true, warning };
    }

    // Limpar avisos
    setPositionWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[productId];
      return newWarnings;
    });

    return { isValid: true };
  }, []);

  const clearPositionError = useCallback((productId: string) => {
    setPositionErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[productId];
      return newErrors;
    });
    setPositionWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[productId];
      return newWarnings;
    });
  }, []);

  const clearAllPositionErrors = useCallback(() => {
    setPositionErrors({});
    setPositionWarnings({});
  }, []);

  const hasPositionErrors = Object.keys(positionErrors).length > 0;
  const hasPositionWarnings = Object.keys(positionWarnings).length > 0;

  return {
    positionErrors,
    positionWarnings,
    validatePosition,
    clearPositionError,
    clearAllPositionErrors,
    hasPositionErrors,
    hasPositionWarnings
  };
}

// Hook para sugerir posições disponíveis
export function usePositionSuggestions() {
  const suggestAvailablePositions = useCallback((
    existingAssociations: ProductPanelAssociation[],
    limit: number = 5
  ): number[] => {
    const occupiedPositions = new Set(
      existingAssociations
        .map(assoc => assoc.position)
        .filter(pos => pos !== null && pos !== undefined)
    );

    const suggestions: number[] = [];
    let position = 1;

    while (suggestions.length < limit && position <= 100) { // Limite de segurança
      if (!occupiedPositions.has(position)) {
        suggestions.push(position);
      }
      position++;
    }

    return suggestions;
  }, []);

  const suggestNextPosition = useCallback((existingAssociations: ProductPanelAssociation[]): number => {
    const positions = existingAssociations
      .map(assoc => assoc.position)
      .filter(pos => pos !== null && pos !== undefined)
      .sort((a, b) => a - b);

    if (positions.length === 0) {
      return 1;
    }

    // Encontrar a primeira lacuna
    for (let i = 0; i < positions.length - 1; i++) {
      if (positions[i + 1] - positions[i] > 1) {
        return positions[i] + 1;
      }
    }

    // Se não houver lacunas, usar a próxima posição
    return positions[positions.length - 1] + 1;
  }, []);

  return {
    suggestAvailablePositions,
    suggestNextPosition
  };
}