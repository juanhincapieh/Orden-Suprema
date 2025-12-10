// Servicio API para Leaderboard
import api from '../apiService';

// Tipos
export interface LeaderboardEntry {
  rank: number;
  assassinId: string;
  nickname: string;
  rating: number;
  completedMissions: number;
  totalEarnings: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

// Servicio de leaderboard con API real
export const leaderboardApiService = {
  // Obtener clasificación
  getLeaderboard: async (params?: {
    period?: 'all_time' | 'monthly' | 'weekly';
    limit?: number;
  }): Promise<LeaderboardEntry[]> => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/leaderboard${query ? `?${query}` : ''}`;

    const response = await api.get<LeaderboardResponse>(endpoint);
    return response.leaderboard;
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

import { authService as legacyAuthService } from '../authService';

export const leaderboardMockService = {
  getLeaderboard: async (params?: {
    period?: 'all_time' | 'monthly' | 'weekly';
    limit?: number;
  }): Promise<LeaderboardEntry[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const assassins = legacyAuthService.getAllAssassins();
    const limit = params?.limit || 10;

    // Calcular stats para cada asesino
    const leaderboardData = assassins.map((assassin) => {
      const stats = legacyAuthService.calculateAssassinStats(assassin.email);

      return {
        assassinId: btoa(assassin.email),
        nickname: assassin.nickname,
        rating: stats.averageRatingAllTime || 4.5 + Math.random() * 0.5,
        completedMissions: stats.completedContracts || Math.floor(Math.random() * 50),
        totalEarnings: stats.totalEarnings || Math.floor(Math.random() * 500000),
      };
    });

    // Ordenar por rating y completedMissions
    leaderboardData.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.completedMissions - a.completedMissions;
    });

    // Agregar rank y limitar
    return leaderboardData.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
};

// Exportar servicio según modo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;
export const leaderboardService = USE_MOCK ? leaderboardMockService : leaderboardApiService;

export default leaderboardService;
