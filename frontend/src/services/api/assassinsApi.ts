// Servicio API para Asesinos y Perfiles
import api from '../apiService';
import { User, AssassinProfile, AssassinStats, Assassin } from '../../types';

// Tipos de respuesta
export interface AssassinsResponse {
  assassins: Assassin[];
}

export interface AssassinProfilesResponse {
  profiles: (AssassinProfile & { stats: AssassinStats })[];
}

export interface AssassinProfileResponse {
  profile: AssassinProfile & { stats: AssassinStats };
}

export interface UpdateProfileData {
  name?: string;
  nickname?: string;
  email?: string;
  minContractValue?: number;
  specialties?: string[];
  status?: 'available' | 'busy' | 'inactive';
}

// Servicio de asesinos con API real
export const assassinsApiService = {
  // Obtener todos los asesinos (básico)
  getAllAssassins: async (): Promise<Assassin[]> => {
    const response = await api.get<AssassinsResponse>('/users/assassins/public');
    return response.assassins;
  },

  // Obtener todos los perfiles de asesinos (con stats)
  getAllProfiles: async (): Promise<(AssassinProfile & { stats: AssassinStats })[]> => {
    const response = await api.get<AssassinProfilesResponse>('/assassin-profiles');
    return response.profiles;
  },

  // Obtener perfil de un asesino específico
  getProfile: async (email: string): Promise<AssassinProfile & { stats: AssassinStats }> => {
    const response = await api.get<AssassinProfileResponse>(`/assassin-profiles/${encodeURIComponent(email)}`);
    return response.profile;
  },

  // Actualizar perfil de asesino
  updateProfile: async (email: string, data: UpdateProfileData): Promise<AssassinProfile> => {
    const response = await api.put<AssassinProfileResponse>(
      `/assassin-profiles/${encodeURIComponent(email)}`,
      data
    );
    return response.profile;
  },

  // Obtener estadísticas de un asesino
  getStats: async (email: string): Promise<AssassinStats> => {
    const response = await api.get<{ stats: AssassinStats }>(`/assassin-profiles/${encodeURIComponent(email)}/stats`);
    return response.stats;
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

import { authService as legacyAuthService } from '../authService';
import { assassinProfileService as legacyProfileService } from '../assassinProfileService';

// Helper para convertir User a Assassin
const userToAssassin = (user: User): Assassin => {
  const baseLatBogota = 4.6097;
  const baseLngBogota = -74.0817;
  const randomOffset = () => (Math.random() - 0.5) * 0.1;

  return {
    id: btoa(user.email),
    name: user.nickname || user.email.split('@')[0],
    email: user.email,
    rating: 4.5 + Math.random() * 0.5,
    completedContracts: Math.floor(Math.random() * 100) + 20,
    location: {
      lat: baseLatBogota + randomOffset(),
      lng: baseLngBogota + randomOffset(),
    },
    status: Math.random() > 0.3 ? 'available' : 'busy',
  };
};

export const assassinsMockService = {
  getAllAssassins: async (): Promise<Assassin[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const users = legacyAuthService.getAllAssassins();
    return users.map(userToAssassin);
  },

  getAllProfiles: async (): Promise<(AssassinProfile & { stats: AssassinStats })[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Migrar usuarios existentes si es necesario
    legacyProfileService.migrateExistingUsers();

    const profiles = legacyProfileService.getAllProfiles();

    return profiles.map((profile) => {
      const stats = legacyAuthService.calculateAssassinStats(profile.email);
      return { ...profile, stats };
    });
  },

  getProfile: async (email: string): Promise<AssassinProfile & { stats: AssassinStats }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const profile = legacyProfileService.getProfile(email);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const stats = legacyAuthService.calculateAssassinStats(email);
    return { ...profile, stats };
  },

  updateProfile: async (email: string, data: UpdateProfileData): Promise<AssassinProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = legacyProfileService.updateProfile(email, data);
    if (!result.success) {
      throw new Error(result.error || 'Update failed');
    }

    const updatedProfile = legacyProfileService.getProfile(data.email || email);
    if (!updatedProfile) {
      throw new Error('Profile not found after update');
    }

    return updatedProfile;
  },

  getStats: async (email: string): Promise<AssassinStats> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return legacyAuthService.calculateAssassinStats(email);
  },
};

// Exportar servicio según modo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;
export const assassinsService = USE_MOCK ? assassinsMockService : assassinsApiService;

export default assassinsService;
