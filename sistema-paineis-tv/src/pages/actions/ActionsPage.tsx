import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Upload, Image, Link, Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '../../components/base/Table';
import { Modal } from '../../components/base/Modal';
import { Input } from '../../components/base/Input';
import { Button } from '../../components/base/Button';
import { ContainerLayout } from '../../components/layout/Layout';
import { actionService, Action, CreateActionData, UpdateActionData, ActionImage } from '../../services/actionService';
import { panelService, Panel } from '../../services/panelService';
import { ApiError } from '../../services/api';

export const ActionsPage: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [filteredActions, setFilteredActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [showPanelsModal, setShowPanelsModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  
  // Formulários
  const [createForm, setCreateForm] = useState<CreateActionData>({
    name: '',
    start_date: '',
    end_date: '',
    has_border: false,
    panel_ids: []
  });
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [editForm, setEditForm] = useState<UpdateActionData>({});
  
  // Imagens e Painéis
  const [actionImages, setActionImages] = useState<ActionImage[]>([]);
  
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [actionPanels, setActionPanels] = useState<Panel[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  


  // Carregar dados
  const loadActions = async () => {
    try {
      setLoading(true);
      const data = await actionService.getActions();
      setActions(data || []);
      setFilteredActions(data || []);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
      toast.error('Erro ao carregar ações');
      setActions([]);
      setFilteredActions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPanels = async () => {
    try {
      const data = await panelService.getPanels();
      setPanels(data || []);
    } catch (error) {
      console.error('Erro ao carregar painéis:', error);
      setPanels([]);
    }
  };

  // Filtrar ações
  useEffect(() => {
    if (!searchTerm) {
      setFilteredActions(actions || []);
    } else {
      const filtered = (actions || []).filter(action =>
        action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActions(filtered);
    }
  }, [searchTerm, actions]);

  // Carregar imagens da ação
  const loadActionImages = async (actionId: string) => {
    try {
      const images = await actionService.getActionImages(actionId);
      setActionImages(images || []);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast.error('Erro ao carregar imagens da ação');
      setActionImages([]);
    }
  };
  

  // Carregar painéis associados
  const loadActionPanels = async (actionId: string) => {
    try {
      const panelIds = await actionService.getActionPanels(actionId);
      const associatedPanels = (panels || []).filter(panel => (panelIds || []).includes(panel.id));
      setActionPanels(associatedPanels);
    } catch (error) {
      console.error('Erro ao carregar painéis:', error);
      toast.error('Erro ao carregar painéis da ação');
      setActionPanels([]);
    }
  };

  // Criar ação
  const handleCreate = async () => {
    // Validações básicas
    if (!createForm.name.trim()) {
      toast.error('Nome da ação é obrigatório');
      return;
    }
    
    if (!createForm.start_date) {
      toast.error('Data de início é obrigatória');
      return;
    }
    
    if (!createForm.end_date) {
      toast.error('Data de fim é obrigatória');
      return;
    }
    
    if (selectedPanels.length === 0) {
      toast.error('Selecione pelo menos um painel');
      return;
    }
    
    if (createImages.length === 0) {
      toast.error('Adicione pelo menos uma imagem');
      return;
    }

    try {
      // Função para garantir que as datas tenham segundos
      const ensureSecondsInDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return dateTimeString;
        // Se a string não tem segundos (formato: YYYY-MM-DDTHH:mm), adicionar :00
        if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          return dateTimeString + ':00';
        }
        return dateTimeString;
      };

      console.log('=== DEBUG CRIAÇÃO DE AÇÃO ===');
      console.log('Dados para criação:', {
        ...createForm,
        panel_ids: selectedPanels,
        images_count: createImages.length
      });

      // Criar ação com painéis selecionados e datas corrigidas
      const actionData = {
        ...createForm,
        start_date: ensureSecondsInDateTime(createForm.start_date),
        end_date: ensureSecondsInDateTime(createForm.end_date),
        panel_ids: selectedPanels
      };
      
      console.log('Dados corrigidos para envio:', actionData);
      console.log('URL da API:', '/actions');
      console.log('Método:', 'POST');
      
      console.log('Iniciando chamada para actionService.createAction...');
      const newAction = await actionService.createAction(actionData);
      console.log('Resposta recebida do actionService.createAction:', newAction);
      console.log('Tipo da resposta:', typeof newAction);
      console.log('newAction é null?', newAction === null);
      console.log('newAction é undefined?', newAction === undefined);
      
      // Verificar se a ação foi criada com sucesso
      if (!newAction) {
        console.error('ERRO: Resposta vazia do servidor');
        throw new Error('Falha ao criar ação - resposta vazia do servidor');
      }

      if (!newAction.id) {
        console.error('ERRO: ID não retornado pelo servidor');
        console.log('Conteúdo da resposta:', JSON.stringify(newAction, null, 2));
        throw new Error('Falha ao criar ação - ID não retornado pelo servidor');
      }

      console.log('Ação criada com sucesso! ID:', newAction.id);
      
      // Upload das imagens se houver
      if (createImages.length > 0) {
        const invalids = createImages
          .map(img => ({ img, errs: actionService.validateImageFile(img) }))
          .filter(x => x.errs.length > 0);
        if (invalids.length > 0) {
          invalids.forEach(x => x.errs.forEach(e => toast.error(e)));
        } else {
          await actionService.uploadActionImages(newAction.id, createImages);
        }
      }
      
      toast.success('Ação criada com sucesso!');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        start_date: '',
        end_date: '',
        has_border: false,
        panel_ids: []
      });
      setSelectedPanels([]);
      setCreateImages([]);
      await loadActions();
    } catch (error: any) {
      console.error('Erro ao criar ação:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar ação');
    }
  };

  // Editar ação
  const handleEdit = async () => {
    if (!selectedAction) return;

    const errors = actionService.validateActionData(editForm);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      await actionService.updateAction(selectedAction.id, editForm);
      toast.success('Ação atualizada com sucesso!');
      setShowEditModal(false);
      setSelectedAction(null);
      setEditForm({});
      loadActions();
    } catch (error: any) {
      console.error('Erro ao atualizar ação:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar ação');
    }
  };

  // Deletar ação
  const handleDelete = async (action: Action) => {
    if (!confirm(`Tem certeza que deseja deletar a ação "${action.name}"?`)) {
      return;
    }

    try {
      await actionService.deleteAction(action.id);
      toast.success('Ação deletada com sucesso!');
      loadActions();
    } catch (error: any) {
      console.error('Erro ao deletar ação:', error);
      toast.error(error.response?.data?.error || 'Erro ao deletar ação');
    }
  };

  // Upload de imagem
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAction || !event.target.files?.length) return;

    const files = Array.from(event.target.files);
    const invalids = files
      .map(f => ({ f, errs: actionService.validateImageFile(f) }))
      .filter(x => x.errs.length > 0);
    if (invalids.length > 0) {
      invalids.forEach(x => x.errs.forEach(e => toast.error(e)));
      return;
    }

    try {
      setUploadingImage(true);
      await actionService.uploadActionImages(selectedAction.id, files);
      toast.success('Imagem enviada com sucesso!');
      loadActionImages(selectedAction.id);
    } catch (error: any) {
      console.error('Erro ao enviar imagem:', error);
      const message = error instanceof ApiError ? error.message : (error?.message || 'Erro ao enviar imagem');
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Deletar imagem
  const handleDeleteImage = async (imageId: string) => {
    if (!selectedAction || !confirm('Tem certeza que deseja deletar esta imagem?')) {
      return;
    }

    try {
      await actionService.deleteActionImage(selectedAction.id, imageId);
      toast.success('Imagem deletada com sucesso!');
      loadActionImages(selectedAction.id);
    } catch (error: any) {
      console.error('Erro ao deletar imagem:', error);
      toast.error(error.response?.data?.error || 'Erro ao deletar imagem');
    }
  };

  // Associar/Desassociar painel
  const handleTogglePanelAssociation = async (panelId: string) => {
    if (!selectedAction) return;

    const isAssociated = (actionPanels || []).some(panel => panel.id === panelId);

    try {
      if (isAssociated) {
        await actionService.removeActionFromPanel(selectedAction.id, panelId);
        toast.success('Ação removida do painel!');
      } else {
        await actionService.addActionToPanel(selectedAction.id, panelId);
        toast.success('Ação adicionada ao painel!');
      }
      loadActionPanels(selectedAction.id);
    } catch (error: any) {
      console.error('Erro ao alterar associação:', error);
      toast.error(error.response?.data?.error || 'Erro ao alterar associação');
    }
  };

  // Abrir modais
  const openEditModal = (action: Action) => {
    setSelectedAction(action);
    setEditForm({
      name: action.name,
      start_date: action.start_date,
      end_date: action.end_date,
      has_border: action.has_border
    });
    setShowEditModal(true);
  };

  const openImagesModal = (action: Action) => {
    setSelectedAction(action);
    setShowImagesModal(true);
    loadActionImages(action.id);
  };

  const openPanelsModal = (action: Action) => {
    setSelectedAction(action);
    setShowPanelsModal(true);
    loadActionPanels(action.id);
  };

  useEffect(() => {
    loadActions();
    loadPanels();
  }, []);

  

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (action: Action) => (
        <div>
          <div className="font-medium text-gray-900">{action.name}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {action.description}
          </div>
        </div>
      )
    },
    {
      key: 'period',
      label: 'Período',
      render: (action: Action) => (
        <div className="text-sm">
          <div>Início: {actionService.formatDateForDisplay(action.start_date)}</div>
          <div>Fim: {actionService.formatDateForDisplay(action.end_date)}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (action: Action) => {
        const status = actionService.getActionStatus(action);
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          expired: 'bg-red-100 text-red-800',
          scheduled: 'bg-blue-100 text-blue-800'
        };
        const statusLabels = {
          active: 'Ativa',
          inactive: 'Inativa',
          expired: 'Expirada',
          scheduled: 'Agendada'
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (action: Action) => actionService.formatDateForDisplay(action.created_at)
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (action: Action) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openPanelsModal(action)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openImagesModal(action)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(action)}
            className="text-yellow-600 hover:text-yellow-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(action)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const activeActions = (actions || []).filter(action => actionService.getActionStatus(action) === 'active');
  const inactiveActions = (actions || []).filter(action => !action.is_active);
  const expiredActions = (actions || []).filter(action => actionService.getActionStatus(action) === 'expired');

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Ações</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie as ações e suas associações com painéis</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ação
          </Button>
        </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Ações</p>
              <p className="text-2xl font-bold text-gray-900">{(actions || []).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ações Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{(activeActions || []).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Unlink className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inativas</p>
              <p className="text-2xl font-bold text-gray-900">{(inactiveActions || []).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiradas</p>
              <p className="text-2xl font-bold text-gray-900">{(expiredActions || []).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar ações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow">
        <Table
          data={filteredActions || []}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhuma ação encontrada"
        />
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Nova Ação"
      >
        <div className="space-y-4">
          <Input
            label="Nome da Ação"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Digite o nome da ação"
          />
          
          {/* Seleção de Painéis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Painéis * (selecione um ou mais)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="select-all-panels"
                  checked={selectedPanels.length === panels.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPanels(panels.map(p => p.id));
                    } else {
                      setSelectedPanels([]);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="select-all-panels" className="ml-2 text-sm font-medium text-gray-900">
                  Marcar todos
                </label>
              </div>
              {panels.map(panel => (
                <div key={panel.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`panel-${panel.id}`}
                    checked={selectedPanels.includes(panel.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPanels([...selectedPanels, panel.id]);
                      } else {
                        setSelectedPanels(selectedPanels.filter(id => id !== panel.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`panel-${panel.id}`} className="ml-2 text-sm text-gray-900">
                    {panel.name} ({panel.layout_type})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de Início"
              type="datetime-local"
              value={createForm.start_date}
              onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
            />
            <Input
              label="Data de Fim"
              type="datetime-local"
              value={createForm.end_date}
              onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
            />
          </div>

          {/* Opção de bordas */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="has_border"
              checked={createForm.has_border}
              onChange={(e) => setCreateForm({ ...createForm, has_border: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <div>
              <label htmlFor="has_border" className="text-sm font-medium text-gray-900">
                Usar bordas nas imagens (layout 2x2)
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Com bordas: imagem encaixada em container com borda. Sem bordas: imagem otimizada para máximo espaço.
              </p>
            </div>
          </div>

          {/* Upload de Imagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem/Vídeo * ({createImages.length})
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="create-image-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Clique para enviar imagem/vídeo
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG, JPEG, WEBP, GIF, MP4, WebM ou Ogg até 150MB
                    </span>
                  </label>
                  <input
                    id="create-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,video/mp4,video/webm,video/ogg"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setCreateImages([...createImages, ...newFiles]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Lista de arquivos selecionados */}
            {createImages.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-900">
                  Arquivos selecionados ({createImages.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {createImages.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCreateImages(createImages.filter((_, i) => i !== index));
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setSelectedPanels([]);
                setCreateImages([]);
                setCreateForm({
                  name: '',
                  start_date: '',
                  end_date: '',
                  has_border: false,
                  panel_ids: []
                });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Criar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Ação"
      >
        <div className="space-y-4">
          <Input
            label="Nome da Ação"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Digite o nome da ação"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Digite a descrição da ação"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de Início"
              type="date"
              value={editForm.start_date || ''}
              onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
            />
            <Input
              label="Data de Fim"
              type="date"
              value={editForm.end_date || ''}
              onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit_is_active"
              checked={editForm.is_active ?? true}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="edit_is_active" className="ml-2 block text-sm text-gray-900">
              Ação ativa
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEdit}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Imagens */}
      <Modal
        isOpen={showImagesModal}
        onClose={() => setShowImagesModal(false)}
        title={`Imagens da Ação: ${selectedAction?.name}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Clique para enviar imagem/vídeo
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    PNG, JPG, JPEG, WEBP, GIF, MP4, WebM ou Ogg até 150MB
                  </span>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,video/mp4,video/webm,video/ogg"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
              {uploadingImage && (
                <div className="mt-4">
                  <div className="text-sm text-blue-600">Enviando...</div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Imagens */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Imagens ({(actionImages || []).length})
            </h3>
            
            {(actionImages || []).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma imagem encontrada
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(actionImages || []).map(image => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`${image.url}`}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                        className="text-white hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-600 truncate">
                      {image.filename}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </Modal>

      {/* Modal de Painéis */}
      <Modal
        isOpen={showPanelsModal}
        onClose={() => setShowPanelsModal(false)}
        title={`Painéis Associados: ${selectedAction?.name}`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            Selecione os painéis onde esta ação deve ser exibida
          </div>

          <div className="space-y-3">
            {(panels || []).map(panel => {
              const isAssociated = (actionPanels || []).some(ap => ap.id === panel.id);
              return (
                <div
                  key={panel.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900">{panel.name}</div>
                    <div className="text-sm text-gray-500">URL: {panel.fixed_url}</div>
                  </div>
                  <Button
                    variant={isAssociated ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleTogglePanelAssociation(panel.id)}
                    className={isAssociated ? "text-red-600 border-red-300 hover:bg-red-50" : ""}
                  >
                    {isAssociated ? (
                      <>
                        <Unlink className="h-4 w-4 mr-2" />
                        Remover
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Associar
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {panels.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Nenhum painel disponível
            </p>
          )}
        </div>
      </Modal>
      </div>
    </ContainerLayout>
  );
};
