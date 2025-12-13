import { useState } from 'react';
import { ContainerLayout } from '../../components/layout/Layout';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Geral', icon: 'ri-settings-3-line' },
    { id: 'appearance', name: 'Aparência', icon: 'ri-palette-line' },
    { id: 'security', name: 'Segurança', icon: 'ri-shield-line' },
    { id: 'notifications', name: 'Notificações', icon: 'ri-notification-line' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informações da Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome da Empresa"
                  defaultValue="SaaS Moderno LTDA"
                  required
                />
                <Input
                  label="Email Principal"
                  type="email"
                  defaultValue="contato@saasmoderno.com.br"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configurações de Aparência
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Personalize a aparência do sistema.
              </p>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configurações de Segurança
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie as configurações de segurança do sistema.
              </p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configurações de Notificações
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configure como você deseja receber notificações.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as configurações do seu sistema SaaS
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <i className={`${tab.icon} mr-3`}></i>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              {renderTabContent()}
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end space-x-3">
                  <Button variant="outline">
                    Cancelar
                  </Button>
                  <Button>
                    Salvar Alterações
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