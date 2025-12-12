// Users API Service - Supports both mock and real backend
import { api } from './index';
import { USE_MOCK } from './config';
import { User, AssassinProfile } from '../../types';

export interface AssassinStats {
  averageRatingAllTime: number;
  averageRatingLastMonth: number;
  completedContracts: number;
  totalEarnings: number;
  activeContracts: number;
}

export interface AssassinWithStats {
  id: string;
  email: string;
  name: string;
  nickname: string;
  rating: number;
  averageRatingAllTime: number;
  averageRatingLastMonth: number;
  completedContracts: number;
  totalEarnings: number;
  activeContracts: number;
  status: 'available' | 'busy' | 'inactive';
  location?: { lat: number; lng: number };
  specialties: string[];
  minContractValue: number;
}

// ============================================
// MOCK IMPLEMENTATION
// ============================================

// Calcular estadísticas de asesino desde localStorage
const calculateAssassinStats = (email: string): AssassinStats => {
  const encodedEmail = btoa(email);
  
  // Obtener todas las misiones
  const publicMissions = JSON.parse(localStorage.getItem('publicMissions') || '[]');
  const userMissionsDict = JSON.parse(localStorage.getItem('userMissions') || '{}');
  
  const allMissions: any[] = [...publicMissions];
  Object.values(userMissionsDict).forEach((missions: any) => {
    if (Array.isArray(missions)) {
      allMissions.push(...missions);
    }
  });
  
  // Filtrar misiones del asesino
  const assassinMissions = allMissions.filter((m: any) => m.assassinId === encodedEmail);
  const completedMissions = assassinMissions.filter((m: any) => m.terminado || m.status === 'completed');
  const activeMissions = assassinMissions.filter((m: any) => 
    !m.terminado && (m.status === 'in_progress' || m.status === 'in-progress')
  );
  
  // Calcular rating
  const missionsWithReview = completedMissions.filter((m: any) => m.review && m.review.rating);
  const avgRating = missionsWithReview.length > 0
    ? missionsWithReview.reduce((sum: number, m: any) => sum + m.review.rating, 0) / missionsWithReview.length
    : 0;
  
  // Rating último mes
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  const recentMissionsWithReview = missionsWithReview.filter((m: any) => {
    const date = new Date(m.updatedAt || m.createdAt);
    return date >= monthAgo;
  });
  
  const avgRatingLastMonth = recentMissionsWithReview.length > 0
    ? recentMissionsWithReview.reduce((sum: number, m: any) => sum + m.review.rating, 0) / recentMissionsWithReview.length
    : 0;
  
  const totalEarnings = completedMissions.reduce((sum: number, m: any) => sum + (m.reward || 0), 0);
  
  return {
    averageRatingAllTime: Math.round(avgRating * 10) / 10,
    averageRatingLastMonth: Math.round(avgRatingLastMonth * 10) / 10,
    completedContracts: completedMissions.length,
    totalEarnings,
    activeContracts: activeMissions.length,
  };
};

const mockUsersService = {
  // Obtener todos los usuarios (admin)
  getAllUsers: async (): Promise<User[]> => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const roles = JSON.parse(localStorage.getItem('roles') || '{}');
    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    const coins = JSON.parse(localStorage.getItem('coins') || '{}');
    
    return Object.keys(users).map(email => ({
      id: btoa(email),
      email,
      name: nicknames[email] || email.split('@')[0],
      nickname: nicknames[email] || email.split('@')[0],
      role: roles[email] || 'contractor',
      coins: coins[email] || 0,
    }));
  },

  // Obtener todos los asesinos
  getAllAssassins: async (): Promise<AssassinWithStats[]> => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const roles = JSON.parse(localStorage.getItem('roles') || '{}');
    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    
    const assassinEmails = Object.keys(users).filter(email => roles[email] === 'assassin');
    
    return assassinEmails.map(email => {
      const stats = calculateAssassinStats(email);
      
      // Obtener ubicación si existe
      const locations = JSON.parse(localStorage.getItem('assassinLocations') || '{}');
      const profiles = JSON.parse(localStorage.getItem('assassinProfiles') || '{}');
      
      const location = locations[email] || profiles[email]?.location || null;
      
      return {
        id: btoa(email),
        email,
        name: nicknames[email] || email.split('@')[0],
        nickname: nicknames[email] || email.split('@')[0],
        rating: stats.averageRatingAllTime,
        averageRatingAllTime: stats.averageRatingAllTime,
        averageRatingLastMonth: stats.averageRatingLastMonth,
        completedContracts: stats.completedContracts,
        totalEarnings: stats.totalEarnings,
        activeContracts: stats.activeContracts,
        status: stats.activeContracts > 0 ? 'busy' as const : 'available' as const,
        location,
        specialties: profiles[email]?.specialties || ['Sigilo', 'Combate', 'Precisión'],
        minContractValue: profiles[email]?.minContractValue || 10000,
      };
    });
  },

  // Obtener estadísticas de un asesino
  getAssassinStats: async (userId: string): Promise<AssassinStats> => {
    try {
      const email = atob(userId);
      return calculateAssassinStats(email);
    } catch {
      return {
        averageRatingAllTime: 0,
        averageRatingLastMonth: 0,
        completedContracts: 0,
        totalEarnings: 0,
        activeContracts: 0,
      };
    }
  },

  // Suspender usuario
  suspendUser: async (userId: string): Promise<void> => {
    const suspended = JSON.parse(localStorage.getItem('suspendedUsers') || '[]');
    const email = atob(userId);
    if (!suspended.includes(email)) {
      suspended.push(email);
      localStorage.setItem('suspendedUsers', JSON.stringify(suspended));
    }
  },

  // Reactivar usuario
  unsuspendUser: async (userId: string): Promise<void> => {
    const suspended = JSON.parse(localStorage.getItem('suspendedUsers') || '[]');
    const email = atob(userId);
    const filtered = suspended.filter((e: string) => e !== email);
    localStorage.setItem('suspendedUsers', JSON.stringify(filtered));
  },

  // Eliminar usuario
  deleteUser: async (userId: string): Promise<void> => {
    const email = atob(userId);
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const roles = JSON.parse(localStorage.getItem('roles') || '{}');
    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    const coins = JSON.parse(localStorage.getItem('coins') || '{}');
    
    delete users[email];
    delete roles[email];
    delete nicknames[email];
    delete coins[email];
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('roles', JSON.stringify(roles));
    localStorage.setItem('nicknames', JSON.stringify(nicknames));
    localStorage.setItem('coins', JSON.stringify(coins));
  },

  // Actualizar perfil de asesino
  updateAssassinProfile: async (email: string, updates: Partial<AssassinProfile>): Promise<AssassinProfile> => {
    const profiles = JSON.parse(localStorage.getItem('assassinProfiles') || '{}');
    
    const existingProfile = profiles[email] || {
      id: btoa(email),
      email,
      name: email.split('@')[0],
      nickname: email.split('@')[0],
      minContractValue: 10000,
      specialties: [],
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    profiles[email] = updatedProfile;
    localStorage.setItem('assassinProfiles', JSON.stringify(profiles));
    
    // Actualizar nickname si cambió
    if (updates.nickname) {
      const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
      nicknames[email] = updates.nickname;
      localStorage.setItem('nicknames', JSON.stringify(nicknames));
    }
    
    return updatedProfile;
  },

  // Obtener perfil de asesino
  getAssassinProfile: async (email: string): Promise<AssassinProfile | null> => {
    const profiles = JSON.parse(localStorage.getItem('assassinProfiles') || '{}');
    return profiles[email] || null;
  },

  // Obtener ubicación del asesino
  getAssassinLocation: async (): Promise<{ lat: number; lng: number; address?: string; useAutoLocation: boolean } | null> => {
    const email = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).email : null;
    if (!email) return null;
    
    const locations = JSON.parse(localStorage.getItem('assassinLocations') || '{}');
    return locations[email] || null;
  },

  // Actualizar ubicación del asesino
  updateAssassinLocation: async (location: { lat: number; lng: number; address?: string; useAutoLocation: boolean }): Promise<void> => {
    const email = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).email : null;
    if (!email) throw new Error('Not authenticated');
    
    const locations = JSON.parse(localStorage.getItem('assassinLocations') || '{}');
    locations[email] = location;
    localStorage.setItem('assassinLocations', JSON.stringify(locations));
    
    // También actualizar el perfil
    const profiles = JSON.parse(localStorage.getItem('assassinProfiles') || '{}');
    if (!profiles[email]) profiles[email] = {};
    profiles[email].location = { lat: location.lat, lng: location.lng };
    profiles[email].address = location.address;
    profiles[email].useAutoLocation = location.useAutoLocation;
    localStorage.setItem('assassinProfiles', JSON.stringify(profiles));
  },
};

// ============================================
// REAL API IMPLEMENTATION
// ============================================

const realUsersService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>('/users');
    return response.users;
  },

  getAllAssassins: async (): Promise<AssassinWithStats[]> => {
    const response = await api.get<{ assassins: AssassinWithStats[] }>('/users/assassins');
    return response.assassins;
  },

  getAssassinStats: async (userId: string): Promise<AssassinStats> => {
    const response = await api.get<{ stats: AssassinStats }>(`/users/${userId}/stats`);
    return response.stats;
  },

  suspendUser: async (userId: string): Promise<void> => {
    await api.put(`/users/${userId}/suspend`);
  },

  unsuspendUser: async (userId: string): Promise<void> => {
    await api.put(`/users/${userId}/unsuspend`);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  updateAssassinProfile: async (email: string, updates: Partial<AssassinProfile>): Promise<AssassinProfile> => {
    const response = await api.put<{ profile: AssassinProfile }>(`/assassins/${email}`, updates);
    return response.profile;
  },

  getAssassinProfile: async (email: string): Promise<AssassinProfile | null> => {
    try {
      const response = await api.get<{ profile: AssassinProfile }>(`/assassins/${email}`);
      return response.profile;
    } catch {
      return null;
    }
  },

  // Obtener ubicación del asesino
  getAssassinLocation: async (): Promise<{ lat: number; lng: number; address?: string; useAutoLocation: boolean } | null> => {
    try {
      const response = await api.get<{ location: { lat: number; lng: number; address?: string; useAutoLocation: boolean } | null }>('/assassins/location');
      return response.location;
    } catch {
      return null;
    }
  },

  // Actualizar ubicación del asesino
  updateAssassinLocation: async (location: { lat: number; lng: number; address?: string; useAutoLocation: boolean }): Promise<void> => {
    await api.put('/assassins/location', location);
  },
};

// ============================================
// EXPORT
// ============================================

export const usersApi = USE_MOCK ? mockUsersService : realUsersService;
export default usersApi;
