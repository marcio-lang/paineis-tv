import { useState } from 'react';
import { ContainerLayout } from '../../components/layout/Layout';
import { Button } from '../../components/base/Button';
import { Card } from '../../components/base/Card';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { StaggeredAnimation } from '../../components/ui/AnimatedPage';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
  DollarSign, 
  Users, 
  UserMinus, 
  Tag, 
  Download, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Monitor,
  Zap,
  ShoppingCart,
  Activity
} from 'lucide-react';
import { AreaChartComponent, BarChartComponent, DonutChart } from '../../components/ui/Charts';

export default function HomePage() {
  const { stats, isLoading: statsLoading, hasError, refreshStats } = useDashboardStats();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  const statsData = [
    {
      title: 'Painéis Ativos',
      value: stats.panels.loading ? '...' : stats.panels.active.toString(),
      change: '+3',
      trend: 'up',
      icon: Monitor,
      color: 'blue',
      description: 'Painéis em exibição',
      loading: stats.panels.loading,
      error: stats.panels.error
    },
    {
      title: 'Ações Cadastradas',
      value: stats.actions.loading ? '...' : stats.actions.total.toString(),
      change: '+12',
      trend: 'up',
      icon: Zap,
      color: 'green',
      description: 'Ações disponíveis',
      loading: stats.actions.loading,
      error: stats.actions.error
    },
    {
      title: 'Usuários Ativos',
      value: stats.users.loading ? '...' : stats.users.active.toString(),
      change: '+2',
      trend: 'up',
      icon: Users,
      color: 'purple',
      description: 'Usuários do sistema',
      loading: stats.users.loading,
      error: stats.users.error
    },
    {
      title: 'Produtos Açougue',
      value: stats.butcher.loading ? '...' : stats.butcher.active.toString(),
      change: '+5',
      trend: 'up',
      icon: ShoppingCart,
      color: 'orange',
      description: 'Produtos cadastrados',
      loading: stats.butcher.loading,
      error: stats.butcher.error
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'painel',
      title: 'Painel "Promoções Janeiro" criado',
      user: 'João Silva',
      time: '2 min atrás',
      status: 'success'
    },
    {
      id: '2',
      type: 'acao',
      title: 'Ação "Desconto Carnes" atualizada',
      user: 'Maria Santos',
      time: '15 min atrás',
      status: 'info'
    },
    {
      id: '3',
      type: 'acougue',
      title: 'Produto "Picanha Premium" adicionado',
      user: 'Carlos Oliveira',
      time: '1 hora atrás',
      status: 'success'
    },
    {
      id: '4',
      type: 'usuario',
      title: 'Novo usuário cadastrado',
      user: 'Admin',
      time: '2 horas atrás',
      status: 'info'
    }
  ];

  const quickActions = [
    {
      title: 'Criar Painel',
      description: 'Novo painel de TV',
      icon: Monitor,
      href: '/paineis',
      color: 'blue'
    },
    {
      title: 'Nova Ação',
      description: 'Cadastrar ação',
      icon: Zap,
      href: '/acoes',
      color: 'green'
    },
    {
      title: 'Gerenciar Usuários',
      description: 'Administrar usuários',
      icon: Users,
      href: '/usuarios',
      color: 'purple'
    },
    {
      title: 'Açougue Admin',
      description: 'Gerenciar produtos',
      icon: ShoppingCart,
      href: '/acougue-admin',
      color: 'orange'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    };
    return colors[color as keyof typeof colors];
  };

  const getActionColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visão geral do sistema de painéis TV
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
            <Button className="whitespace-nowrap">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} hover interactive className="group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatColor(stat.color)} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</h3>
                {stat.loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  </div>
                ) : stat.error ? (
                  <p className="text-2xl font-bold text-red-500 mb-1">Erro</p>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500">{stat.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ações Rápidas
                </h2>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className={`
                        group relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg
                        bg-gradient-to-br ${getActionColor(action.color)}
                      `}
                    >
                      <div className="relative z-10">
                        <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-200" />
                        <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                        <p className="text-white/80 text-sm">{action.description}</p>
                      </div>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atividades Recentes
              </h2>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                    ${getStatusColor(activity.status)}
                  `}>
                    {activity.type.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      por {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" className="w-full text-sm">
                Ver todas as atividades
              </Button>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Visualizações por Período
              </h3>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
            <AreaChartComponent
              data={[
                { name: 'Jan', value: 400 },
                { name: 'Fev', value: 300 },
                { name: 'Mar', value: 600 },
                { name: 'Abr', value: 800 },
                { name: 'Mai', value: 500 },
                { name: 'Jun', value: 900 }
              ]}
              dataKey="value"
              height={250}
              colors={['#3B82F6']}
              gradient={true}
            />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Distribuição por Categoria
              </h3>
            </div>
            <DonutChart
              data={[
                { name: 'Promoções', value: 35 },
                { name: 'Cardápio', value: 25 },
                { name: 'Ofertas', value: 20 },
                { name: 'Eventos', value: 20 }
              ]}
              dataKey="value"
              height={250}
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
              centerLabel="Total"
              centerValue="100"
            />
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <Card className="xl:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Performance dos Painéis
              </h3>
            </div>
            <BarChartComponent
              data={[
                { name: 'Painel 1', value: 85 },
                { name: 'Painel 2', value: 92 },
                { name: 'Painel 3', value: 78 },
                { name: 'Painel 4', value: 88 },
                { name: 'Painel 5', value: 95 }
              ]}
              dataKey="value"
              height={200}
              colors={['#10B981']}
              barRadius={6}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Métricas do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memória</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Armazenamento</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Status do Sistema
            </h2>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Todos os serviços operacionais
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'API Backend', status: 'online', uptime: '99.9%' },
              { name: 'Banco de Dados', status: 'online', uptime: '99.8%' },
              { name: 'Servidor de Mídia', status: 'online', uptime: '99.7%' },
              { name: 'Sistema de Cache', status: 'online', uptime: '99.9%' }
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uptime: {service.uptime}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ContainerLayout>
  );
}