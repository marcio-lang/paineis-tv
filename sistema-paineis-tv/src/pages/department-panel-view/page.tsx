import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { departmentService } from '../../services/departmentService';
import type { DepartmentPanel } from '../../services/departmentService';
import { StandardTVPanel } from '../../components/tv/StandardTVPanel';
import type { ButcherProduct } from '../../services/butcherService';

const DepartmentPanelViewPage: React.FC = () => {
  const { departmentId, panelId } = useParams<{ departmentId: string; panelId: string }>();
  const [panel, setPanel] = useState<DepartmentPanel | null>(null);
  const [department, setDepartment] = useState<any>(null);
  const [products, setProducts] = useState<ButcherProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (departmentId && panelId) {
      loadPanelData();
      
      // Configurar polling baseado no intervalo do painel
      const interval = setInterval(() => {
        loadPanelData();
      }, (panel?.polling_interval || 30) * 1000);

      return () => clearInterval(interval);
    }
  }, [departmentId, panelId, panel?.polling_interval]);

  const loadPanelData = async () => {
    if (!departmentId || !panelId) return;

    try {
      const viewData = await departmentService.viewDepartmentPanel(departmentId, panelId);

      if (!viewData?.panel || !viewData?.department) {
        setError('Painel ou departamento não encontrado');
        return;
      }

      setPanel(viewData.panel);
      setDepartment(viewData.department);

      const backendProducts = (viewData.products || []) as any[];
      const formatted = backendProducts.map((p: any) => ({
        id: p.id,
        name: p.nome ?? p.name ?? 'Produto sem nome',
        price: p.preco ?? p.price ?? 0,
        position: p.posicao ?? p.position ?? 1,
        is_active: p.ativo ?? p.is_active ?? true,
        codigo: p.codigo
      })) as ButcherProduct[];

      setProducts(formatted);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar dados do painel:', err);
      setError('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  if (error || !panel || !department) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-white text-2xl">{error || 'Painel ou departamento não encontrado'}</div>
      </div>
    );
  }

  // Converter produtos para o formato esperado pelo StandardTVPanel
  const formattedProducts = products.map(p => ({
    id: p.id,
    name: (p as any).name,
    price: (p as any).price,
    position: (p as any).position,
    is_active: (p as any).is_active,
    codigo: (p as any).codigo
  }));

  // Configuração do painel
  const panelConfig = {
    title: panel?.title || panel?.name,
    subtitle: panel?.subtitle || panel?.description,
    footer_text: panel?.footer_text,
    polling_interval: panel?.polling_interval
  } as any;

  return (
    <StandardTVPanel
      products={formattedProducts}
      config={panelConfig}
      department={department}
      loading={loading}
    />
  );
};

export default DepartmentPanelViewPage;
