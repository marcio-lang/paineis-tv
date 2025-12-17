import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Upload, Image, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '../../components/base/Table';
import { Modal } from '../../components/base/Modal';
import { Input } from '../../components/base/Input';
import { Button } from '../../components/base/Button';
import { ContainerLayout } from '../../components/layout/Layout';
import { panelService, Panel, CreatePanelData, UpdatePanelData, MediaFile } from '../../services/panelService';

export const PanelsPage: React.FC = () => {
  console.log('🔥 PanelsPage: Componente renderizado - VERSÃO ATUALIZADA');
  
  const [panels, setPanels] = useState<Panel[]>([]);
  const [filteredPanels, setFilteredPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  console.log('🔧 PanelsPage: Estados inicializados');
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  
  // Formulários
  const [createForm, setCreateForm] = useState<CreatePanelData>({
    name: '',
    layout_type: 'layout_1'
  });
  const [editForm, setEditForm] = useState<UpdatePanelData>({});
  
  // Mídia
  const [panelMedia, setPanelMedia] = useState<MediaFile[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  console.log('🔧 PanelsPage: Todos os estados inicializados');

  // Carregar painéis
  const loadPanels = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 PanelsPage: Iniciando carregamento dos painéis...');
      const data = await panelService.getPanels();
      console.log('📊 PanelsPage: Dados recebidos:', data);
      console.log('🔍 PanelsPage: Tipo dos dados:', typeof data);
      console.log('📋 PanelsPage: É array?', Array.isArray(data));
      if (data && data.length > 0) {
        console.log('🎯 PanelsPage: Primeiro painel:', data[0]);
      }
      setPanels(data);
      setFilteredPanels(data);
    } catch (error) {
      console.error('❌ Erro ao carregar painéis:', error);
      toast.error('Erro ao carregar painéis');
    } finally {
      setLoading(false);
    }
  }, []);

  console.log('🔧 PanelsPage: Função loadPanels definida');

  // useEffect para carregar painéis - MOVIDO PARA CIMA
  console.log('🔧 PanelsPage: Definindo useEffect...');
  useEffect(() => {
    console.log('🔥 useEffect: EXECUTANDO! - VERSÃO ATUALIZADA');
    console.log('🔥 useEffect: Chamando loadPanels...');
    loadPanels();
    console.log('🔥 useEffect: loadPanels chamado!');
  }, [loadPanels]);
  console.log('🔧 PanelsPage: useEffect definido com sucesso');

  // Filtrar painéis
  useEffect(() => {
    console.log('Filtrando painéis. Termo de busca:', searchTerm);
    console.log('Painéis antes do filtro:', panels?.length || 0);
    
    if (!searchTerm) {
      setFilteredPanels(panels || []);
    } else {
      const filtered = (panels || []).filter(panel =>
        panel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.fixed_url.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPanels(filtered);
    }
    
    console.log('Painéis após filtro:', filteredPanels?.length || 0);
  }, [panels, searchTerm]);

  // Carregar mídia do painel
  const loadPanelMedia = async (panelId: string) => {
    try {
      const media = await panelService.getPanelMedia(panelId);
      setPanelMedia(media);
    } catch (error) {
      console.error('Erro ao carregar mídia:', error);
      toast.error('Erro ao carregar mídia do painel');
    }
  };

  // Criar painel
  const handleCreate = async () => {
    console.log('Tentando criar painel:', createForm);
    const errors = panelService.validatePanelData(createForm);
    if (errors.length > 0) {
      console.log('Erros de validação:', errors);
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      console.log('Criando painel com dados:', createForm);
      await panelService.createPanel(createForm);
      toast.success('Painel criado com sucesso!');
      setShowCreateModal(false);
      setCreateForm({ name: '', layout_type: 'layout_1' });
      loadPanels();
    } catch (error: any) {
      console.error('Erro ao criar painel:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar painel');
    }
  };

  // Editar painel
  const handleEdit = async () => {
    if (!selectedPanel) return;
    
    console.log('Tentando editar painel:', selectedPanel);
    console.log('Dados de edição:', editForm);

    const errors = panelService.validatePanelData(editForm);
    if (errors.length > 0) {
      console.log('Erros de validação na edição:', errors);
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      await panelService.updatePanel(selectedPanel.id, editForm);
      toast.success('Painel atualizado com sucesso!');
      setShowEditModal(false);
      setSelectedPanel(null);
      setEditForm({});
      loadPanels();
    } catch (error: any) {
      console.error('Erro ao atualizar painel:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar painel');
    }
  };

  // Deletar painel
  const handleDelete = async (panel: Panel) => {
    console.log('Tentando deletar painel:', panel);
    if (!confirm(`Tem certeza que deseja deletar o painel "${panel.name}"?`)) {
      console.log('Deleção cancelada pelo usuário');
      return;
    }

    try {
      console.log('Deletando painel com ID:', panel.id);
      await panelService.deletePanel(panel.id);
      toast.success('Painel deletado com sucesso!');
      loadPanels();
    } catch (error: any) {
      console.error('Erro ao deletar painel:', error);
      toast.error(error.response?.data?.error || 'Erro ao deletar painel');
    }
  };

  // Upload de mídia
  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPanel || !event.target.files?.[0]) return;

    const file = event.target.files[0];
    const errors = panelService.validateMediaFile(file);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setUploadingMedia(true);
      await panelService.uploadPanelMedia(selectedPanel.id, file);
      toast.success('Mídia enviada com sucesso!');
      loadPanelMedia(selectedPanel.id);
    } catch (error: any) {
      console.error('Erro ao enviar mídia:', error);
      toast.error(error.response?.data?.error || 'Erro ao enviar mídia');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Deletar mídia
  const handleDeleteMedia = async (mediaId: string) => {
    if (!selectedPanel || !confirm('Tem certeza que deseja deletar esta mídia?')) {
      return;
    }

    try {
      await panelService.deletePanelMedia(selectedPanel.id, mediaId);
      toast.success('Mídia deletada com sucesso!');
      loadPanelMedia(selectedPanel.id);
    } catch (error: any) {
      console.error('Erro ao deletar mídia:', error);
      toast.error(error.response?.data?.error || 'Erro ao deletar mídia');
    }
  };

  // Abrir modal de edição
  const openEditModal = (panel: Panel) => {
    // Verificação de segurança para evitar TypeError
    if (!panel) {
      console.error('Erro: Painel não definido ao tentar abrir modal de edição');
      toast.error('Erro: Dados do painel não encontrados');
      return;
    }

    // Verificação adicional das propriedades necessárias
    if (!panel.name || !panel.layout_type) {
      console.error('Erro: Propriedades do painel incompletas:', panel);
      toast.error('Erro: Dados do painel incompletos');
      return;
    }

    console.log('Abrindo modal de edição para painel:', panel);
    setSelectedPanel(panel);
    setEditForm({
      name: panel.name,
      layout_type: panel.layout_type
    });
    setShowEditModal(true);
  };

  // Abrir modal de mídia
  const openMediaModal = (panel: Panel) => {
    setSelectedPanel(panel);
    setShowMediaModal(true);
    loadPanelMedia(panel.id);
  };

  // Visualizar painel
  const viewPanel = (panel: Panel) => {
    console.log('Visualizando painel:', panel);
    const url = `/p/${panel.fixed_url}`;
    console.log('URL do player:', url);
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadPanels();
  }, []);

  const columns = [
    {
      key: 'name',
      title: 'Nome',
      render: (panel: Panel) => (
        <div>
          <div className="font-medium text-gray-900">{panel.name}</div>
          <div className="text-sm text-gray-500">URL: {panel.fixed_url}</div>
        </div>
      )
    },
    {
      key: 'layout_type',
      title: 'Layout',
      render: (panel: Panel) => {
        const layoutLabels = {
          layout_1: '1 Imagem',
          layout_2: '2 Imagens',
          layout_3: '3 Imagens',
          layout_4: '4 Imagens'
        };
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {layoutLabels[panel.layout_type]}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      title: 'Criado em',
      render: (panel: Panel) => {
        if (!panel.created_at) {
          return 'Data não disponível';
        }
        
        const date = new Date(panel.created_at);
        
        if (isNaN(date.getTime())) {
          return 'Data inválida';
        }
        
        return date.toLocaleDateString('pt-BR');
      }
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (panel: Panel) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewPanel(panel)}
            className="text-green-600 hover:text-green-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openMediaModal(panel)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(panel)}
            className="text-yellow-600 hover:text-yellow-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(panel)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const layoutOptions = [
    { value: 'layout_1', label: 'Layout 1 - Imagem/Video' },
    { value: 'layout_2', label: 'Layout 2 - Lista Vertical' },
    { value: 'layout_3', label: 'Layout 3 - Carrossel' }
  ];

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Painéis</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie os painéis de TV do sistema</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Painel
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
              <p className="text-sm font-medium text-gray-600">Total de Painéis</p>
              <p className="text-2xl font-bold text-gray-900">{panels?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Image className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">1 Imagem</p>
              <p className="text-2xl font-bold text-gray-900">
                {(panels || []).filter(p => p.layout_type === 'layout_1').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Video className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">2 Imagens</p>
              <p className="text-2xl font-bold text-gray-900">
                {(panels || []).filter(p => p.layout_type === 'layout_2').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outros Layouts</p>
              <p className="text-2xl font-bold text-gray-900">
                {(panels || []).filter(p => !['layout_1', 'layout_2'].includes(p.layout_type)).length}
              </p>
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
            placeholder="Buscar painéis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow">
        <Table
          data={filteredPanels}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum painel encontrado"
        />
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Novo Painel"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Painel"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Digite o nome do painel"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Layout
            </label>
            <select
              value={createForm.layout_type}
              onChange={(e) => setCreateForm({ ...createForm, layout_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {layoutOptions && layoutOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Criar Painel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Painel"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Painel"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Digite o nome do painel"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Layout
            </label>
            <select
              value={editForm.layout_type || 'layout_1'}
              onChange={(e) => setEditForm({ ...editForm, layout_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {layoutOptions && layoutOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

      {/* Modal de Mídia */}
      <Modal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        title={`Mídia do Painel: ${selectedPanel?.name}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="media-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Clique para enviar mídia
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    PNG, JPG, JPEG ou MP4 até 100MB
                  </span>
                </label>
                <input
                  id="media-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,video/mp4"
                  onChange={handleMediaUpload}
                  disabled={uploadingMedia}
                />
              </div>
              {uploadingMedia && (
                <div className="mt-4">
                  <div className="text-sm text-blue-600">Enviando...</div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Mídia */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Arquivos de Mídia ({panelMedia?.length || 0})
            </h3>
            
            {(panelMedia?.length || 0) === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma mídia encontrada
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {panelMedia.map(media => (
                  <div key={media.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {media.file_type === 'image' ? (
                        <img
                          src={panelService.getMediaUrl(media.filename)}
                          alt={media.original_filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMedia(media.id)}
                        className="text-white hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-600 truncate">
                      {media.original_filename}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
      </div>
    </ContainerLayout>
  );
};
