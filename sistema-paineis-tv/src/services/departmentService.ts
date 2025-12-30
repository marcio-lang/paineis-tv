import { api } from './api';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  icon: string;
  keywords?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  panels_count: number;
}

export interface DepartmentPanel {
  id: string;
  name: string;
  description?: string;
  department_id: string;
  department_name?: string;
  title?: string;
  subtitle?: string;
  footer_text?: string;
  polling_interval: number;
  active: boolean;
  is_default: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  products_count: number;
}

export interface ProductPanelAssociation {
  id: string;
  product_id: string;
  panel_id: string;
  position_override?: number;
  active_in_panel: boolean;
  created_at: string;
  updated_at: string;
  product?: any;
}

export interface PanelProductView {
  id: string; // ID da associação
  product_id: string; // ID do produto
  codigo: string;
  name: string;
  price: number;
  position: number;
  is_active: boolean;
  position_override?: number;
  active_in_panel: boolean;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  keywords?: string[];
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  icon?: string;
  keywords?: string[];
  active?: boolean;
}

export interface CreatePanelData {
  name: string;
  description?: string;
  title?: string;
  subtitle?: string;
  footer_text?: string;
  polling_interval?: number;
  is_default?: boolean;
  display_order?: number;
}

export interface UpdatePanelData {
  name?: string;
  description?: string;
  title?: string;
  subtitle?: string;
  footer_text?: string;
  polling_interval?: number;
  is_default?: boolean;
  display_order?: number;
  active?: boolean;
}

class DepartmentService {
  // Departamentos
  async getDepartments(): Promise<Department[]> {
    const response = await api.get('/departments');
    return response; // Remover .data pois api.get já retorna os dados diretamente
  }

  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const response = await api.post('/departments', data);
    return response;
  }

  async updateDepartment(id: string, data: UpdateDepartmentData): Promise<Department> {
    const response = await api.put(`/departments/${id}`, data);
    return response;
  }

  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  }

  // Painéis de Departamento
  async getDepartmentPanels(departmentId: string): Promise<DepartmentPanel[]> {
    const response = await api.get(`/departments/${departmentId}/panels`);
    return response; // Remover .data pois api.get já retorna os dados diretamente
  }

  async createDepartmentPanel(departmentId: string, data: CreatePanelData): Promise<DepartmentPanel> {
    const response = await api.post(`/departments/${departmentId}/panels`, data);
    return response;
  }

  async updateDepartmentPanel(panelId: string, data: UpdatePanelData): Promise<DepartmentPanel> {
    const response = await api.put(`/panels/${panelId}`, data);
    return response;
  }

  async deleteDepartmentPanel(panelId: string): Promise<void> {
    await api.delete(`/panels/${panelId}`);
  }

  // Associações Produto-Painel
  async getPanelProducts(panelId: string): Promise<PanelProductView[]> {
    const response = await api.get(`/panels/${panelId}/products`);
    return response;
  }

  async addProductToPanel(panelId: string, productId: string): Promise<{ message: string; added_count: number }> {
    const response = await api.post(`/panels/${panelId}/products`, {
      product_ids: [productId]
    });
    return response;
  }

  async updateProductInPanel(panelId: string, productId: string, data: { position_override?: number; active_in_panel?: boolean }): Promise<ProductPanelAssociation> {
    const response = await api.put(`/panels/${panelId}/products/${productId}`, data);
    return response;
  }

  async removeProductFromPanel(panelId: string, productId: string): Promise<{ message: string }> {
    const response = await api.delete(`/panels/${panelId}/products/${productId}`);
    return response;
  }

  async reorderPanelProducts(panelId: string, productOrders: { product_id: string; position: number }[]): Promise<{ message: string }> {
    const response = await api.post(`/panels/${panelId}/products/reorder`, {
      product_orders: productOrders
    });
    return response;
  }

  // Categorização Automática
  async autoCategorizeDepartment(departmentId: string): Promise<{
    message: string;
    categorized_count: number;
    department: string;
    panel: string;
  }> {
    const response = await api.post('/products/auto-categorize', { department_id: departmentId });
    return response;
  }

  // Alias para compatibilidade
  async autoCategorizeProducts(departmentId: string): Promise<{
    message: string;
    categorized_count: number;
    department: string;
    panel: string;
  }> {
    return this.autoCategorizeDepartment(departmentId);
  }

  // Visualização do Painel
  async viewDepartmentPanel(departmentId: string, panelId: string): Promise<{
    panel: DepartmentPanel;
    department: Department;
    products: any[];
    config: {
      polling_interval: number;
      title: string;
      subtitle: string;
      footer_text: string;
    };
  }> {
    const response = await api.get(`/departments/${departmentId}/panels/${panelId}/view`);
    return response;
  }
}

export const departmentService = new DepartmentService();
