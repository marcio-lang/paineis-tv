import { useState, useEffect } from 'react';
import { panelService } from '../services/panelService';
import { actionService } from '../services/actionService';
import { userService } from '../services/userService';
import { butcherService } from '../services/butcherService';
import { useAuth } from '../contexts/AuthContext';

export interface DashboardStats {
  panels: {
    total: number;
    active: number;
    loading: boolean;
    error: string | null;
  };
  actions: {
    total: number;
    active: number;
    loading: boolean;
    error: string | null;
  };
  users: {
    total: number;
    active: number;
    loading: boolean;
    error: string | null;
  };
  butcher: {
    total: number;
    active: number;
    loading: boolean;
    error: string | null;
  };
}

export const useDashboardStats = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    panels: { total: 0, active: 0, loading: true, error: null },
    actions: { total: 0, active: 0, loading: true, error: null },
    users: { total: 0, active: 0, loading: true, error: null },
    butcher: { total: 0, active: 0, loading: true, error: null },
  });

  const fetchPanelStats = async () => {
    try {
      setStats(prev => ({
        ...prev,
        panels: { ...prev.panels, loading: true, error: null }
      }));

      const panels = await panelService.getPanels();
      const safePanels = panels || [];
      
      setStats(prev => ({
        ...prev,
        panels: {
          total: safePanels?.length || 0,
          active: safePanels?.filter(panel => (panel as any).actions_count > 0)?.length || 0,
          loading: false,
          error: null
        }
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas dos painéis:', error);
      setStats(prev => ({
        ...prev,
        panels: {
          total: 0,
          active: 0,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar painéis'
        }
      }));
    }
  };

  const fetchActionStats = async () => {
    try {
      setStats(prev => ({
        ...prev,
        actions: { ...prev.actions, loading: true, error: null }
      }));

      const actions = await actionService.getActions();
      const safeActions = actions || [];
      const activeActions = actionService.getActiveActions(safeActions);
      const safeActiveActions = activeActions || [];
      
      setStats(prev => ({
        ...prev,
        actions: {
          total: safeActions?.length || 0,
          active: safeActiveActions?.length || 0,
          loading: false,
          error: null
        }
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas das ações:', error);
      setStats(prev => ({
        ...prev,
        actions: {
          total: 0,
          active: 0,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar ações'
        }
      }));
    }
  };

  const fetchUserStats = async () => {
    // Verificar se o usuário tem permissões de admin antes de tentar carregar estatísticas
    if (!user || !hasRole('admin')) {
      console.log('Usuário não tem permissões de admin, pulando estatísticas de usuários');
      setStats(prev => ({
        ...prev,
        users: {
          total: 0,
          active: 0,
          loading: false,
          error: 'Acesso restrito - apenas administradores'
        }
      }));
      return;
    }

    try {
      setStats(prev => ({
        ...prev,
        users: { ...prev.users, loading: true, error: null }
      }));

      // Buscar uma página grande para obter todos os usuários para estatísticas
      const usersResponse = await userService.getUsers(1, 1000);
      const safeUsersResponse = usersResponse || { data: [], total: 0 };
      const activeUsers = safeUsersResponse?.data?.filter(user => user.active) || [];
      
      setStats(prev => ({
        ...prev,
        users: {
          total: safeUsersResponse?.total || 0,
          active: activeUsers?.length || 0,
          loading: false,
          error: null
        }
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas dos usuários:', error);
      setStats(prev => ({
        ...prev,
        users: {
          total: 0,
          active: 0,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar usuários'
        }
      }));
    }
  };

  const fetchButcherStats = async () => {
    try {
      setStats(prev => ({
        ...prev,
        butcher: { ...prev.butcher, loading: true, error: null }
      }));

      const products = await butcherService.getProducts();
      const safeProducts = products || [];
      const productStats = butcherService.getProductStats(safeProducts);
      const safeProductStats = productStats || { total: 0, active: 0 };
      
      setStats(prev => ({
        ...prev,
        butcher: {
          total: safeProductStats?.total || 0,
          active: safeProductStats?.active || 0,
          loading: false,
          error: null
        }
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas do açougue:', error);
      setStats(prev => ({
        ...prev,
        butcher: {
          total: 0,
          active: 0,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar produtos do açougue'
        }
      }));
    }
  };

  const refreshStats = () => {
    fetchPanelStats();
    fetchActionStats();
    fetchUserStats(); // Agora verifica permissões internamente
    fetchButcherStats();
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const isLoading = stats.panels.loading || stats.actions.loading || stats.users.loading || stats.butcher.loading;
  const hasError = stats.panels.error || stats.actions.error || stats.users.error || stats.butcher.error;

  return {
    stats,
    isLoading,
    hasError,
    refreshStats
  };
};