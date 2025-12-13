
import { useState } from 'react';
import { ContainerLayout } from '../../components/layout/Layout';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const customers = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      document: '123.456.789-00',
      type: 'PF',
      plan: 'Pro',
      status: 'Ativo',
      mrr: 'R$ 99,90',
      joinDate: '2023-08-15',
      lastPayment: '2024-01-15'
    },
    {
      id: '2',
      name: 'Tech Corp LTDA',
      email: 'contato@techcorp.com.br',
      document: '12.345.678/0001-90',
      type: 'PJ',
      plan: 'Enterprise',
      status: 'Ativo',
      mrr: 'R$ 299,90',
      joinDate: '2023-06-20',
      lastPayment: '2024-01-14'
    },
    {
      id: '3',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      document: '987.654.321-00',
      type: 'PF',
      plan: 'Starter',
      status: 'Pendente',
      mrr: 'R$ 49,90',
      joinDate: '2024-01-10',
      lastPayment: '2024-01-10'
    },
    {
      id: '4',
      name: 'Inovação Digital LTDA',
      email: 'admin@inovacaodigital.com',
      document: '98.765.432/0001-10',
      type: 'PJ',
      plan: 'Business',
      status: 'Cancelado',
      mrr: 'R$ 0,00',
      joinDate: '2023-03-12',
      lastPayment: '2023-12-12'
    },
    {
      id: '5',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      document: '456.789.123-00',
      type: 'PF',
      plan: 'Pro',
      status: 'Suspenso',
      mrr: 'R$ 99,90',
      joinDate: '2023-11-05',
      lastPayment: '2023-12-05'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Suspenso': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'PF' ? 'ri-user-line' : 'ri-building-line';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.document.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie todos os clientes e suas assinaturas
            </p>
          </div>
          <Button>
            <i className="ri-add-line mr-2"></i>
            Novo Cliente
          </Button>
        </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <i className="ri-user-line text-xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1.247</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <i className="ri-user-check-line text-xl text-green-600 dark:text-green-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1.089</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-xl text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">47</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <i className="ri-user-unfollow-line text-xl text-red-600 dark:text-red-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cancelados</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">111</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome, email ou documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<i className="ri-search-line"></i>}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Suspenso">Suspenso</option>
                  <option value="Cancelado">Cancelado</option>
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

          {/* Customers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      MRR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Último Pagamento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <i className={`${getTypeIcon(customer.type)} text-gray-600 dark:text-gray-300`}></i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.document}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {customer.mrr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.lastPayment}
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
                  Mostrando 1 a 5 de 1.247 resultados
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <i className="ri-arrow-left-line"></i>
                  </Button>
                  <Button variant="outline" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <span className="text-gray-500">...</span>
                  <Button variant="outline" size="sm">125</Button>
                  <Button variant="outline" size="sm">
                    <i className="ri-arrow-right-line"></i>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContainerLayout>
  );
}
