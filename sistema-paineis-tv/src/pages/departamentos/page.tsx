import React, { useState, useEffect } from 'react';
import { Plus, Package, Settings, Eye, Trash2, Edit, Users, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { departmentService } from '../../services/departmentService';
import type { Department, DepartmentPanel } from '../../services/departmentService';
import CreateDepartmentModal from '../../components/departments/CreateDepartmentModal';
import EditDepartmentModal from '../../components/departments/EditDepartmentModal';
import CreatePanelModal from '../../components/departments/CreatePanelModal';
import EditPanelModal from '../../components/departments/EditPanelModal';
import ManagePanelProductsModal from '../../components/departments/ManagePanelProductsModal';
import { ContainerLayout } from '../../components/layout/Layout';

const DepartamentosPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentPanels, setDepartmentPanels] = useState<DepartmentPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelsLoading, setPanelsLoading] = useState(false);

  // Modais
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showEditDepartment, setShowEditDepartment] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showManageProducts, setShowManageProducts] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingPanel, setEditingPanel] = useState<DepartmentPanel | null>(null);
  const [managingPanel, setManagingPanel] = useState<DepartmentPanel | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadDepartmentPanels(selectedDepartment.id);
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getDepartments();
      
      setDepartments(data);
      
      // Selecionar o primeiro departamento automaticamente se não houver um selecionado
      if (data && data.length > 0 && !selectedDepartment) {
        setSelectedDepartment(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      toast.error('Erro ao carregar departamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentPanels = async (departmentId: string) => {
    try {
      setPanelsLoading(true);
      const data = await departmentService.getDepartmentPanels(departmentId);
      setDepartmentPanels(data);
    } catch (error) {
      console.error('Erro ao carregar painéis:', error);
      toast.error('Erro ao carregar painéis do departamento');
    } finally {
      setPanelsLoading(false);
    }
  };

  const handleCreateDepartment = async (data: any) => {
    try {
      const nextCode = typeof data.code === 'string' ? data.code.trim().toUpperCase() : '';
      if (nextCode) {
        const exists = departments.some(d => (d.code || '').trim().toUpperCase() === nextCode);
        if (exists) {
          toast.error('Já existe um departamento com este código');
          return;
        }
      }
      await departmentService.createDepartment(data);
      toast.success('Departamento criado com sucesso!');
      setShowCreateDepartment(false);
      loadDepartments();
    } catch (error: any) {
      console.error('Erro ao criar departamento:', error);
      toast.error(error?.message || 'Erro ao criar departamento');
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setShowEditDepartment(true);
  };

  const handleUpdateDepartment = async (data: any) => {
    if (!editingDepartment) return;
    
    console.log('handleUpdateDepartment - Dados recebidos:', data);
    console.log('handleUpdateDepartment - Departamento atual:', editingDepartment);

    try {
      const payload: any = {
        name: typeof data.name === 'string' ? data.name.trim() : editingDepartment.name,
        description: typeof data.description === 'string' ? data.description : (editingDepartment.description || ''),
        color: typeof data.color === 'string' ? data.color.trim() : (editingDepartment.color || '#3B82F6'),
        product_name_color: typeof data.product_name_color === 'string'
          ? data.product_name_color.trim()
          : (editingDepartment.product_name_color || '#000000'),
        price_color: typeof data.price_color === 'string'
          ? data.price_color.trim()
          : (editingDepartment.price_color || '#DC2626'),
        price_background_color: typeof data.price_background_color === 'string'
          ? data.price_background_color.trim()
          : (editingDepartment.price_background_color || '#FFFFFF'),
        active: editingDepartment.active
      };

      const nextCodeRaw = typeof data.code === 'string' ? data.code : editingDepartment.code;
      const nextCode = nextCodeRaw ? nextCodeRaw.trim().toUpperCase() : '';
      
      if (nextCode) {
        payload.code = nextCode;
      }

      console.log('Enviando payload completo:', payload);

      await departmentService.updateDepartment(editingDepartment.id, payload);
      toast.success('Departamento atualizado com sucesso!');
      setShowEditDepartment(false);
      setEditingDepartment(null);
      loadDepartments();
    } catch (error: any) {
      console.error('Erro ao atualizar departamento:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar departamento');
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (!confirm(`Tem certeza que deseja excluir o departamento "${department.name}"?`)) {
      return;
    }

    try {
      const panels = await departmentService.getDepartmentPanels(department.id);
      for (const p of (panels || [])) {
        try {
          await departmentService.deleteDepartmentPanel(p.id);
        } catch (e) {
          console.error('Erro ao excluir painel do departamento:', e);
        }
      }
      await departmentService.deleteDepartment(department.id);
      toast.success('Departamento excluído com sucesso!');
      
      // Se o departamento excluído era o selecionado, selecionar outro
      if (selectedDepartment?.id === department.id) {
        const remaining = departments.filter(d => d.id !== department.id);
        setSelectedDepartment(remaining.length > 0 ? remaining[0] : null);
      }
      
      loadDepartments();
    } catch (error: any) {
      console.error('Erro ao excluir departamento:', error);
      toast.error(error.response?.data?.error || 'Erro ao excluir departamento');
    }
  };

  const handleCreatePanel = async (data: any) => {
    if (!selectedDepartment) return;
    
    try {
      await departmentService.createDepartmentPanel(selectedDepartment.id, data);
      toast.success('Painel criado com sucesso!');
      setShowCreatePanel(false);
      loadDepartmentPanels(selectedDepartment.id);
    } catch (error: any) {
      console.error('Erro ao criar painel:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar painel');
    }
  };

  const handleEditPanel = (panel: DepartmentPanel) => {
    setEditingPanel(panel);
    setShowEditPanel(true);
  };

  const handleUpdatePanel = async (data: any) => {
    if (!editingPanel) return;
    
    try {
      await departmentService.updateDepartmentPanel(editingPanel.id, data);
      toast.success('Painel atualizado com sucesso!');
      setShowEditPanel(false);
      setEditingPanel(null);
      if (selectedDepartment) {
        loadDepartmentPanels(selectedDepartment.id);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar painel:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar painel');
    }
  };

  const handleDeletePanel = async (panel: DepartmentPanel) => {
    if (!confirm(`Tem certeza que deseja excluir o painel "${panel.name}"?`)) {
      return;
    }

    try {
      await departmentService.deleteDepartmentPanel(panel.id);
      toast.success('Painel excluído com sucesso!');
      if (selectedDepartment) {
        loadDepartmentPanels(selectedDepartment.id);
      }
    } catch (error: any) {
      console.error('Erro ao excluir painel:', error);
      toast.error(error.response?.data?.error || 'Erro ao excluir painel');
    }
  };

  const handleManageProducts = (panel: DepartmentPanel) => {
    setManagingPanel(panel);
    setShowManageProducts(true);
  };


  const handleViewPanel = (panel: DepartmentPanel) => {
    if (!selectedDepartment) return;
    
    const url = `/departments/${selectedDepartment.id}/panels/${panel.id}/view`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Departamentos</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie departamentos e seus painéis segmentados</p>
          </div>
          <button
            onClick={() => setShowCreateDepartment(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Departamento
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Departamentos</p>
                <p className="text-2xl font-bold text-gray-900">{departments?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Monitor className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Painéis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments?.reduce((acc, dept) => acc + (dept.panels_count || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Monitor className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Painéis Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departmentPanels?.filter(panel => panel.active).length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departamento Selecionado</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedDepartment ? selectedDepartment.name : 'Nenhum'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Departamentos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Departamentos</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {departments.map((department) => (
                  <div
                    key={department.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedDepartment?.id === department.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                    }`}
                    onClick={() => setSelectedDepartment(department)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: department.color }}
                        ></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{department.name}</h3>
                          <p className="text-sm text-gray-500">{department.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {department.panels_count} painéis
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDepartment(department);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDepartment(department);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painéis do Departamento Selecionado */}
          <div className="lg:col-span-2">
            {selectedDepartment ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedDepartment.color }}
                      ></div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Painéis - {selectedDepartment.name}
                        </h2>
                        <p className="text-sm text-gray-500">{selectedDepartment.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                    
                      <button
                        onClick={() => setShowCreatePanel(true)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Novo Painel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {panelsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : departmentPanels.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum painel encontrado</h3>
                      <p className="text-gray-600 mb-4">
                        Este departamento ainda não possui painéis configurados.
                      </p>
                      <button
                        onClick={() => setShowCreatePanel(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Criar Primeiro Painel
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {departmentPanels.map((panel) => (
                        <div
                          key={panel.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                {panel.name}
                                {panel.is_default && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Padrão
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">{panel.description}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleViewPanel(panel)}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="Visualizar Painel"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleManageProducts(panel)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Gerenciar Produtos"
                              >
                                <Users className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditPanel(panel)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Editar Painel"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePanel(panel)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Excluir Painel"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{panel.products_count} produtos</span>
                            <span>Ordem: {panel.display_order}</span>
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                            <span>Intervalo: {panel.polling_interval}s</span>
                            <span className={`px-2 py-1 rounded ${
                              panel.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {panel.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um departamento</h3>
                <p className="text-gray-600">
                  Escolha um departamento na lista ao lado para visualizar seus painéis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {showCreateDepartment && (
        <CreateDepartmentModal
          onClose={() => setShowCreateDepartment(false)}
          onSubmit={handleCreateDepartment}
        />
      )}

      {showEditDepartment && editingDepartment && (
        <EditDepartmentModal
          department={editingDepartment}
          onClose={() => {
            setShowEditDepartment(false);
            setEditingDepartment(null);
          }}
          onSubmit={handleUpdateDepartment}
        />
      )}

      {showCreatePanel && selectedDepartment && (
        <CreatePanelModal
          department={selectedDepartment}
          onClose={() => setShowCreatePanel(false)}
          onSubmit={handleCreatePanel}
        />
      )}

      {showEditPanel && editingPanel && (
        <EditPanelModal
          panel={editingPanel}
          onClose={() => {
            setShowEditPanel(false);
            setEditingPanel(null);
          }}
          onSubmit={handleUpdatePanel}
        />
      )}

      {showManageProducts && managingPanel && (
        <ManagePanelProductsModal
          panel={managingPanel}
          onClose={() => {
            setShowManageProducts(false);
            setManagingPanel(null);
          }}
          onUpdate={() => {
            if (selectedDepartment) {
              loadDepartmentPanels(selectedDepartment.id);
            }
          }}
        />
      )}
    </ContainerLayout>
  );
};

export default DepartamentosPage;
