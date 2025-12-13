import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    document: '123.456.789-00',
    company: 'Minha Empresa LTDA',
    position: 'CEO',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: 'ri-user-line' },
    { id: 'security', label: 'Segurança', icon: 'ri-shield-line' },
    { id: 'preferences', label: 'Preferências', icon: 'ri-settings-line' },
    { id: 'billing', label: 'Faturamento', icon: 'ri-bill-line' }
  ];

  const sessions = [
    {
      device: 'Chrome no Windows',
      location: 'São Paulo, SP',
      lastActive: '2024-01-15 14:30',
      current: true
    },
    {
      device: 'Safari no iPhone',
      location: 'São Paulo, SP',
      lastActive: '2024-01-14 09:15',
      current: false
    },
    {
      device: 'Firefox no MacOS',
      location: 'Rio de Janeiro, RJ',
      lastActive: '2024-01-13 16:45',
      current: false
    }
  ];

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 'R$ 99,90',
      status: 'Pago',
      plan: 'Pro'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 'R$ 99,90',
      status: 'Pago',
      plan: 'Pro'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 'R$ 99,90',
      status: 'Pago',
      plan: 'Pro'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Meu Perfil
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas informações pessoais e configurações de conta
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <i className={`${tab.icon} mr-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Personal Data Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nome Completo
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Telefone
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CPF
                        </label>
                        <Input
                          value={formData.document}
                          onChange={(e) => handleInputChange('document', e.target.value)}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Empresa
                        </label>
                        <Input
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Nome da empresa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cargo
                        </label>
                        <Input
                          value={formData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          placeholder="Seu cargo"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <i className="ri-save-line mr-2"></i>
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Alterar Senha
                    </h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Senha Atual
                        </label>
                        <Input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                          placeholder="Digite sua senha atual"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nova Senha
                        </label>
                        <Input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder="Digite a nova senha"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirmar Nova Senha
                        </label>
                        <Input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                      <Button>
                        <i className="ri-lock-line mr-2"></i>
                        Alterar Senha
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Autenticação de Dois Fatores
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">2FA não configurado</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Adicione uma camada extra de segurança à sua conta
                        </p>
                      </div>
                      <Button variant="outline">
                        <i className="ri-shield-check-line mr-2"></i>
                        Configurar 2FA
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Sessões Ativas
                    </h3>
                    <div className="space-y-3">
                      {sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <i className="ri-computer-line text-blue-600 dark:text-blue-400"></i>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {session.device}
                                {session.current && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                                    Atual
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {session.location} • {session.lastActive}
                              </p>
                            </div>
                          </div>
                          {!session.current && (
                            <Button variant="outline" size="sm">
                              <i className="ri-logout-box-line mr-2"></i>
                              Encerrar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Notificações
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Notificações por Email</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receba atualizações importantes por email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Notificações Push</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receba notificações no navegador
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Relatórios Semanais</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receba resumos semanais por email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Privacidade
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Compartilhamento de Dados</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Permitir compartilhamento de dados para melhorias
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Marketing</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receber comunicações de marketing
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <i className="ri-save-line mr-2"></i>
                      Salvar Preferências
                    </Button>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Endereço de Cobrança
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Endereço
                        </label>
                        <Input placeholder="Rua, número" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cidade
                        </label>
                        <Input placeholder="Cidade" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CEP
                        </label>
                        <Input placeholder="00000-000" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estado
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8">
                          <option value="">Selecione o estado</option>
                          <option value="SP">São Paulo</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="MG">Minas Gerais</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          País
                        </label>
                        <Input value="Brasil" disabled />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Histórico de Faturas
                    </h3>
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                              <i className="ri-file-text-line text-green-600 dark:text-green-400"></i>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{invoice.id}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {invoice.date} • {invoice.plan}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">{invoice.amount}</p>
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                                {invoice.status}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <i className="ri-download-line"></i>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <i className="ri-save-line mr-2"></i>
                      Salvar Endereço
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}