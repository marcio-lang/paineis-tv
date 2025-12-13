import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateDepartmentModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#3B82F6',
    keywords: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
      };
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Departamento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Departamento *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Açougue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: ACG"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrição do departamento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor do Departamento
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Palavras-chave para Categorização Automática
            </label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: carne, frango, peixe (separadas por vírgula)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Produtos com essas palavras no nome serão automaticamente categorizados neste departamento
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Departamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartmentModal;