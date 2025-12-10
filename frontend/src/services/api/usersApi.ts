// Servicio API para Usuarios (Admin)
import api from '../apiService';
import { User } from '../../types';

// Tipos de respuesta
export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}

// Servicio de usuarios con API real
export const usersApiService = {
  // Obtener todos los usuarios (admin)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<UsersResponse>('/users');
    return response.users;
  },

  // Obtener usuario por ID
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get<UserResponse>(`/users/${userId}`);
    return response.user;
  },

  // Actualizar rol de usuario
  updateUserRole: async (userId: string, role: 'admin' | 'contractor' | 'assassin'): Promise<void> => {
    await api.put(`/users/${userId}/role`, { role });
  },

  // Suspender usuario
  suspendUser: async (userId: string): Promise<void> => {
    await api.put(`/users/${userId}/suspend`);
  },

  // Reactivar usuario
  unsuspendUser: async (userId: string): Promise<void> => {
    await api.put(`/users/${userId}/unsuspend`);
  },

  // Eliminar usuario
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // Verificar si usuario está suspendido
  isUserSuspended: async (userId: string): Promise<boolean> => {
    const response = await api.get<{ suspended: boolean }>(`/users/${userId}/status`);
    return response.suspended;
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

import { authService as legacyAuthService } from '../authService';

export const usersMockService = {
  getAllUsers: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return legacyAuthService.getAllUsers();
  },

  getUserById: async (userId: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const users = legacyAuthService.getAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  },

  updateUserRole: async (userId: string, role: 'admin' | 'contractor' | 'assassin'): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const email = atob(userId);
    legacyAuthService.updateUserRole(email, role);
  },

  suspendUser: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const email = atob(userId);
    legacyAuthService.suspendUser(email);
  },

  unsuspendUser: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const email = atob(userId);
    legacyAuthService.unsuspendUser(email);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const email = atob(userId);
    legacyAuthService.deleteUser(email);
  },

  isUserSuspended: async (userId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const email = atob(userId);
    return legacyAuthService.isSuspended(email);
  },
};

// Exportar servicio según modo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;
export const usersService = USE_MOCK ? usersMockService : usersApiService;

export default usersService;
