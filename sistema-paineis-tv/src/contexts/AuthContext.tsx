
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User, LoginForm, RegisterForm } from '../types';

// Função para verificar se o usuário tem permissão
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'admin': 2,
    'user': 1,
    'usuario': 1
  };
  
  return (roleHierarchy[userRole as keyof typeof roleHierarchy] || 0) >= 
         (roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0);
};

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log no console em vez de alert
  console.log('AuthProvider: Componente renderizado');

  useEffect(() => {
    // Debug: Log no console em vez de alert
    console.log('AuthProvider useEffect: Executando inicialização');
    
    // Verificar se há token salvo e validar
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('AuthProvider: Token encontrado:', !!token);
        console.log('AuthProvider: Usuário salvo encontrado:', !!savedUser);
        console.log(`AuthProvider: Token: ${!!token}, Usuário: ${!!savedUser}`);
        
        if (token && savedUser) {
          try {
            // Verificar se o token ainda é válido
            const validUser = await authService.verifyToken();
            console.log('AuthProvider: Token válido, usuário:', validUser);
            console.log(`AuthProvider: Token válido, usuário: ${validUser?.name}`);
            setUser(validUser);
          } catch (error) {
            // Token inválido, limpar dados
            console.log('AuthProvider: Token inválido, limpando dados');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          console.log('AuthProvider: Nenhum token ou usuário encontrado');
        }
      } catch (error) {
        console.error('AuthProvider: Erro na inicialização:', error);
        setUser(null);
      } finally {
        console.log('AuthProvider: Finalizando carregamento');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Fazendo login...');
      const response = await authService.login(credentials);
      console.log('AuthContext: Login bem-sucedido, atualizando estado do usuário:', response.user);
      setUser(response.user);
      console.log('AuthContext: Estado do usuário atualizado');
    } catch (error: any) {
      console.error('AuthContext: Erro no login:', error);
      let errorMessage = 'Erro no login';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      setUser(response.user);
    } catch (error: any) {
      let errorMessage = 'Erro no registro';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role, role);
  };

  const isAuthenticated = !!user;

  console.log('AuthProvider: Estado atual - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);
  console.log(`AuthProvider: Estado - Auth: ${isAuthenticated}, Loading: ${isLoading}, User: ${user?.name || 'null'}`);

  const contextValue = React.useMemo(() => ({
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated,
    hasRole,
    error,
    clearError
  }), [user, isLoading, isAuthenticated, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
