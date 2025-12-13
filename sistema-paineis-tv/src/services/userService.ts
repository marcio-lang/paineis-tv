import { api } from './api';
import type { User, ApiResponse } from '../types';

export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  active?: boolean;
}

export interface UpdateUserForm {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  active?: boolean;
}

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  per_page: number;
}

export const userService = {
  // Listar usuários
  async getUsers(page = 1, perPage = 10, search = ''): Promise<UsersListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(search && { search })
    });

    const response = await api.get<ApiResponse<UsersListResponse>>(`/users?${params}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao carregar usuários');
    }

    return response.data;
  },

  // Obter usuário por ID
  async getUser(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao carregar usuário');
    }

    return response.data;
  },

  // Criar usuário
  async createUser(userData: CreateUserForm): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', userData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao criar usuário');
    }

    return response.data;
  },

  // Atualizar usuário
  async updateUser(id: string, userData: UpdateUserForm): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao atualizar usuário');
    }

    return response.data;
  },

  // Deletar usuário
  async deleteUser(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao deletar usuário');
    }
  },

  // Ativar/Desativar usuário
  async toggleUserStatus(id: string, active: boolean): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, { active });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao alterar status do usuário');
    }

    return response.data;
  }
};