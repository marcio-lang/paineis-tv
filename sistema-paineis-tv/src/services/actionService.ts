import { api } from './api';
import { Panel, Action, ActionImage } from './panelService';

export interface CreateActionData {
  name: string;
  start_date: string;
  end_date: string;
  has_border?: boolean;
  panel_ids?: string[];
}

export interface UpdateActionData {
  name?: string;
  start_date?: string;
  end_date?: string;
  has_border?: boolean;
}

class ActionService {
  // CRUD de Ações
  async getActions(): Promise<Action[]> {
    const response = await api.get('/actions');
    return response;
  }

  async getAction(id: string): Promise<Action> {
    const response = await api.get(`/actions/${id}`);
    return response;
  }

  async createAction(data: CreateActionData): Promise<Action> {
    console.log('=== DEBUG actionService.createAction ===');
    console.log('Dados recebidos no service:', data);
    console.log('URL completa:', '/actions');
    
    try {
      console.log('Fazendo requisição POST para /actions...');
      const response = await api.post('/actions', data);
      console.log('Resposta HTTP recebida:', response);
      console.log('Tipo da resposta:', typeof response);
      console.log('response é null?', response === null);
      console.log('response é undefined?', response === undefined);
      console.log('Conteúdo de response:', JSON.stringify(response, null, 2));
      
      // O api.post já retorna os dados diretamente, não response.data
      return response;
    } catch (error: any) {
      console.error('=== ERRO na requisição ===');
      console.error('Erro completo:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('error.response:', error.response);
      console.error('error.message:', error.message);
      console.error('error.code:', error.code);
      
      if (error.response) {
        console.error('Status da resposta de erro:', error.response.status);
        console.error('Dados da resposta de erro:', error.response.data);
        console.error('Headers da resposta de erro:', error.response.headers);
      }
      
      throw error;
    }
  }

  async updateAction(id: string, data: UpdateActionData): Promise<Action> {
    const response = await api.put(`/actions/${id}`, data);
    return response;
  }

  async deleteAction(id: string): Promise<void> {
    await api.delete(`/actions/${id}`);
  }

  // Gerenciamento de Painéis da Ação
  async getActionPanels(actionId: string): Promise<Panel[]> {
    const response = await api.get(`/actions/${actionId}/panels`);
    return response;
  }

  async addPanelToAction(actionId: string, panelId: string): Promise<void> {
    await api.post(`/actions/${actionId}/panels`, { panel_id: panelId });
  }

  async removePanelFromAction(actionId: string, panelId: string): Promise<void> {
    await api.delete(`/actions/${actionId}/panels/${panelId}`);
  }

  // Gerenciamento de Imagens da Ação
  async uploadActionImage(actionId: string, file: File): Promise<ActionImage> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.upload(`/actions/${actionId}/images`, formData);
    return response;
  }

  async deleteActionImage(actionId: string, imageId: string): Promise<void> {
    await api.delete(`/actions/${actionId}/images/${imageId}`);
  }

  async getActionImages(actionId: string): Promise<ActionImage[]> {
    const action = await this.getAction(actionId);
    return action.images || [];
  }

  // Utilitários
  getImageUrl(filename: string): string {
    return `${api.defaults.baseURL}/media/${filename}`;
  }

  // Validações
  validateActionData(data: CreateActionData | UpdateActionData): string[] {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length < 3)) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if ('start_date' in data && 'end_date' in data) {
      const startDate = new Date(data.start_date!);
      const endDate = new Date(data.end_date!);

      if (startDate >= endDate) {
        errors.push('Data de início deve ser anterior à data de fim');
      }

      if (startDate < new Date()) {
        errors.push('Data de início não pode ser no passado');
      }
    }

    return errors;
  }

  validateImageFile(file: File): string[] {
    const errors: string[] = [];
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'];
    const maxSize = 100 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      errors.push('Tipo de arquivo não permitido. Use PNG, JPG ou JPEG');
    }

    if (file.size > maxSize) {
      errors.push('Arquivo muito grande. Máximo 10MB');
    }

    return errors;
  }

  // Formatação de datas
  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  }

  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Verificar se ação está ativa
  isActionActive(action: Action): boolean {
    const now = new Date();
    const startDate = new Date(action.start_date);
    const endDate = new Date(action.end_date);
    
    return now >= startDate && now <= endDate;
  }

  // Obter status da ação
  getActionStatus(action: Action): 'pending' | 'active' | 'expired' {
    const now = new Date();
    const startDate = new Date(action.start_date);
    const endDate = new Date(action.end_date);

    if (now < startDate) return 'pending';
    if (now > endDate) return 'expired';
    return 'active';
  }

  // Filtrar ações por status
  filterActionsByStatus(actions: Action[], status: 'pending' | 'active' | 'expired'): Action[] {
    if (!actions || !Array.isArray(actions)) return [];
    return actions.filter(action => this.getActionStatus(action) === status);
  }

  // Obter ações ativas
  getActiveActions(actions: Action[]): Action[] {
    if (!actions || !Array.isArray(actions)) return [];
    return this.filterActionsByStatus(actions, 'active');
  }
}

export const actionService = new ActionService();
