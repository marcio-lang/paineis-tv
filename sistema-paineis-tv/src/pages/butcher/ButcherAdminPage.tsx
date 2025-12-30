import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Download, FileText, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '../../components/base/Table';
import { Modal } from '../../components/base/Modal';
import { Input } from '../../components/base/Input';
import { Button } from '../../components/base/Button';
import { ContainerLayout } from '../../components/layout/Layout';
import { butcherService, ButcherProduct, CreateButcherProductData, UpdateButcherProductData } from '../../services/butcherService';
import { departmentService, Department } from '../../services/departmentService';

export const ButcherAdminPage: React.FC = () => {
  console.log('🎯 ButcherAdminPage: Componente sendo inicializado');
  
  // TESTE SIMPLES DE USEEFFECT
  useEffect(() => {
    console.log('🔥🔥🔥 TESTE USEEFFECT SIMPLES FUNCIONANDO!!! 🔥🔥🔥');
  }, []);
  
  const [products, setProducts] = useState<ButcherProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ButcherProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);
  const [productDeptNameById, setProductDeptNameById] = useState<Record<string, string>>({});
  const [productDeptIdById, setProductDeptIdById] = useState<Record<string, string>>({});
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ButcherProduct | null>(null);
  const [createDepartmentId, setCreateDepartmentId] = useState<string>('');
  const [editDepartmentId, setEditDepartmentId] = useState<string>('');
  
  // Formulários
  const [createForm, setCreateForm] = useState<CreateButcherProductData>({
    name: '',
    price: 0,
    position: 1,
    is_active: true,
    codigo: ''
  });
  const [editForm, setEditForm] = useState<UpdateButcherProductData>({});
  
  // Removido upload de imagem de fundo

  // Log para verificar se o componente está sendo renderizado


  // useEffect principal - carregar dados iniciais
  useEffect(() => {
    console.log('🚀🚀🚀 USEEFFECT PRINCIPAL EXECUTADO!!! 🚀🚀🚀');
    console.log('🚀 Vou chamar loadProducts...');
    
    const carregarDados = async () => {
      try {
        console.log('🚀 Iniciando carregamento de dados...');
        await loadProducts();
        console.log('🚀 loadProducts concluído');
      } catch (error) {
        console.error('🚀 Erro no useEffect principal:', error);
      }
    };
    
    carregarDados();
    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const data = await departmentService.getDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        setDepartmentsError('Erro ao carregar departamentos');
        console.error(error);
      } finally {
        setDepartmentsLoading(false);
      }
    };
    loadDepartments();
  }, []);

  // Carregar dados
  const loadProducts = async () => {
    try {
      console.log('🔄 loadProducts: Iniciando carregamento de produtos...');
      setLoading(true);
      const data = await butcherService.getProducts();
      console.log('📦 loadProducts: Dados recebidos do backend:', data);
      console.log('📊 loadProducts: Quantidade de produtos:', data?.length || 0);
      setProducts(data);
      setFilteredProducts(data);
      console.log('✅ loadProducts: Estado atualizado com sucesso');
      console.log('🔍 loadProducts: Produtos no estado:', data);
    } catch (error) {
      console.error('❌ loadProducts: Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos do açougue');
    } finally {
      setLoading(false);
      console.log('🏁 loadProducts: Carregamento finalizado');
    }
  };

  // Mapear produtos -> departamento (via painéis)
  useEffect(() => {
    const buildMap = async () => {
      const nameMap: Record<string, string> = {};
      const idMap: Record<string, string> = {};
      try {
        for (const dep of departments) {
          const panels = await departmentService.getDepartmentPanels(dep.id);
          for (const p of (panels || [])) {
            const productsInPanel = await departmentService.getPanelProducts(p.id);
          for (const v of (productsInPanel || [])) {
            if (!idMap[v.product_id]) {
              idMap[v.product_id] = dep.id;
              nameMap[v.product_id] = dep.name;
            }
          }
          }
        }
      } catch (e) {
        console.error('Erro ao mapear produtos para departamentos:', e);
      }
      setProductDeptIdById(idMap);
      setProductDeptNameById(nameMap);
    };
    buildMap();
  }, [departments, products]);

  // Filtrar produtos
  useEffect(() => {
    console.log('🔍 useEffect filtro: Executando filtro de produtos...');
    console.log('🔍 useEffect filtro: searchTerm:', searchTerm);
    console.log('🔍 useEffect filtro: products:', products);
    console.log('🔍 useEffect filtro: products.length:', products?.length || 0);
    
    let base = products;
    if (searchTerm) {
      base = base.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterDepartmentId) {
      base = base.filter(p => (productDeptIdById[p.id] || '') === filterDepartmentId);
    }
    setFilteredProducts(base);
    setCurrentPage(1); // Resetar página ao filtrar
    console.log('✅ useEffect filtro: Produtos filtrados:', base);
    console.log('✅ useEffect filtro: Quantidade filtrada:', base?.length || 0);
    console.log('🏁 useEffect filtro: Filtro concluído');
  }, [searchTerm, products, filterDepartmentId, productDeptIdById]);

  // Criar produto
  const handleCreate = async () => {
    const errors = butcherService.validateProductData(createForm);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      const created = await butcherService.createProduct(createForm);
      toast.success('Produto criado com sucesso!');

      if (createDepartmentId) {
        try {
          const panels = await departmentService.getDepartmentPanels(createDepartmentId);
          const defaultPanel = (panels || []).find(p => p.is_default) || (panels || [])[0];
          if (defaultPanel) {
            await departmentService.addProductToPanel(defaultPanel.id, created.id);
            toast.success('Produto associado ao departamento selecionado');
          } else {
            toast.warning('Departamento sem painéis; produto criado sem associação');
          }
        } catch (assocErr) {
          console.error('Erro ao associar produto ao departamento:', assocErr);
          toast.error('Produto criado, mas falhou ao associar ao departamento');
        }
      }
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        price: 0,
        position: 1,
        is_active: true,
        codigo: ''
      });
      setCreateDepartmentId('');
      loadProducts();
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar produto');
    }
  };

  // Editar produto
  const handleEdit = async () => {
    if (!selectedProduct) return;

    const errors = butcherService.validateProductData(editForm);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      const payload = {
        ...editForm,
        department_id: editDepartmentId
      };
      
      await butcherService.updateProduct(selectedProduct.id, payload);
      
      toast.success('Produto atualizado com sucesso!');
      setShowEditModal(false);
      setSelectedProduct(null);
      setEditForm({});
      setEditDepartmentId('');
      loadProducts();
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar produto');
    }
  };

  // Deletar produto
  const handleDelete = async (product: ButcherProduct) => {
    if (!confirm(`Tem certeza que deseja deletar o produto "${product.name}"?`)) {
      return;
    }

    try {
      await butcherService.deleteProduct(product.id);
      toast.success('Produto deletado com sucesso!');
      loadProducts();
    } catch (error: any) {
      console.error('Erro ao deletar produto:', error);
      toast.error(error.response?.data?.error || 'Erro ao deletar produto');
    }
  };

  // Removido upload de background


  // Exportar dados JSON
  const handleExport = async () => {
    try {
      const data = await butcherService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acougue-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Dados exportados em JSON com sucesso!');
    } catch (error: any) {
      console.error('Erro ao exportar dados:', error);
      toast.error(error.response?.data?.error || 'Erro ao exportar dados');
    }
  };

  // Exportar dados TXT
  const handleExportTxt = async () => {
    try {
      const textContent = await butcherService.exportDataTxt();
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acougue-produtos-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Dados exportados em TXT com sucesso!');
    } catch (error: any) {
      console.error('Erro ao exportar dados TXT:', error);
      toast.error(error.response?.data?.error || 'Erro ao exportar dados TXT');
    }
  };

  // Importar dados
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImport chamado!', event);
    if (!event.target.files?.[0]) {
      console.log('Nenhum arquivo selecionado');
      return;
    }

    const file = event.target.files[0];
    const fileName = file.name.toLowerCase();
    console.log('Arquivo selecionado:', fileName);
    
    // Verificar se é arquivo JSON ou TXT
    if (!fileName.endsWith('.json') && !fileName.endsWith('.txt')) {
      toast.error('Arquivo deve ser do tipo JSON ou TXT');
      return;
    }

    try {
      console.log('Iniciando leitura do arquivo...');
      const text = await file.text();
      console.log('Arquivo lido com sucesso. Tamanho:', text.length, 'caracteres');
      
      if (fileName.endsWith('.txt')) {
        console.log('Processando arquivo TXT...');
        // Processar arquivo TXT com regex pattern do layout antigo
        const produtos = [];
        
        // Regex pattern corrigida para extrair código maior (posições 3-9) e preço (posições 10-15)
        // Formato: XX[CODIGO_7_DIGITOS][PRECO_6_DIGITOS][XXX][NOME]
        // Exemplo 1: 010043175006499000QUEIJO MUSSARELA kg PALIT -> codigo: 0043175, preço: 006499 -> R$ 64,99
        // Exemplo 2: 010000175003899001ACEM kg -> codigo: 0000175, preço: 003899 -> R$ 38,99
        const pattern = /^(\d{2})(\d{7})(\d{6})(\d{3})(.+)$/;
        const lines = text.split('\n');
        console.log('Total de linhas no arquivo:', lines.length);
        
        for (let i = 0; i < lines.length; i++) {
          let linha = lines[i].trim();
          if (linha) {
            console.log(`Processando linha ${i + 1}:`, linha);
            const match = linha.match(pattern);
            if (match) {
              const prefixo = match[1]; // 01 (ignorado)
              // Capturar código maior e remover zeros à esquerda para consistência
              const codigo = parseInt(match[2]).toString(); 
              const precoStr6Digitos = match[3]; // 6 dígitos do preço
              const sufixo = match[4]; // 3 dígitos (ignorado)
              let nomeRaw = match[5].trim(); // nome do produto
              
              // Converter preço: usar os 6 dígitos completos (001899 = R$ 18,99)
              const precoEmCentavos = parseInt(precoStr6Digitos);
              const preco = precoEmCentavos / 100;
              
              // === LIMPEZA E FORMATAÇÃO DO NOME ===
              let nome = nomeRaw;
              
              // 1. Remover "kg" (insensível a maiúsculas/minúsculas) se estiver no nome
              nome = nome.replace(/\bkg\b/gi, '').trim();
              
              // 2. Remover números no início ou fim que pareçam códigos repetidos
              nome = nome.replace(/^\d+/, '').replace(/\d+$/, '');
              
              // 2. Remover espaços extras
              nome = nome.trim();
              
              // 3. Correções específicas de acentuação (maiúsculas)
              nome = nome.replace(/\bPAO\b/g, 'PÃO');
              nome = nome.replace(/\bFRANCES\b/g, 'FRANCÊS');
              nome = nome.replace(/\bFILE\b/g, 'FILÉ');
              nome = nome.replace(/\bCOXA\b/g, 'COXA');
              nome = nome.replace(/\bSOBRECOXA\b/g, 'SOBRECOXA');
              nome = nome.replace(/\bCONTRA\b/g, 'CONTRA');
              nome = nome.replace(/\bALCATRA\b/g, 'ALCATRA');
              nome = nome.replace(/\bCARTEIRA\b/g, 'CARTEIRA');
              nome = nome.replace(/\bPICANHA\b/g, 'PICANHA');
              nome = nome.replace(/\bFRALDINHA\b/g, 'FRALDINHA');
              nome = nome.replace(/\bCUPIM\b/g, 'CUPIM');
              nome = nome.replace(/\bMUSCULO\b/g, 'MÚSCULO');
              nome = nome.replace(/\bPATINHO\b/g, 'PATINHO');
              nome = nome.replace(/\bCOXAO\b/g, 'COXÃO');
              nome = nome.replace(/\bMAMINHA\b/g, 'MAMINHA');
              
              // 4. Aplicar Title Case após limpeza
              const nomeFormatado = nome.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              
              console.log(`Nome limpo e formatado: "${nomeFormatado}"`);
              
              const produto = {
                codigo: codigo,
                name: nomeFormatado,
                price: preco,
                position: produtos.length + 1, // Posição sequencial
                is_active: true
              };
              
              console.log(`Produto ${produtos.length + 1} processado:`, produto);
              produtos.push(produto);
            } else {
              console.log(`Linha ${i + 1} não corresponde ao padrão:`, linha);
            }
          }
        }
        
        console.log('Total de produtos processados:', produtos.length);
        
        if (produtos.length === 0) {
          console.error('Nenhum produto válido encontrado!');
          toast.error('Nenhum produto válido encontrado no arquivo TXT!');
          return;
        }
        
        console.log('Enviando produtos para o backend...');
        // Enviar produtos processados para o backend
        await butcherService.importData({ produtos: produtos });
        console.log('Produtos enviados com sucesso!');
        toast.success(`${produtos.length} produtos importados com sucesso do arquivo TXT!`);
      } else {
        console.log('Processando arquivo JSON...');
        // Processar arquivo JSON normalmente
        const data = JSON.parse(text);
        console.log('JSON parseado:', data);
        await butcherService.importData(data);
        toast.success('Dados importados com sucesso do arquivo JSON!');
      }
      
      console.log('Recarregando lista de produtos...');
      loadProducts();
      console.log('Importação concluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao importar dados:', error);
      console.error('Stack trace:', error.stack);
      toast.error(error.response?.data?.error || 'Erro ao importar dados');
    }
  };

  // Limpar dados
  const handleClearData = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await butcherService.clearData();
      toast.success('Dados limpos com sucesso!');
      loadProducts();
    } catch (error: any) {
      console.error('Erro ao limpar dados:', error);
      toast.error(error.response?.data?.error || 'Erro ao limpar dados');
    }
  };

  // Abrir modais
  const openEditModal = (product: ButcherProduct) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      position: product.position,
      is_active: product.is_active,
      codigo: product.codigo
    });
    const prefill = async () => {
      for (const dep of departments) {
        try {
          const panels = await departmentService.getDepartmentPanels(dep.id);
          for (const p of (panels || [])) {
            const productsInPanel = await departmentService.getPanelProducts(p.id);
            if ((productsInPanel || []).some(v => v.product_id === product.id)) {
              setEditDepartmentId(dep.id);
              return;
            }
          }
        } catch (_) {}
      }
      setEditDepartmentId('');
    };
    prefill();
    setShowEditModal(true);
  };

 

  const columns = [
    {
      key: 'position',
      label: 'Posição',
      render: (product: ButcherProduct) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {product.position}
        </span>
      )
    },
    {
      key: 'codigo',
      label: 'Código',
      render: (product: ButcherProduct) => (
        <div className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {product.codigo}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Nome do Produto',
      render: (product: ButcherProduct) => (
        <div className="font-medium text-gray-900">{product.name}</div>
      )
    },
    {
      key: 'department',
      label: 'Departamento',
      render: (product: ButcherProduct) => (
        <div className="text-gray-700">{productDeptNameById[product.id] || '—'}</div>
      )
    },
    {
      key: 'price',
      label: 'Preço',
      render: (product: ButcherProduct) => (
        <div className="font-medium text-green-600">
          {butcherService.formatPrice(product.price)}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (product: ButcherProduct) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          product.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {product.is_active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (product: ButcherProduct) => new Date(product.created_at).toLocaleDateString('pt-BR')
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (product: ButcherProduct) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(product)}
            className="text-yellow-600 hover:text-yellow-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(product)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const stats = butcherService.getProductStats(filteredProducts || []);


  // Dados paginados para a tabela
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administração do Açougue</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie produtos e configurações do painel do açougue</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produtos Inativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Preço Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {butcherService.formatPrice(stats.averagePrice)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
          <Button variant="outline" onClick={handleExportTxt}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar TXT
          </Button>
          <div className="relative">
            <input
              type="file"
              id="import-file"
              className="hidden"
              accept=".json,.txt"
              onChange={handleImport}
            />
            <Button 
              variant="outline" 
              type="button"
              onClick={() => {
                console.log('Botão clicado!');
                const fileInput = document.getElementById('import-file') as HTMLInputElement;
                if (fileInput) {
                  console.log('Input encontrado, clicando...');
                  fileInput.click();
                } else {
                  console.error('Input não encontrado!');
                }
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar Dados
            </Button>
          </div>
          <Button variant="outline" onClick={handleClearData} className="text-red-600 border-red-300 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
        Limpar Dados
      </Button>
      <div className="ml-auto w-full sm:w-auto">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filtrar por Departamento
        </label>
        <select
          value={filterDepartmentId}
          onChange={(e) => setFilterDepartmentId(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os departamentos</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
      </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow">
        <Table
          data={paginatedProducts}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum produto encontrado"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredProducts.length,
            onChange: (page) => setCurrentPage(page)
          }}
        />
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Novo Produto"
      >
        <div className="space-y-4">
          <Input
            label="Código do Produto"
            value={createForm.codigo}
            onChange={(e) => setCreateForm({ ...createForm, codigo: e.target.value })}
            placeholder="Digite o código do produto (10 dígitos)"
            maxLength={10}
          />

          <Input
            label="Nome do Produto"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Digite o nome do produto"
          />
          
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            value={createForm.price}
            onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />

          <Input
            label="Posição (1-100)"
            type="number"
            min="1"
            max="100"
            value={createForm.position}
            onChange={(e) => setCreateForm({ ...createForm, position: parseInt(e.target.value) || 1 })}
            placeholder="Digite a posição no grid"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <select
              value={createDepartmentId}
              onChange={(e) => setCreateDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{departmentsLoading ? 'Carregando...' : 'Selecione um departamento'}</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>


          <div className="flex items-center">
            <input
              type="checkbox"
              id="create_is_active"
              checked={createForm.is_active}
              onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="create_is_active" className="ml-2 block text-sm text-gray-900">
              Produto ativo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Criar Produto
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Produto"
      >
        <div className="space-y-4">
          <Input
            label="Código do Produto"
            value={editForm.codigo || ''}
            onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
            placeholder="Digite o código do produto (10 dígitos)"
            maxLength={10}
          />

          <Input
            label="Nome do Produto"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Digite o nome do produto"
          />
          
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            value={editForm.price || 0}
            onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />

          <Input
            label="Posição (1-100)"
            type="number"
            min="1"
            max="100"
            value={editForm.position || 1}
            onChange={(e) => setEditForm({ ...editForm, position: parseInt(e.target.value) || 1 })}
            placeholder="Digite a posição no grid"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <select
              value={editDepartmentId}
              onChange={(e) => setEditDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{departmentsLoading ? 'Carregando...' : 'Selecione um departamento'}</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
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
              Produto ativo
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

 
      </div>
    </ContainerLayout>
  );
};
