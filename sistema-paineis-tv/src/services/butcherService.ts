import { api } from './api';

export interface ButcherProduct {
  id: string;
  codigo: string;
  name: string;
  price: number;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ButcherConfig {
  polling_interval: number;
  title?: string;
  footer_text?: string;
}

export interface CreateButcherProductData {
  codigo: string;
  name: string;
  price: number;
  position: number;
  is_active?: boolean;
}

export interface UpdateButcherProductData {
  codigo?: string;
  name?: string;
  price?: number;
  position?: number;
  is_active?: boolean;
}

class ButcherService {
  // CRUD de Produtos
  async getProducts(): Promise<ButcherProduct[]> {
    console.log('🔄 butcherService.getProducts: Iniciando requisição...');
    try {
      console.log('🌐 butcherService.getProducts: Fazendo GET /acougue/produtos');
      const response = await api.get('/acougue/produtos');
      console.log('📦 butcherService.getProducts: Resposta recebida:', response);
      console.log('📊 butcherService.getProducts: Tipo da resposta:', typeof response);
      console.log('📋 butcherService.getProducts: Array.isArray(response):', Array.isArray(response));
      
      // A resposta da API usando fetch é diretamente o array
      const products = Array.isArray(response) ? response : [];
      console.log('✅ butcherService.getProducts: Produtos processados:', products);
      console.log('🔢 butcherService.getProducts: Quantidade de produtos:', products.length);
      
      return products;
    } catch (error) {
      console.error('❌ butcherService.getProducts: Erro na requisição:', error);
      throw error;
    }
  }

  async getActiveProducts(): Promise<ButcherProduct[]> {
    console.log('🔄 butcherService.getActiveProducts: Iniciando requisição...');
    try {
      console.log('🌐 butcherService.getActiveProducts: Fazendo GET /acougue/produtos/ativos');
      const response = await api.get('/acougue/produtos/ativos');
      console.log('📦 butcherService.getActiveProducts: Resposta recebida:', response);
      console.log('📊 butcherService.getActiveProducts: Tipo da resposta:', typeof response);
      console.log('📋 butcherService.getActiveProducts: Array.isArray(response):', Array.isArray(response));
      
      const products = Array.isArray(response) ? response : [];
      console.log('✅ butcherService.getActiveProducts: Produtos processados:', products);
      console.log('🔢 butcherService.getActiveProducts: Quantidade de produtos:', products.length);
      
      return products;
    } catch (error) {
      console.error('❌ butcherService.getActiveProducts: Erro na requisição:', error);
      throw error;
    }
  }

  async createProduct(data: CreateButcherProductData): Promise<ButcherProduct> {
    const response = await api.post('/acougue/produtos', data);
    return response;
  }

  async updateProduct(id: string, data: UpdateButcherProductData): Promise<ButcherProduct> {
    const response = await api.put(`/acougue/produtos/${id}`, data);
    return response;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/acougue/produtos/${id}`);
  }

  // Configurações
  async getConfig(): Promise<ButcherConfig> {
    const response = await api.get('/acougue/config');
    return response;
  }

  async updateConfig(data: Partial<ButcherConfig>): Promise<ButcherConfig> {
    const response = await api.post('/acougue/config', data);
    return response;
  }


  // Import/Export
  async exportData(): Promise<Blob> {
    const response = await api.get('/acougue/export', {
      responseType: 'blob',
    });
    return response;
  }

  async exportDataTxt(): Promise<string> {
    const products = await this.getProducts();
    let textContent = '';
    
    products.forEach(produto => {
      // Converter preço para formato com zeros (compatível com regex)
      const precoStr = produto.price.toFixed(2);
      const precoLimpo = precoStr.replace('.', '');
      const precoFormatado = precoLimpo.padStart(4, '0') + '00';
      const nomeFormatado = produto.name.toUpperCase();
      
      // Usar código real do produto (garantir 10 dígitos)
      const codigo = produto.codigo.padStart(10, '0');
      
      textContent += `${codigo}${precoFormatado}${nomeFormatado}kg\n`;
    });
    
    return textContent;
  }

  async importData(data: any): Promise<{ message: string; imported_count: number }> {
    const response = await api.post('/acougue/import-processed', data);
    return response;
  }

  async clearData(): Promise<{ message: string }> {
    const response = await api.delete('/acougue/produtos/clear-all');
    return response;
  }

  // Utilitários

  // Validações
  validateProductData(data: CreateButcherProductData | UpdateButcherProductData): string[] {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length < 2)) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if ('price' in data && (data.price === undefined || data.price < 0)) {
      errors.push('Preço deve ser um valor positivo');
    }

    if ('position' in data && (data.position === undefined || data.position < 1 || data.position > 24)) {
      errors.push('Posição deve ser entre 1 e 24');
    }

    return errors;
  }


  // Formatação
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }

  // Organização de produtos por posição
  organizeByPosition(products: ButcherProduct[]): ButcherProduct[] {
    // Organizar produtos por posição para o grid 6x4 (24 posições)
    return products
      .filter(product => product.is_active)
      .sort((a, b) => a.position - b.position);
  }

  // Obter posições disponíveis
  getAvailablePositions(products: ButcherProduct[]): number[] {
    const usedPositions = products
      .filter(p => p.is_active)
      .map(p => p.position);
    
    const allPositions = Array.from({ length: 24 }, (_, i) => i + 1);
    return allPositions.filter(pos => !usedPositions.includes(pos));
  }

  // Estatísticas
  getProductStats(products: ButcherProduct[]) {
    // Garantir que products seja sempre um array
    const safeProducts = products || [];
    const active = safeProducts.filter(p => p.is_active);
    const inactive = safeProducts.filter(p => !p.is_active);
    const totalValue = active.reduce((sum, p) => sum + p.price, 0);
    const averagePrice = active.length > 0 ? totalValue / active.length : 0;

    return {
      total: safeProducts.length,
      active: active.length,
      inactive: inactive.length,
      totalValue,
      averagePrice,
      occupiedPositions: active.length,
      availablePositions: 24 - active.length,
    };
  }
}

export const butcherService = new ButcherService();