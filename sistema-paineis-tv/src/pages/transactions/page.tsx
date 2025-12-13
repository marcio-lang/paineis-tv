
import { useState } from 'react';
import { ContainerLayout } from '../../components/layout/Layout';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('30');

  const transactions = [
    {
      id: '#TXN-12847',
      customer: 'João Silva',
      customerEmail: 'joao.silva@email.com',
      plan: 'Pro',
      amount: 'R$ 99,90',
      status: 'Pago',
      paymentMethod: 'Cartão de Crédito',
      gatewayId: 'asaas_123456',
      date: '2024-01-15 14:30',
      dueDate: '2024-01-15',
      description: 'Assinatura mensal - Plano Pro'
    },
    {
      id: '#TXN-12846',
      customer: 'Maria Santos',
      customerEmail: 'maria.santos@email.com',
      plan: 'Enterprise',
      amount: 'R$ 299,90',
      status: 'Pendente',
      paymentMethod: 'Boleto',
      gatewayId: 'asaas_123455',
      date: '2024-01-15 10:15',
      dueDate: '2024-01-17',
      description: 'Assinatura mensal - Plano Enterprise'
    },
    {
      id: '#TXN-12845',
      customer: 'Tech Corp LTDA',
      customerEmail: 'contato@techcorp.com.br',
      plan: 'Business',
      amount: 'R$ 199,90',
      status: 'Pago',
      paymentMethod: 'PIX',
      gatewayId: 'asaas_123454',
      date: '2024-01-14 16:45',
      dueDate: '2024-01-14',
      description: 'Assinatura mensal - Plano Business'
    },
    {
      id: '#TXN-12844',
      customer: 'Ana Costa',
      customerEmail: 'ana.costa@email.com',
      plan: 'Starter',
      amount: 'R$ 49,90',
      status: 'Falhou',
      paymentMethod: 'Cartão de Crédito',
      gatewayId: 'asaas_123453',
      date: '2024-01-14 09:20',
      dueDate: '2024-01-14',
      description: 'Assinatura mensal - Plano Starter'
    },
    {
      id: '#TXN-12843',
      customer: 'Carlos Oliveira',
      customerEmail: 'carlos.oliveira@email.com',
      plan: 'Pro',
      amount: 'R$ 99,90',
      status: 'Estornado',
      paymentMethod: 'Cartão de Crédito',
      gatewayId: 'asaas_123452',
      date: '2024-01-13 11:30',
      dueDate: '2024-01-13',
      description: 'Assinatura mensal - Plano Pro'
    },
    {
      id: '#TXN-12842',
      customer: 'Startup XYZ LTDA',
      customerEmail: 'admin@startupxyz.com',
      plan: 'Enterprise',
      amount: 'R$ 2.999,00',
      status: 'Pago',
      paymentMethod: 'Transferência',
      gatewayId: 'asaas_123451',
      date: '2024-01-12 15:00',
      dueDate: '2024-01-12',
      description: 'Assinatura anual - Plano Enterprise'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Falhou': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Estornado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Cancelado': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cartão de Crédito': return 'ri-bank-card-line';
      case 'Boleto': return 'ri-file-text-line';
      case 'PIX': return 'ri-qr-code-line';
      case 'Transferência': return 'ri-exchange-line';
      default: return 'ri-money-dollar-circle-line';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.gatewayId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = transactions.reduce((sum, t) => {
    if (t.status === 'Pago') {
      return sum + parseFloat(t.amount.replace('R$ ', '').replace('.', '').replace(',', '.'));
    }
    return sum;
  }, 0);

  const pendingAmount = transactions.reduce((sum, t) => {
    if (t.status === 'Pendente') {
      return sum + parseFloat(t.amount.replace('R$ ', '').replace('.', '').replace(',', '.'));
    }
    return sum;
  }, 0);

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Transações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie todas as transações e pagamentos
            </p>
          </div>
        </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-xl text-green-600 dark:text-green-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Recebido</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-xl text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendente</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <i className="ri-file-list-line text-xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Transações</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">2.847</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <i className="ri-percent-line text-xl text-purple-600 dark:text-purple-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">94.2%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por ID, cliente, email ou gateway..."
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
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Falhou">Falhou</option>
                  <option value="Estornado">Estornado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                  <option value="365">Último ano</option>
                </select>
                <Button variant="outline">
                  <i className="ri-calendar-line mr-2"></i>
                  Período
                </Button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Transação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Gateway: {transaction.gatewayId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.customer}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.amount}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.plan}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <i className={`${getPaymentMethodIcon(transaction.paymentMethod)} mr-2 text-gray-400`}></i>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {transaction.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {transaction.date.split(' ')[0]}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.date.split(' ')[1]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <i className="ri-eye-line"></i>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <i className="ri-download-line"></i>
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
                  Mostrando 1 a 6 de 2.847 resultados
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <i className="ri-arrow-left-line"></i>
                  </Button>
                  <Button variant="outline" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <span className="text-gray-500">...</span>
                  <Button variant="outline" size="sm">475</Button>
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
