import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, hasRole, isLoading, user } = useAuth();
  const location = useLocation();

  // Debug: Log no console em vez de alert
  console.log('ProtectedRoute: Componente executado');
  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    console.log('ProtectedRoute: Ainda carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Usuário não autenticado, redirecionando para login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    console.log('ProtectedRoute: Usuário não tem permissão para acessar esta rota');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <i className="ri-shield-cross-line text-2xl text-red-600 dark:text-red-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute: Usuário autenticado, renderizando conteúdo protegido');
  return <>{children}</>;
};

export default ProtectedRoute;