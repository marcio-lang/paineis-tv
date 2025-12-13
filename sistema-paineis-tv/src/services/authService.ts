import { api } from './api';
import type { User, LoginForm, RegisterForm, ApiResponse } from '../types';

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export const authService = {
  // Login
  async login(credentials: LoginForm): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro no login');
    }

    // Salvar token e usuário no localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  },

  // Registro
  async register(userData: RegisterForm): Promise<RegisterResponse> {
    const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register', userData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro no registro');
    }

    // Salvar token e usuário no localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Mesmo se der erro no servidor, limpar dados locais
      console.warn('Erro ao fazer logout no servidor:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Verificar token
  async verifyToken(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/verify');
    
    if (!response.success || !response.data) {
      throw new Error('Token inválido');
    }

    return response.data;
  },

  // Esqueci a senha
  async forgotPassword(email: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>('/auth/forgot-password', { email });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao enviar email de recuperação');
    }
  },

  // Resetar senha
  async resetPassword(token: string, password: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      password
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao resetar senha');
    }
  },

  // Verificar email
  async verifyEmail(token: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>('/auth/verify-email', { token });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao verificar email');
    }
  },

  // Reenviar verificação de email
  async resendVerification(email: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>('/auth/resend-verification', { email });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao reenviar verificação');
    }
  },

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao alterar senha');
    }
  },

  // Atualizar perfil
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/profile', userData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao atualizar perfil');
    }

    // Atualizar dados do usuário no localStorage
    localStorage.setItem('user', JSON.stringify(response.data));

    return response.data;
  },

  // Obter perfil atual
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao obter perfil');
    }

    return response.data;
  }
};