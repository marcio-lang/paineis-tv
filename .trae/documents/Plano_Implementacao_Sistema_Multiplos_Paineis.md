# Plano de Implementação - Sistema de Múltiplos Painéis Segmentados

## 1. Visão Geral da Implementação

### 1.1 Estratégia de Implementação
- **Abordagem**: Implementação incremental em fases para minimizar impacto no sistema atual
- **Compatibilidade**: Manter 100% de compatibilidade com dados e funcionalidades existentes
- **Migração**: Migração automática de dados existentes para o novo modelo
- **Rollback**: Possibilidade de reverter para o sistema anterior se necessário

### 1.2 Cronograma Estimado
- **Fase 1** (Semana 1-2): Estrutura de dados e backend
- **Fase 2** (Semana 3-4): Interface de gestão de painéis
- **Fase 3** (Semana 5-6): Sistema de categorização e importação inteligente
- **Fase 4** (Semana 7-8): Visualização de painéis TV e testes finais

## 2. Fase 1: Estrutura de Dados e Backend (Semanas 1-2)

### 2.1 Migração do Banco de Dados

**Passo 1: Backup e Preparação**
```bash
# Backup do banco atual
cp instance/paineltv.db instance/paineltv_backup_$(date +%Y%m%d).db

# Criar script de migração
python migrate_to_multipanel_system.py
```

**Passo 2: Criação das Novas Tabelas**
```python
# migrate_to_multipanel_system.py
import sqlite3
from datetime import datetime

def migrate_database():
    conn = sqlite3.connect('instance/paineltv.db')
    cursor = conn.cursor()
    
    # Criar tabela de categorias
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            department VARCHAR(50) NOT NULL,
            color_code VARCHAR(7) DEFAULT '#6b7280',
            detection_keywords JSON DEFAULT '[]',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Criar tabela de painéis
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS panels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            department VARCHAR(50) NOT NULL,
            description TEXT,
            config JSON DEFAULT '{}',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER
        )
    ''')
    
    # Criar tabela de associação
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS panel_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            panel_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            display_order INTEGER DEFAULT 0,
            custom_config JSON DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (panel_id) REFERENCES panels(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            UNIQUE(panel_id, product_id)
        )
    ''')
    
    # Adicionar colunas aos produtos existentes
    try:
        cursor.execute('ALTER TABLE products ADD COLUMN category_id INTEGER')
        cursor.execute('ALTER TABLE products ADD COLUMN department VARCHAR(50)')
    except sqlite3.OperationalError:
        pass  # Colunas já existem
    
    conn.commit()
    conn.close()
```

**Passo 3: Dados Iniciais**
```python
def insert_initial_data():
    conn = sqlite3.connect('instance/paineltv.db')
    cursor = conn.cursor()
    
    # Categorias iniciais
    categories = [
        ('Carnes Bovinas', 'açougue', '#dc2626', '["carne", "boi", "bovino", "alcatra", "picanha"]'),
        ('Carnes Suínas', 'açougue', '#dc2626', '["porco", "suíno", "lombo", "costela"]'),
        ('Aves', 'açougue', '#dc2626', '["frango", "galinha", "ave", "peito", "coxa"]'),
        ('Pães', 'padaria', '#f97316', '["pão", "pães", "baguete", "francês"]'),
        ('Doces', 'padaria', '#f97316', '["doce", "bolo", "torta", "brigadeiro"]'),
        ('Frutas', 'hortifruti', '#16a34a', '["fruta", "maçã", "banana", "laranja"]'),
        ('Verduras', 'hortifruti', '#16a34a', '["verdura", "alface", "couve", "espinafre"]'),
        ('Sem Categoria', 'geral', '#6b7280', '[]')
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO categories (name, department, color_code, detection_keywords)
        VALUES (?, ?, ?, ?)
    ''', categories)
    
    # Painéis iniciais
    panels = [
        ('Painel Açougue', 'açougue', 'Produtos do açougue - carnes e aves'),
        ('Painel Padaria', 'padaria', 'Produtos da padaria - pães e doces'),
        ('Painel Hortifruti', 'hortifruti', 'Frutas, verduras e legumes'),
        ('Painel Geral', 'geral', 'Todos os produtos (compatibilidade)')
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO panels (name, department, description)
        VALUES (?, ?, ?)
    ''', panels)
    
    conn.commit()
    conn.close()
```

### 2.2 Atualização do Backend

**Passo 1: Novos Modelos SQLAlchemy**
```python
# models/panel.py
from app import db
from datetime import datetime
import json

class Panel(db.Model):
    __tablename__ = 'panels'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    config = db.Column(db.Text, default='{}')  # JSON como texto
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer)
    
    # Relacionamentos
    products = db.relationship('Product', secondary='panel_products', back_populates='panels')
    
    def get_config(self):
        return json.loads(self.config) if self.config else {}
    
    def set_config(self, config_dict):
        self.config = json.dumps(config_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'department': self.department,
            'description': self.description,
            'config': self.get_config(),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'product_count': len(self.products)
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    color_code = db.Column(db.String(7), default='#6b7280')
    detection_keywords = db.Column(db.Text, default='[]')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_keywords(self):
        return json.loads(self.detection_keywords) if self.detection_keywords else []
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'department': self.department,
            'color_code': self.color_code,
            'keywords': self.get_keywords(),
            'is_active': self.is_active
        }

class PanelProduct(db.Model):
    __tablename__ = 'panel_products'
    
    id = db.Column(db.Integer, primary_key=True)
    panel_id = db.Column(db.Integer, db.ForeignKey('panels.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    display_order = db.Column(db.Integer, default=0)
    custom_config = db.Column(db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('panel_id', 'product_id'),)
```

**Passo 2: Atualização do Modelo Product**
```python
# Adicionar ao modelo Product existente
class Product(db.Model):
    # ... campos existentes ...
    
    # Novos campos
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    department = db.Column(db.String(50))
    
    # Relacionamentos
    category = db.relationship('Category', backref='products')
    panels = db.relationship('Panel', secondary='panel_products', back_populates='products')
    
    def to_dict(self):
        return {
            # ... campos existentes ...
            'category': self.category.to_dict() if self.category else None,
            'department': self.department,
            'panels': [{'id': p.id, 'name': p.name} for p in self.panels]
        }
```

### 2.3 APIs do Backend

**Passo 1: Controller de Painéis**
```python
# controllers/panel_controller.py
from flask import Blueprint, request, jsonify
from models.panel import Panel, PanelProduct
from models.product import Product
from app import db

panel_bp = Blueprint('panels', __name__)

@panel_bp.route('/api/panels', methods=['GET'])
def get_panels():
    panels = Panel.query.filter_by(is_active=True).all()
    return jsonify({
        'panels': [panel.to_dict() for panel in panels],
        'total': len(panels)
    })

@panel_bp.route('/api/panels', methods=['POST'])
def create_panel():
    data = request.get_json()
    
    panel = Panel(
        name=data['name'],
        department=data['department'],
        description=data.get('description', ''),
        is_active=data.get('is_active', True)
    )
    
    if 'config' in data:
        panel.set_config(data['config'])
    
    db.session.add(panel)
    db.session.commit()
    
    return jsonify(panel.to_dict()), 201

@panel_bp.route('/api/panels/<int:panel_id>', methods=['PUT'])
def update_panel(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    data = request.get_json()
    
    panel.name = data.get('name', panel.name)
    panel.department = data.get('department', panel.department)
    panel.description = data.get('description', panel.description)
    panel.is_active = data.get('is_active', panel.is_active)
    
    if 'config' in data:
        panel.set_config(data['config'])
    
    db.session.commit()
    return jsonify(panel.to_dict())

@panel_bp.route('/api/panels/<int:panel_id>/products', methods=['GET'])
def get_panel_products(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    products = panel.products
    
    return jsonify({
        'panel': panel.to_dict(),
        'products': [product.to_dict() for product in products]
    })

@panel_bp.route('/api/panels/<int:panel_id>/products/<int:product_id>', methods=['POST'])
def add_product_to_panel(panel_id, product_id):
    panel = Panel.query.get_or_404(panel_id)
    product = Product.query.get_or_404(product_id)
    
    # Verificar se já existe associação
    existing = PanelProduct.query.filter_by(
        panel_id=panel_id, 
        product_id=product_id
    ).first()
    
    if existing:
        return jsonify({'message': 'Produto já associado ao painel'}), 400
    
    association = PanelProduct(
        panel_id=panel_id,
        product_id=product_id,
        display_order=len(panel.products)
    )
    
    db.session.add(association)
    db.session.commit()
    
    return jsonify({'message': 'Produto adicionado ao painel'}), 201
```

## 3. Fase 2: Interface de Gestão de Painéis (Semanas 3-4)

### 3.1 Componentes React

**Passo 1: Hook para Gestão de Painéis**
```typescript
// hooks/usePanels.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

interface Panel {
  id: number
  name: string
  department: string
  description: string
  config: Record<string, any>
  is_active: boolean
  product_count: number
  created_at: string
  updated_at: string
}

export const usePanels = () => {
  return useQuery({
    queryKey: ['panels'],
    queryFn: async () => {
      const response = await api.get('/api/panels')
      return response.data
    }
  })
}

export const useCreatePanel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (panelData: Partial<Panel>) => {
      const response = await api.post('/api/panels', panelData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panels'] })
    }
  })
}

export const useUpdatePanel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Panel> & { id: number }) => {
      const response = await api.put(`/api/panels/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panels'] })
    }
  })
}
```

**Passo 2: Componente de Lista de Painéis**
```typescript
// components/panels/PanelList.tsx
import React from 'react'
import { usePanels } from '../../hooks/usePanels'
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const departmentColors = {
  'açougue': 'bg-red-100 text-red-800',
  'padaria': 'bg-orange-100 text-orange-800',
  'hortifruti': 'bg-green-100 text-green-800',
  'geral': 'bg-gray-100 text-gray-800'
}

export const PanelList: React.FC = () => {
  const { data: panelsData, isLoading } = usePanels()
  
  if (isLoading) {
    return <div className="animate-pulse">Carregando painéis...</div>
  }
  
  const panels = panelsData?.panels || []
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Painéis</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <PlusIcon className="w-5 h-5" />
          Novo Painel
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {panels.map((panel) => (
          <div key={panel.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{panel.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${departmentColors[panel.department]}`}>
                  {panel.department}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${panel.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{panel.description}</p>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>{panel.product_count} produtos</span>
              <span>Atualizado em {new Date(panel.updated_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-100 flex items-center justify-center gap-1">
                <EyeIcon className="w-4 h-4" />
                Visualizar
              </button>
              <button className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-100 flex items-center justify-center gap-1">
                <PencilIcon className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Passo 3: Formulário de Criação/Edição**
```typescript
// components/panels/PanelForm.tsx
import React, { useState } from 'react'
import { useCreatePanel, useUpdatePanel } from '../../hooks/usePanels'

interface PanelFormProps {
  panel?: Panel
  onClose: () => void
}

export const PanelForm: React.FC<PanelFormProps> = ({ panel, onClose }) => {
  const [formData, setFormData] = useState({
    name: panel?.name || '',
    department: panel?.department || 'geral',
    description: panel?.description || '',
    is_active: panel?.is_active ?? true
  })
  
  const createPanel = useCreatePanel()
  const updatePanel = useUpdatePanel()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (panel) {
        await updatePanel.mutateAsync({ id: panel.id, ...formData })
      } else {
        await createPanel.mutateAsync(formData)
      }
      onClose()
    } catch (error) {
      console.error('Erro ao salvar painel:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {panel ? 'Editar Painel' : 'Novo Painel'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Painel
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="geral">Geral</option>
              <option value="açougue">Açougue</option>
              <option value="padaria">Padaria</option>
              <option value="hortifruti">Hortifruti</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Painel ativo
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createPanel.isPending || updatePanel.isPending}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {panel ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

## 4. Fase 3: Sistema de Categorização (Semanas 5-6)

### 4.1 Engine de Detecção de Categorias

**Passo 1: Serviço de Categorização**
```python
# services/category_detection.py
import re
from typing import List, Tuple, Dict
from models.category import Category

class CategoryDetectionService:
    def __init__(self):
        self.categories = self._load_categories()
    
    def _load_categories(self) -> List[Category]:
        return Category.query.filter_by(is_active=True).all()
    
    def detect_category(self, product_name: str, description: str = '') -> Tuple[Category, float]:
        """
        Detecta a categoria de um produto baseado no nome e descrição
        Retorna: (categoria, confiança)
        """
        text = f"{product_name} {description}".lower()
        
        best_match = None
        best_score = 0.0
        
        for category in self.categories:
            score = self._calculate_match_score(text, category)
            if score > best_score:
                best_score = score
                best_match = category
        
        # Se não encontrou match com confiança mínima, retorna categoria padrão
        if best_score < 0.3:
            default_category = Category.query.filter_by(name='Sem Categoria').first()
            return default_category, 0.1
        
        return best_match, best_score
    
    def _calculate_match_score(self, text: str, category: Category) -> float:
        keywords = category.get_keywords()
        if not keywords:
            return 0.0
        
        matches = 0
        total_keywords = len(keywords)
        
        for keyword in keywords:
            if keyword.lower() in text:
                matches += 1
        
        # Score baseado na proporção de keywords encontradas
        base_score = matches / total_keywords
        
        # Bonus para matches exatos
        for keyword in keywords:
            if re.search(rf'\b{re.escape(keyword.lower())}\b', text):
                base_score += 0.2
        
        return min(base_score, 1.0)
    
    def suggest_categories(self, product_name: str, description: str = '') -> List[Dict]:
        """
        Retorna lista de categorias sugeridas com scores
        """
        text = f"{product_name} {description}".lower()
        suggestions = []
        
        for category in self.categories:
            score = self._calculate_match_score(text, category)
            if score > 0.1:
                suggestions.append({
                    'category': category.to_dict(),
                    'confidence': score
                })
        
        return sorted(suggestions, key=lambda x: x['confidence'], reverse=True)[:3]
```

**Passo 2: API de Categorização**
```python
# controllers/category_controller.py
from flask import Blueprint, request, jsonify
from services.category_detection import CategoryDetectionService

category_bp = Blueprint('categories', __name__)
detection_service = CategoryDetectionService()

@category_bp.route('/api/categories/detect', methods=['POST'])
def detect_category():
    data = request.get_json()
    product_name = data.get('product_name', '')
    description = data.get('description', '')
    
    category, confidence = detection_service.detect_category(product_name, description)
    suggestions = detection_service.suggest_categories(product_name, description)
    
    return jsonify({
        'category': category.to_dict(),
        'confidence': confidence,
        'suggestions': suggestions
    })

@category_bp.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(is_active=True).all()
    return jsonify({
        'categories': [cat.to_dict() for cat in categories]
    })
```

### 4.2 Interface de Importação Inteligente

**Passo 1: Componente de Upload**
```typescript
// components/import/IntelligentImport.tsx
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface ImportedProduct {
  name: string
  price: number
  description?: string
  detected_category?: {
    id: number
    name: string
    department: string
    confidence: number
  }
  suggested_categories?: Array<{
    category: any
    confidence: number
  }>
  manual_category?: number
}

export const IntelligentImport: React.FC = () => {
  const [products, setProducts] = useState<ImportedProduct[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('auto_categorize', 'true')
      
      const response = await fetch('/api/products/import/preview', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Erro no upload:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json']
    },
    multiple: false
  })
  
  const updateProductCategory = (index: number, categoryId: number) => {
    setProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, manual_category: categoryId } : product
    ))
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Importação Inteligente de Produtos</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Solte o arquivo aqui...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Arraste um arquivo TXT ou JSON aqui, ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500">
                O sistema detectará automaticamente as categorias dos produtos
              </p>
            </div>
          )}
        </div>
        
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processando arquivo e detectando categorias...</p>
          </div>
        )}
      </div>
      
      {products.length > 0 && (
        <ProductPreviewTable 
          products={products}
          onUpdateCategory={updateProductCategory}
        />
      )}
    </div>
  )
}
```

## 5. Fase 4: Visualização de Painéis TV (Semanas 7-8)

### 5.1 Seletor de Painéis

**Passo 1: Modal de Seleção**
```typescript
// components/tv/PanelSelector.tsx
import React from 'react'
import { usePanels } from '../../hooks/usePanels'
import { EyeIcon, PlayIcon } from '@heroicons/react/24/outline'

interface PanelSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectPanel: (panelId: number) => void
}

export const PanelSelector: React.FC<PanelSelectorProps> = ({
  isOpen,
  onClose,
  onSelectPanel
}) => {
  const { data: panelsData } = usePanels()
  const panels = panelsData?.panels?.filter(p => p.is_active) || []
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Selecionar Painel para Exibição</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Escolha qual painel deseja exibir na TV
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {panels.map((panel) => (
              <PanelCard
                key={panel.id}
                panel={panel}
                onSelect={() => onSelectPanel(panel.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const PanelCard: React.FC<{ panel: any; onSelect: () => void }> = ({
  panel,
  onSelect
}) => {
  const departmentColors = {
    'açougue': 'from-red-500 to-red-600',
    'padaria': 'from-orange-500 to-orange-600',
    'hortifruti': 'from-green-500 to-green-600',
    'geral': 'from-gray-500 to-gray-600'
  }
  
  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-32 bg-gradient-to-br ${departmentColors[panel.department]} flex items-center justify-center`}>
        <div className="text-white text-center">
          <h3 className="text-xl font-bold">{panel.name}</h3>
          <p className="text-sm opacity-90">{panel.product_count} produtos</p>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4">{panel.description}</p>
        
        <div className="flex gap-2">
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 flex items-center justify-center gap-1">
            <EyeIcon className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={onSelect}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <PlayIcon className="w-4 h-4" />
            Exibir
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 5.2 Visualização do Painel TV

**Passo 1: Componente de Exibição**
```typescript
// components/tv/PanelDisplay.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePanelProducts } from '../../hooks/usePanels'

export const PanelDisplay: React.FC = () => {
  const { panelId } = useParams<{ panelId: string }>()
  const { data, isLoading } = usePanelProducts(Number(panelId))
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Carregando painel...</p>
        </div>
      </div>
    )
  }
  
  const panel = data?.panel
  const products = data?.products || []
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{panel?.name}</h1>
              <p className="text-gray-600 capitalize">{panel?.department}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-gray-600">
                {currentTime.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">
              Nenhum produto encontrado neste painel
            </p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Sistema de Painéis TV - {products.length} produtos</span>
            <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">
            R$ {product.price?.toFixed(2)}
          </span>
          {product.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {product.category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

## 6. Testes e Validação

### 6.1 Checklist de Testes

**Funcionalidades Básicas:**
- [ ] Criação de painéis por departamento
- [ ] Edição e exclusão de painéis
- [ ] Associação de produtos a painéis
- [ ] Visualização de painéis TV
- [ ] Importação com detecção automática de categorias

**Compatibilidade:**
- [ ] Produtos existentes migrados corretamente
- [ ] Importação TXT/JSON mantém funcionamento
- [ ] Painel geral exibe todos os produtos (compatibilidade)

**Performance:**
- [ ] Carregamento rápido de painéis com muitos produtos
- [ ] Detecção de categorias em lote eficiente
- [ ] Interface responsiva em diferentes dispositivos

### 6.2 Script de Validação

```python
# validate_implementation.py
def validate_migration():
    """Valida se a migração foi bem-sucedida"""
    conn = sqlite3.connect('instance/paineltv.db')
    cursor = conn.cursor()
    
    # Verificar se todas as tabelas foram criadas
    tables = ['panels', 'categories', 'panel_products']
    for table in tables:
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
        if not cursor.fetchone():
            print(f"❌ Tabela {table} não encontrada")
            return False
    
    # Verificar se produtos foram migrados
    cursor.execute("SELECT COUNT(*) FROM products WHERE category_id IS NOT NULL")
    migrated_products = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]
    
    print(f"✅ {migrated_products}/{total_products} produtos migrados")
    
    # Verificar painéis criados
    cursor.execute("SELECT COUNT(*) FROM panels WHERE is_active = 1")
    active_panels = cursor.fetchone()[0]
    
    print(f"✅ {active_panels} painéis ativos")
    
    conn.close()
    return True

if __name__ == "__main__":
    validate_migration()
```

## 7. Documentação de Uso

### 7.1 Manual do Administrador

**Como criar um novo painel:**
1. Acesse Configurações → Painéis
2. Clique em "Novo Painel"
3. Preencha nome, departamento e descrição
4. Configure regras de produtos (automática ou manual)
5. Ative o painel

**Como importar produtos com categorização automática:**
1. Acesse Produtos → Importar
2. Faça upload do arquivo TXT/JSON
3. Revise as categorias detectadas automaticamente
4. Corrija manualmente se necessário
5. Confirme a importação

**Como exibir um painel na TV:**
1. Na tela principal, clique em "Ver Painel TV"
2. Selecione o painel desejado
3. O sistema abrirá a visualização em nova aba
4. Use modo fullscreen para melhor experiência

### 7.2 Troubleshooting

**Problema: Produtos não aparecem no painel**
- Verificar se o produto está ativo
- Confirmar se o produto está associado ao painel
- Verificar se o painel está ativo

**Problema: Categorização automática incorreta**
- Adicionar palavras-chave específicas na categoria
- Treinar o sistema com mais exemplos
- Usar categorização manual para casos específicos

**Problema: Performance lenta**
- Verificar quantidade de produtos por painel
- Otimizar imagens (tamanho e formato)
- Considerar paginação para muitos produtos

Este plano de implementação garante uma transição suave do sistema atual para o novo sistema de múltiplos painéis, mantendo compatibilidade total e adicionando funcionalidades avançadas de forma incremental.