import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const subscriptions = [
    {
      id: '1',
      customer: 'João Silva',
      email: 'joao.silva@email.com',
      plan: 'Pro',
      value: 'R$ 99,90',
      cycle: 'Mensal',
      status: 'Ativa',
      nextBilling: '2024-02-15',
      paymentMethod: 'Cartão de Crédito',
      startDate: '2023-08-15'
    },
    {
      id: '2',
      customer: 'Tech Corp LTDA',
      email: 'contato@techcorp.com.br',
      plan: 'Enterprise',
      value: 'R$ 299,90',
      cycle: 'Mensal',
      status: 'Ativa',
      nextBilling: '2024-02-20',
      paymentMethod: 'Boleto',
      startDate: '2023-06-20'
    },
    {
      id: '3',
      customer: 'Maria Santos',
      email: 'maria.santos@email.com',
      plan: 'Starter',
      value: 'R$ 49,90',
      cycle: 'Mensal',
      status: 'Pausada',
      nextBilling: '-',
      paymentMethod: 'PIX',
      startDate: '2024-01-10'
    },
    {
      id: '4',
      customer: 'Inovação Digital LTDA',
      email: 'admin@inovacaodigital.com',
      plan: 'Business',
      value: 'R$ 199,90',
      cycle: 'Anual',
      status: 'Cancelada',
      nextBilling: '-',
      paymentMethod: 'Cartão de Crédito',
      startDate: '2023-03-12'
    },
    {
      id: '5',
      customer: 'Ana Costa',
      email: 'ana.costa@email.com',
      plan: 'Pro',
      value: 'R$ 99,90',
      cycle: 'Mensal',
      status: 'Vencida',
      nextBilling: '2024-01-05',
      paymentMethod: 'Cartão de Crédito',
      startDate: '2023-11-05'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pausada': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Vencida': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Cancelada': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cartão de Crédito': return 'ri-bank-card-line';
      case 'Boleto': return 'ri-file-text-line';
      case 'PIX': return 'ri-qr-code-line';
      default: return 'ri-money-dollar-circle-line';
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || subscription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Assinaturas
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie todas as assinaturas dos seus clientes
              </p>
            </div>
            <Button>
              <i className="ri-add-line mr-2"></i>
              Nova Assinatura
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <i className="ri-check-line text-xl text-green-600 dark:text-green-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assinaturas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1.089</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <i className="ri-pause-line text-xl text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pausadas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">47</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-xl text-orange-600 dark:text-orange-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vencidas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">MRR Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ 127.450</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por cliente, email ou plano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<i className="ri-search-line"></i>}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Ativa">Ativa</option>
                  <option value="Pausada">Pausada</option>
                  <option value="Vencida">Vencida</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
                <Button variant="outline">
                  <i className="ri-filter-line mr-2"></i>
                  Filtros
                </Button>
                <Button variant="outline">
                  <i className="ri-download-line mr-2"></i>
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Próxima Cobrança
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <i className="ri-user-line text-blue-600 dark:text-blue-400"></i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {subscription.customer}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {subscription.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{subscription.plan}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{subscription.cycle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {subscription.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {subscription.nextBilling}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <i className={`${getPaymentIcon(subscription.paymentMethod)} text-gray-400 mr-2`}></i>
                          <span className="text-sm text-gray-900 dark:text-white">{subscription.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <i className="ri-eye-line"></i>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <i className="ri-edit-line"></i>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <i className="ri-more-line"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando 1 a 5 de 1.159 resultados
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <i className="ri-arrow-left-line"></i>
                  </Button>
                  <Button variant="outline" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <span className="text-gray-500">...</span>
                  <Button variant="outline" size="sm">116</Button>
                  <Button variant="outline" size="sm">
                    <i className="ri-arrow-right-line"></i>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}