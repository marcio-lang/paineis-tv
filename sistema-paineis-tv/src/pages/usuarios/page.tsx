import React, { useState, useEffect } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Table } from '../../components/base/Table';
import { Badge } from '../../components/base/Badge';
import { Modal } from '../../components/base/Modal';
import { Input } from '../../components/base/Input';
import { Plus, Eye, Edit, Trash2, User, Shield, Users, Search, UserPlus, UserX } from 'lucide-react';
import { userService, type CreateUserForm, type UpdateUserForm } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import type { User as UserType } from '../../types';
import { ContainerLayout } from '../../components/layout/Layout';

const UsuariosPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const { user: currentUser } = useAuth();

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(1, 100, searchTerm);
      const userData = response?.data || response || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      setUsers([]); // Garantir que users seja sempre um array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  // Criar usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await userService.createUser(formData);
      toast.success('Usuário criado com sucesso!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        active: true
      });
      await loadUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário';
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Editar usuário
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);

    try {
      const updateData: UpdateUserForm = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        active: formData.active
      };

      // Só incluir senha se foi preenchida
      if (formData.password) {
        updateData.password = formData.password;
      }

      await userService.updateUser(selectedUser.id, updateData);
      toast.success('Usuário atualizado com sucesso!');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        active: true
      });
      await loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Deletar usuário
  const handleDeleteUser = async (user: UserType) => {
    if (user.id === currentUser?.id) {
      toast.error('Você não pode deletar sua própria conta');
      return;
    }

    if (window.confirm(`Tem certeza que deseja deletar o usuário ${user.name}?`)) {
      try {
        await userService.deleteUser(user.id);
        toast.success('Usuário deletado com sucesso!');
        await loadUsers();
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar usuário';
        toast.error(errorMessage);
      }
    }
  };

  // Alternar status do usuário
  const handleToggleUserStatus = async (user: UserType) => {
    if (user.id === currentUser?.id) {
      toast.error('Você não pode alterar o status da sua própria conta');
      return;
    }

    try {
      await userService.toggleUserStatus(user.id, !user.active);
      toast.success(`Usuário ${!user.active ? 'ativado' : 'desativado'} com sucesso!`);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status do usuário';
      toast.error(errorMessage);
    }
  };

  // Abrir modal de edição
  const openEditModal = (user: UserType) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active
    });
    setShowEditModal(true);
  };

  const getPapelIcon = (papel: string) => {
    return papel === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const getPapelVariant = (papel: string) => {
    return papel === 'admin' ? 'destructive' : 'secondary';
  };

  const columns = [
    {
      key: 'usuario',
      label: 'Usuário',
      render: (usuario: UserType) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {usuario.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{usuario.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{usuario.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'papel',
      label: 'Papel',
      render: (usuario: UserType) => (
        <Badge variant={getPapelVariant(usuario.role)} className="flex items-center gap-1 w-fit">
          {getPapelIcon(usuario.role)}
          {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (usuario: UserType) => (
        <Badge variant={usuario.active ? 'success' : 'secondary'}>
          {usuario.active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Cadastrado em',
      render: (usuario: UserType) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (usuario: UserType) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => openEditModal(usuario)}
            title="Editar usuário"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleToggleUserStatus(usuario)}
            disabled={usuario.id === currentUser?.id}
            title={usuario.active ? 'Desativar usuário' : 'Ativar usuário'}
          >
            {usuario.active ? <UserX className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDeleteUser(usuario)}
            disabled={usuario.id === currentUser?.id}
            title="Deletar usuário"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const usuariosAtivos = (users || []).filter(u => u.active).length;
  const administradores = (users || []).filter(u => u.role === 'admin').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <ContainerLayout animation="fade">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Usuários
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {(users || []).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Usuários Ativos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {usuariosAtivos}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Administradores
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {administradores}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Usuários Cadastrados
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {(users || []).length} usuários encontrados
              </div>
            </div>
          </div>
          
          <Table
            data={users || []}
            columns={columns}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: (users || []).length,
              itemsPerPage: 10
            }}
          />
        </div>
      </Card>

      {/* Modal Criar Usuário */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Novo Usuário"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Senha do usuário"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Papel
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Usuário ativo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Usuário */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Usuário"
      >
        <form onSubmit={handleEditUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nova Senha (deixe em branco para manter a atual)
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Nova senha (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Papel
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Usuário ativo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </ContainerLayout>
  );
};

export default UsuariosPage;