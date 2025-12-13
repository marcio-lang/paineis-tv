
import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';

export default function Plans() {
  const [isCreating, setIsCreating] = useState(false);

  const plans = [
    {
      id: '1',
      name: 'Starter',
      description: 'Ideal para pequenos negócios e freelancers',
      price: 49.90,
      billingCycle: 'monthly',
      features: [
        'Até 1.000 usuários',
        'Suporte por email',
        '10GB de armazenamento',
        'Relatórios básicos',
        'API básica'
      ],
      limits: {
        users: 1000,
        storage: '10GB',
        apiCalls: '10.000/mês'
      },
      status: 'Ativo',
      subscribers: 247,
      mrr: 12323.30,
      popular: false
    },
    {
      id: '2',
      name: 'Pro',
      description: 'Para empresas em crescimento',
      price: 99.90,
      billingCycle: 'monthly',
      features: [
        'Até 5.000 usuários',
        'Suporte prioritário',
        '50GB de armazenamento',
        'Relatórios avançados',
        'API completa',
        'Integrações premium'
      ],
      limits: {
        users: 5000,
        storage: '50GB',
        apiCalls: '100.000/mês'
      },
      status: 'Ativo',
      subscribers: 589,
      mrr: 58841.10,
      popular: true
    },
    {
      id: '3',
      name: 'Business',
      description: 'Para empresas estabelecidas',
      price: 199.90,
      billingCycle: 'monthly',
      features: [
        'Até 15.000 usuários',
        'Suporte 24/7',
        '200GB de armazenamento',
        'Relatórios personalizados',
        'API ilimitada',
        'White-label',
        'SSO'
      ],
      limits: {
        users: 15000,
        storage: '200GB',
        apiCalls: 'Ilimitado'
      },
      status: 'Ativo',
      subscribers: 312,
      mrr: 62368.80,
      popular: false
    },
    {
      id: '4',
      name: 'Enterprise',
      description: 'Solução completa para grandes empresas',
      price: 299.90,
      billingCycle: 'monthly',
      features: [
        'Usuários ilimitados',
        'Suporte dedicado',
        'Armazenamento ilimitado',
        'Relatórios customizados',
        'API enterprise',
        'White-label completo',
        'SSO avançado',
        'SLA garantido'
      ],
      limits: {
        users: 'Ilimitado',
        storage: 'Ilimitado',
        apiCalls: 'Ilimitado'
      },
      status: 'Ativo',
      subscribers: 99,
      mrr: 29690.10,
      popular: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Inativo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Rascunho': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalMRR = plans.reduce((sum, plan) => sum + plan.mrr, 0);
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Planos e Preços
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie seus planos de assinatura e preços
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <i className="ri-add-line mr-2"></i>
              Novo Plano
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <i className="ri-price-tag-3-line text-xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Planos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-xl text-green-600 dark:text-green-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">MRR Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <i className="ri-user-line text-xl text-purple-600 dark:text-purple-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Assinantes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSubscribers.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <i className="ri-bar-chart-line text-xl text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">ARPU Médio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {(totalMRR / totalSubscribers).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {plans.map((plan) => (
              <div key={plan.id} className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${plan.popular ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'} relative overflow-hidden`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                
                <div className={`p-6 ${plan.popular ? 'pt-12' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">/mês</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Assinantes</span>
                      <span className="font-medium text-gray-900 dark:text-white">{plan.subscribers}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">MRR</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        R$ {plan.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recursos:</h4>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <i className="ri-check-line text-green-500 mr-2"></i>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-sm text-gray-500 dark:text-gray-400">
                          +{plan.features.length - 3} recursos adicionais
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <i className="ri-edit-line mr-1"></i>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm">
                      <i className="ri-more-line"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plans Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalhes dos Planos
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assinantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      MRR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Limites
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {plan.popular && (
                            <i className="ri-star-fill text-yellow-400 mr-2"></i>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {plan.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {plan.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          por mês
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {plan.subscribers.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        R$ {plan.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {plan.limits.users} usuários
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.limits.storage} • {plan.limits.apiCalls}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
