import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Plus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { departmentService } from '../../services/departmentService';
import type { DepartmentPanel, PanelProductView } from '../../services/departmentService';
import { butcherService } from '../../services/butcherService';
import type { ButcherProduct } from '../../services/butcherService';

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
  const [panelSearchTerm, setPanelSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingProducts, setAddingProducts] = useState(false);
  const [savingAssociation, setSavingAssociation] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedPanelProductIds, setSelectedPanelProductIds] = useState<string[]>([]);
  const [bulkRemoving, setBulkRemoving] = useState(false);

  useEffect(() => {
    loadData();
  }, [panel.id]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [panelProductsData, allProducts] = await Promise.all([
        departmentService.getPanelProducts(panel.id),
        butcherService.getProducts()
      ]);

      setPanelProducts(panelProductsData);
      
      // Filtrar produtos que não estão no painel
      const panelProductIds = panelProductsData.map(pp => pp.product_id);
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
      try {
        await departmentService.updateProductInPanel(panel.id, productId, {
          position_override: panelProducts.length + 1
        });
      } catch (_) {}
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
      setSelectedPanelProductIds((prev) => prev.filter((id) => id !== productId));
    } catch (error: any) {
      console.error('Erro ao remover produto:', error);
      toast.error(error.response?.data?.error || 'Erro ao remover produto');
    }
  };

  const handleToggleSelectPanelProduct = (associationId: string) => {
    setSelectedPanelProductIds((prev) =>
      prev.includes(associationId)
        ? prev.filter((id) => id !== associationId)
        : [...prev, associationId]
    );
  };

  const handleToggleSelectAllVisible = () => {
    const visibleIds = filteredPanelProducts.map((p) => p.id);
    const allVisibleSelected = visibleIds.every((id) => selectedPanelProductIds.includes(id));
    if (allVisibleSelected) {
      setSelectedPanelProductIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedPanelProductIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkRemoveSelected = async () => {
    const idsToRemove = filteredPanelProducts
      .map((p) => p.id)
      .filter((id) => selectedPanelProductIds.includes(id));

    if (idsToRemove.length === 0) {
      toast.info('Selecione ao menos um produto para remover.');
      return;
    }

    if (
      !confirm(
        `Tem certeza que deseja remover ${idsToRemove.length} produto(s) deste painel?`
      )
    ) {
      return;
    }

    try {
      setBulkRemoving(true);
      for (const id of idsToRemove) {
        await departmentService.removeProductFromPanel(panel.id, id);
      }
      toast.success(`Removidos ${idsToRemove.length} produto(s) do painel!`);
      setSelectedPanelProductIds((prev) => prev.filter((id) => !idsToRemove.includes(id)));
      loadData();
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao remover produtos selecionados:', error);
      toast.error(error.response?.data?.error || 'Erro ao remover produtos selecionados');
    } finally {
      setBulkRemoving(false);
    }
  };

  const normalizedSearchTerm = searchTerm.toLowerCase();
  const availableProductsMatches = useMemo(() => {
    return availableProducts.filter(product =>
      product.name.toLowerCase().includes(normalizedSearchTerm) ||
      product.codigo.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [availableProducts, normalizedSearchTerm]);

  const filteredAvailableProducts = useMemo(() => {
    return availableProductsMatches.slice(0, 1000);
  }, [availableProductsMatches]);

  const filteredPanelProducts = panelProducts.filter(product =>
    product.name.toLowerCase().includes(panelSearchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(panelSearchTerm.toLowerCase())
  );

  const activeCount = panelProducts.filter(p => p.active_in_panel).length;

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 h-[90vh] flex flex-col min-h-0">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gerenciar Produtos - {panel.name}
            </h2>
            <p className="text-sm text-gray-600">
              {panelProducts.length} produtos associados ({activeCount} visíveis)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-0">
            {/* Produtos no Painel */}
            <div className="border-r border-gray-200 flex flex-col overflow-hidden min-h-0">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Produtos no Painel ({filteredPanelProducts.length}/{panelProducts.length})
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Buscar no painel..."
                        value={panelSearchTerm}
                        onChange={(e) => setPanelSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Arraste para reordenar ou defina a posição manualmente
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <label className="flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={handleToggleSelectAllVisible}
                        checked={
                          filteredPanelProducts.length > 0 &&
                          filteredPanelProducts
                            .map((p) => p.id)
                            .every((id) => selectedPanelProductIds.includes(id))
                        }
                      />
                      Selecionar visíveis
                    </label>
                    <button
                      type="button"
                      onClick={handleBulkRemoveSelected}
                      disabled={bulkRemoving || selectedPanelProductIds.length === 0}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remover selecionados
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-scroll p-4 bg-white custom-scrollbar">
                {filteredPanelProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {panelSearchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto no painel'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPanelProducts.map((association, index) => (
                      <div
                        key={association.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        draggable={!panelSearchTerm} // Desabilitar drag quando filtrado
                        onDragStart={() => !panelSearchTerm && setDragIndex(index)}
                        onDragOver={(e) => !panelSearchTerm && e.preventDefault()}
                        onDrop={async () => {
                          if (panelSearchTerm) return; // Não permitir drop quando filtrado
                          if (dragIndex === null || dragIndex === index) return;
                          
                          const next = [...panelProducts];
                          const [moved] = next.splice(dragIndex, 1);
                          next.splice(index, 0, moved);
                          
                          // Otimistic update
                          setPanelProducts(next);
                          
                          try {
                            const productOrders = next.map((p, i) => ({
                              product_id: p.id,
                              position: i + 1
                            }));
                            
                            await departmentService.reorderPanelProducts(panel.id, productOrders);
                            toast.success('Ordem atualizada');
                            onUpdate();
                          } catch (err: any) {
                            console.error('Erro ao reordenar:', err);
                            toast.error(err?.response?.data?.error || 'Erro ao salvar ordem');
                            loadData(); // Reverter se der erro
                          } finally {
                            setDragIndex(null);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedPanelProductIds.includes(association.id)}
                              onChange={() => handleToggleSelectPanelProduct(association.id)}
                            />
                          </div>
                          <div>
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
                              <span className="text-xs text-gray-500">Posição:</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={association.position_override || index + 1}
                                onChange={(e) => handleUpdatePosition(association, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
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
            <div className="flex flex-col overflow-hidden min-h-0">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Produtos Disponíveis ({availableProducts.length})
                </h3>
                {availableProductsMatches.length > 1000 && (
                  <p className="text-[10px] text-amber-600 mb-2">
                    Mostrando apenas os primeiros 1000 resultados. Use a busca para encontrar produtos específicos.
                  </p>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-scroll p-4 bg-white custom-scrollbar">
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
