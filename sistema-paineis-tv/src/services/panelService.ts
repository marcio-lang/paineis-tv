import { api } from './api';

// Interfaces para painéis gerais (não departamentos)
export interface Panel {
  id: string;
  name: string;
  layout_type: string;
  fixed_url: string;
  created_at: string;
  updated_at: string;
  actions_count?: number;
  media_count?: number;
}

export interface CreatePanelData {
  name: string;
  layout_type: string;
}

export interface UpdatePanelData {
  name?: string;
  layout_type?: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

// Interfaces para departamentos (mantidas para compatibilidade)
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentPanel {
  id: string;
  name: string;
  description: string;
  department_id: string;
  title: string;
  subtitle: string;
  footer_text: string;
  polling_interval: number;
  is_default: boolean;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PanelProduct {
  id: string;
  codigo: string;
  nome: string;
  preco: number;
  posicao: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PanelConfig {
  polling_interval: number;
  title: string;
  subtitle: string;
  footer_text: string;
}

export interface PanelViewData {
  panel: DepartmentPanel;
  department: Department;
  products: PanelProduct[];
  config: PanelConfig;
}

class PanelService {
  // === MÉTODOS PARA PAINÉIS GERAIS ===
  
  // Obter todos os painéis
  async getPanels(): Promise<Panel[]> {
    console.log('🔄 panelService.getPanels: Iniciando requisição...');
    try {
      const response = await api.get('/panels');
      console.log('📦 panelService.getPanels: Resposta recebida:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('❌ panelService.getPanels: Erro na requisição:', error);
      throw error;
    }
  }

  // Criar novo painel
  async createPanel(data: CreatePanelData): Promise<Panel> {
    console.log('🔄 panelService.createPanel: Iniciando requisição...', data);
    try {
      const response = await api.post('/panels', data);
      console.log('📦 panelService.createPanel: Resposta recebida:', response);
      return response;
    } catch (error) {
      console.error('❌ panelService.createPanel: Erro na requisição:', error);
      throw error;
    }
  }

  // Atualizar painel
  async updatePanel(id: string, data: UpdatePanelData): Promise<Panel> {
    console.log(`🔄 panelService.updatePanel: Iniciando requisição para painel ${id}...`, data);
    try {
      const response = await api.put(`/panels/${id}`, data);
      console.log('📦 panelService.updatePanel: Resposta recebida:', response);
      return response;
    } catch (error) {
      console.error('❌ panelService.updatePanel: Erro na requisição:', error);
      throw error;
    }
  }

  // Deletar painel
  async deletePanel(id: string): Promise<void> {
    console.log(`🔄 panelService.deletePanel: Iniciando requisição para painel ${id}...`);
    try {
      await api.delete(`/panels/${id}`);
      console.log('✅ panelService.deletePanel: Painel deletado com sucesso');
    } catch (error) {
      console.error('❌ panelService.deletePanel: Erro na requisição:', error);
      throw error;
    }
  }

  // Obter mídia do painel
  async getPanelMedia(panelId: string): Promise<MediaFile[]> {
    console.log(`🔄 panelService.getPanelMedia: Iniciando requisição para painel ${panelId}...`);
    try {
      const response = await api.get(`/panels/${panelId}/media`);
      console.log('📦 panelService.getPanelMedia: Resposta recebida:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('❌ panelService.getPanelMedia: Erro na requisição:', error);
      throw error;
    }
  }

  // Upload de mídia para painel
  async uploadPanelMedia(panelId: string, file: File): Promise<MediaFile> {
    console.log(`🔄 panelService.uploadPanelMedia: Iniciando upload para painel ${panelId}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.upload(`/panels/${panelId}/media`, formData);
      console.log('📦 panelService.uploadPanelMedia: Resposta recebida:', response);
      return response;
    } catch (error) {
      console.error('❌ panelService.uploadPanelMedia: Erro na requisição:', error);
      throw error;
    }
  }

  // Deletar mídia do painel
  async deletePanelMedia(mediaId: string): Promise<void> {
    console.log(`🔄 panelService.deletePanelMedia: Iniciando requisição para mídia ${mediaId}...`);
    try {
      await api.delete(`/media/${mediaId}`);
      console.log('✅ panelService.deletePanelMedia: Mídia deletada com sucesso');
    } catch (error) {
      console.error('❌ panelService.deletePanelMedia: Erro na requisição:', error);
      throw error;
    }
  }

  // Obter URL da mídia
  getMediaUrl(filename: string): string {
    if (!filename) return '';
    const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim() || '/api';
    return `${API_BASE_URL}/media/${filename}`;
  }

  // === MÉTODOS PARA DEPARTAMENTOS (mantidos para compatibilidade) ===
  
  // Obter todos os departamentos
  async getDepartments(): Promise<Department[]> {
    console.log('🔄 panelService.getDepartments: Iniciando requisição...');
    try {
      const response = await api.get('/departments');
      console.log('📦 panelService.getDepartments: Resposta recebida:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('❌ panelService.getDepartments: Erro na requisição:', error);
      throw error;
    }
  }

  // Obter painéis de um departamento
  async getDepartmentPanels(departmentId: string): Promise<DepartmentPanel[]> {
    console.log(`🔄 panelService.getDepartmentPanels: Iniciando requisição para departamento ${departmentId}...`);
    try {
      const response = await api.get(`/departments/${departmentId}/panels`);
      console.log('📦 panelService.getDepartmentPanels: Resposta recebida:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('❌ panelService.getDepartmentPanels: Erro na requisição:', error);
      throw error;
    }
  }

  // Visualizar painel específico (para TV)
  async viewPanel(departmentId: string, panelId: string): Promise<PanelViewData> {
    console.log(`🔄 panelService.viewPanel: Iniciando requisição para painel ${panelId} do departamento ${departmentId}...`);
    try {
      const response = await api.get(`/departments/${departmentId}/panels/${panelId}/view`);
      console.log('📦 panelService.viewPanel: Resposta recebida:', response);
      return response;
    } catch (error) {
      console.error('❌ panelService.viewPanel: Erro na requisição:', error);
      throw error;
    }
  }

  // === UTILITÁRIOS ===
  
  // Removido utilitário de background; mídia permanece para painéis gerais

  // Formatação de preço
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }

  // Organizar produtos por posição
  organizeByPosition(products: PanelProduct[]): PanelProduct[] {
    return products
      .filter(product => product.ativo)
      .sort((a, b) => a.posicao - b.posicao);
  }

  validateMediaFile(file: File): string[] {
    const errors: string[] = [];
    if (!file) {
      errors.push('Arquivo é obrigatório');
      return errors;
    }
    const maxBytes = 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      errors.push('Arquivo maior que 100MB');
    }
    const type = file.type || '';
    const isImage = type.startsWith('image/');
    const isMp4 = type === 'video/mp4';
    if (!isImage && !isMp4) {
      errors.push('Tipo de arquivo inválido. Use imagem ou MP4');
    }
    return errors;
  }

  // Criar grid posicional 6x4 (24 posições)
  createPositionalGrid(products: PanelProduct[]): (PanelProduct | null)[] {
    const grid: (PanelProduct | null)[] = new Array(24).fill(null);
    
    // Colocar cada produto na sua posição específica (posição 1-24 -> índice 0-23)
    // Posições acima de 24 são permitidas no banco mas não aparecem no grid fixo da TV
    products.forEach(product => {
      if (product.posicao >= 1 && product.posicao <= 24) {
        grid[product.posicao - 1] = product;
      } else if (!product.posicao || product.posicao > 24) {
        // Se não tem posição definida ou está acima de 24, colocar na primeira posição livre do grid 1-24
        const freeIndex = grid.findIndex(slot => slot === null);
        if (freeIndex !== -1) {
          grid[freeIndex] = product;
        }
      }
    });
    
    return grid;
  }

  // Obter estatísticas do painel
  getPanelStats(products: PanelProduct[]) {
    const safeProducts = products || [];
    const active = safeProducts.filter(p => p.ativo);
    const inactive = safeProducts.filter(p => !p.ativo);
    const totalValue = active.reduce((sum, p) => sum + p.preco, 0);
    const averagePrice = active.length > 0 ? totalValue / active.length : 0;

    return {
      total: safeProducts.length,
      active: active.length,
      inactive: inactive.length,
      totalValue,
      averagePrice,
      occupiedPositions: active.length,
      availablePositions: 100 - active.length, // Limite flexível de 100
    };
  }

  // Validar dados do painel
  validatePanelData(input: string | CreatePanelData | UpdatePanelData, panelId?: string): string[] {
    const errors: string[] = [];
    if (typeof input === 'string') {
      const departmentId = String(input || '');
      if (departmentId.trim().length === 0) {
        errors.push('ID do departamento é obrigatório');
      }
      const p = String(panelId || '');
      if (p.trim().length === 0) {
        errors.push('ID do painel é obrigatório');
      }
      return errors;
    }
    const data = input as CreatePanelData | UpdatePanelData;
    const name = String((data as any).name ?? '');
    const layout = String((data as any).layout_type ?? '');
    if (name.trim().length === 0) {
      errors.push('Nome do painel é obrigatório');
    }
    const allowed = ['layout_1', 'layout_2', 'layout_3', 'layout_4'];
    if (!allowed.includes(layout)) {
      errors.push('Layout inválido');
    }
    return errors;
  }
}

export const panelService = new PanelService();
