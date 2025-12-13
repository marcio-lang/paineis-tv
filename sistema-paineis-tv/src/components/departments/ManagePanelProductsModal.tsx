import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, Package, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { DepartmentPanel, departmentService, PanelProductView } from '../../services/departmentService';
import { butcherService, ButcherProduct } from '../../services/butcherService';

interface ManagePanelProductsModalProps {
  panel: DepartmentPanel;
  onClose: () => void;
  onUpdate: () => void;
}

const ManagePanelProductsModal: React.FC<ManagePanelProductsModalProps> = ({ 
  panel, 
  onClose, 
  onUpdate 
}) => {
  const [panelProducts, setPanelProducts] = useState<PanelProductView[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ButcherProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingProducts, setAddingProducts] = useState(false);
  const [savingAssociation, setSavingAssociation] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [panel.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [panelProductsData, allProducts] = await Promise.all([
        departmentService.getPanelProducts(panel.id),
        butcherService.getProducts()
      ]);

      setPanelProducts(panelProductsData);
      
      // Filtrar produtos que não estão no painel
      const panelProductIds = panelProductsData.map(pp => pp.id);
      const available = allProducts.filter(p => !panelProductIds.includes(p.id));
      setAvailableProducts(available);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar produtos do painel');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productId: string) => {
    try {
      await departmentService.addProductToPanel(panel.id, productId);
      toast.success('Produto adicionado ao painel!');
      loadData();
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error);
      toast.error(error.response?.data?.error || 'Erro ao adicionar produto');
    }
  };

  const handleToggleVisibility = async (association: PanelProductView) => {
    try {
      setSavingAssociation(association.id);
      await departmentService.updateProductInPanel(panel.id, association.id, {
        active_in_panel: !association.active_in_panel
      });
      toast.success('Visibilidade atualizada');
      loadData();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar visibilidade');
    } finally {
      setSavingAssociation(null);
    }
  };

  const handleUpdatePosition = async (association: PanelProductView, value: number) => {
    try {
      setSavingAssociation(association.id);
      await departmentService.updateProductInPanel(panel.id, association.id, {
        position_override: value
      });
      toast.success('Posição atualizada');
      loadData();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar posição');
    } finally {
      setSavingAssociation(null);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja remover este produto do painel?')) {
      return;
    }

    try {
      await departmentService.removeProductFromPanel(panel.id, productId);
      toast.success('Produto removido do painel!');
      loadData();
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao remover produto:', error);
      toast.error(error.response?.data?.error || 'Erro ao remover produto');
    }
  };

  const filteredAvailableProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gerenciar Produtos - {panel.name}
            </h2>
            <p className="text-sm text-gray-600">
              {panelProducts.length} produtos no painel
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Produtos no Painel */}
            <div className="border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Produtos no Painel ({panelProducts.length})
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {panelProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum produto no painel</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {panelProducts.map((association) => (
                      <div
                        key={association.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {association.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Código: {association.codigo}
                          </p>
                          <p className="text-sm text-gray-600">
                            Preço: R$ {association.price.toFixed(2)}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Posição</span>
                              <input
                                type="number"
                                min={1}
                                max={24}
                                defaultValue={association.position_override || association.position || 1}
                                onBlur={(e) => {
                                  const v = parseInt(e.target.value || '0', 10) || 0;
                                  if (v >= 1 && v <= 24) {
                                    handleUpdatePosition(association, v);
                                  } else {
                                    toast.error('Posição deve ser entre 1 e 24');
                                  }
                                }}
                                className="w-20 px-2 py-1 border border-gray-300 rounded"
                              />
                            </div>
                            <button
                              onClick={() => handleToggleVisibility(association)}
                              disabled={savingAssociation === association.id}
                              className={`px-2 py-1 text-xs rounded ${association.active_in_panel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              title={association.active_in_panel ? 'Visível no painel' : 'Oculto no painel'}
                            >
                              {association.active_in_panel ? 'Visível' : 'Oculto'}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(association.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Remover do painel"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Produtos Disponíveis */}
            <div className="flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Produtos Disponíveis ({availableProducts.length})
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {filteredAvailableProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? 'Nenhum produto encontrado' : 'Todos os produtos já estão no painel'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailableProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Código: {product.codigo}
                          </p>
                          <p className="text-sm text-gray-600">
                            Preço: R$ {product.price.toFixed(2)}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            product.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddProduct(product.id)}
                          disabled={addingProducts}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                          title="Adicionar ao painel"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePanelProductsModal;
