// Servicio API para Misiones
import api from '../apiService';
import { Contract, Negotiation, Review } from '../../types';

// Tipos de respuesta
export interface MissionsResponse {
  missions: Contract[];
}

export interface MissionResponse {
  mission: Contract;
}

export interface CreateMissionData {
  title: string;
  description: string;
  reward: number;
  location?: string;
  deadline?: string;
  isPrivate?: boolean;
  targetAssassinId?: string;
}

export interface UpdateMissionData {
  title?: string;
  description?: string;
  reward?: number;
  status?: Contract['status'];
  location?: string;
  deadline?: string;
}

export interface NegotiationData {
  proposedReward: number;
  message: string;
}

export interface ReviewData {
  rating: number;
  comment: string;
}

// Servicio de misiones con API real
export const missionsApiService = {
  // Obtener misiones públicas
  getPublicMissions: async (params?: {
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Contract[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    const endpoint = `/missions${query ? `?${query}` : ''}`;

    const response = await api.get<MissionsResponse>(endpoint);
    return response.missions;
  },

  // Obtener misiones del usuario (contratista)
  getUserMissions: async (): Promise<Contract[]> => {
    const response = await api.get<MissionsResponse>('/missions/user');
    return response.missions;
  },

  // Obtener misiones asignadas (asesino)
  getAssignedMissions: async (status?: 'active' | 'completed'): Promise<Contract[]> => {
    const endpoint = status ? `/missions/assigned?status=${status}` : '/missions/assigned';
    const response = await api.get<MissionsResponse>(endpoint);
    return response.missions;
  },

  // Obtener misiones disponibles para asignar (admin)
  getAvailableMissions: async (): Promise<Contract[]> => {
    const response = await api.get<MissionsResponse>('/missions/available');
    return response.missions;
  },

  // Obtener detalle de una misión
  getMissionById: async (missionId: string): Promise<Contract> => {
    const response = await api.get<MissionResponse>(`/missions/${missionId}`);
    return response.mission;
  },

  // Crear nueva misión
  createMission: async (data: CreateMissionData): Promise<{ mission: Contract; newBalance: number }> => {
    return api.post('/missions', data);
  },

  // Actualizar misión
  updateMission: async (missionId: string, data: UpdateMissionData): Promise<Contract> => {
    const response = await api.put<MissionResponse>(`/missions/${missionId}`, data);
    return response.mission;
  },

  // Asignar misión a un asesino
  assignMission: async (missionId: string, assassinId: string): Promise<Contract> => {
    const response = await api.post<MissionResponse>(`/missions/${missionId}/assign`, { assassinId });
    return response.mission;
  },

  // Completar misión
  completeMission: async (missionId: string): Promise<{ mission: Contract; reward: number; newBalance: number }> => {
    return api.post(`/missions/${missionId}/complete`);
  },

  // Cancelar/eliminar misión
  deleteMission: async (missionId: string): Promise<void> => {
    await api.delete(`/missions/${missionId}`);
  },

  // Proponer negociación
  proposeNegotiation: async (missionId: string, data: NegotiationData): Promise<Negotiation> => {
    const response = await api.post<{ negotiation: Negotiation }>(`/missions/${missionId}/negotiate`, data);
    return response.negotiation;
  },

  // Aceptar negociación
  acceptNegotiation: async (negotiationId: string): Promise<Contract> => {
    const response = await api.put<MissionResponse>(`/negotiations/${negotiationId}/accept`);
    return response.mission;
  },

  // Rechazar negociación
  rejectNegotiation: async (negotiationId: string): Promise<void> => {
    await api.put(`/negotiations/${negotiationId}/reject`);
  },

  // Crear/actualizar reseña
  submitReview: async (missionId: string, data: ReviewData): Promise<Review> => {
    const response = await api.post<{ review: Review }>(`/missions/${missionId}/review`, data);
    return response.review;
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

import { authService as legacyAuthService } from '../authService';

export const missionsMockService = {
  getPublicMissions: async (): Promise<Contract[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return legacyAuthService.getPublicMissions();
  },

  getUserMissions: async (): Promise<Contract[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return legacyAuthService.getUserMissions(currentUser.email);
  },

  getAssignedMissions: async (status?: 'active' | 'completed'): Promise<Contract[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const encodedEmail = btoa(currentUser.email);

    const publicMissions = legacyAuthService.getPublicMissions();
    const allMissions = legacyAuthService.getAllMissions();
    const combined = [...publicMissions, ...allMissions];

    return combined.filter((mission) => {
      if (mission.assassinId !== encodedEmail) return false;
      if (status === 'active') return !mission.terminado && mission.status !== 'completed';
      if (status === 'completed') return mission.terminado || mission.status === 'completed';
      return true;
    });
  },

  getAvailableMissions: async (): Promise<Contract[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const publicMissions = legacyAuthService.getPublicMissions();
    const allMissions = legacyAuthService.getAllMissions();

    const missionMap = new Map<string, Contract>();
    [...allMissions, ...publicMissions].forEach((m) => {
      if (!missionMap.has(m.id)) missionMap.set(m.id, m);
    });

    return Array.from(missionMap.values()).filter(
      (m) => (m.status === 'open' || m.status === 'negotiating') && !m.assassinId && !m.terminado
    );
  },

  getMissionById: async (missionId: string): Promise<Contract> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const mission = legacyAuthService.getMissionById(missionId);
    if (!mission) throw new Error('Mission not found');
    return mission;
  },

  createMission: async (data: CreateMissionData): Promise<{ mission: Contract; newBalance: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const mission: Contract = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      reward: data.reward,
      status: 'open',
      terminado: false,
      contractorId: btoa(currentUser.email),
      createdAt: new Date(),
      updatedAt: new Date(),
      isPrivate: data.isPrivate,
      targetAssassinId: data.targetAssassinId,
      location: data.location,
      deadline: data.deadline,
    };

    legacyAuthService.updateCoins(currentUser.email, -data.reward);

    if (data.isPrivate) {
      legacyAuthService.addMission(currentUser.email, mission);
    } else {
      legacyAuthService.addPublicMission(mission);
    }

    const newBalance = legacyAuthService.getCoins(currentUser.email);
    return { mission, newBalance };
  },

  updateMission: async (missionId: string, data: UpdateMissionData): Promise<Contract> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    legacyAuthService.updateMission(currentUser.email, missionId, data);
    legacyAuthService.updatePublicMission(missionId, data);

    return legacyAuthService.getMissionById(missionId)!;
  },

  assignMission: async (missionId: string, assassinId: string): Promise<Contract> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    const assassinEmail = atob(assassinId);
    const assassinName = nicknames[assassinEmail] || assassinEmail;

    const updateData = {
      assassinId,
      assassinName,
      status: 'in_progress' as const,
      updatedAt: new Date().toISOString(),
    };

    legacyAuthService.updatePublicMission(missionId, updateData);

    return legacyAuthService.getMissionById(missionId)!;
  },

  completeMission: async (missionId: string): Promise<{ mission: Contract; reward: number; newBalance: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const mission = legacyAuthService.getMissionById(missionId)!;

    const updateData = {
      status: 'completed' as const,
      terminado: true,
      updatedAt: new Date().toISOString(),
    };

    legacyAuthService.updatePublicMission(missionId, updateData);
    legacyAuthService.updateCoins(currentUser.email, mission.reward);

    const newBalance = legacyAuthService.getCoins(currentUser.email);
    return { mission: { ...mission, ...updateData }, reward: mission.reward, newBalance };
  },

  deleteMission: async (missionId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    legacyAuthService.deleteMission(currentUser.email, missionId);
    legacyAuthService.deletePublicMission(missionId);
  },

  proposeNegotiation: async (missionId: string, data: NegotiationData): Promise<Negotiation> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const negotiation: Negotiation = {
      id: `neg_${Date.now()}`,
      contractId: missionId,
      proposedBy: currentUser.role === 'contractor' ? 'contractor' : 'assassin',
      proposedByEmail: currentUser.email,
      proposedByName: currentUser.nickname,
      proposedReward: data.proposedReward,
      message: data.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    legacyAuthService.addNegotiation(negotiation);
    legacyAuthService.updatePublicMission(missionId, { status: 'negotiating', negotiation });

    return negotiation;
  },

  acceptNegotiation: async (negotiationId: string): Promise<Contract> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const negotiations = JSON.parse(localStorage.getItem('negotiations') || '[]');
    const negotiation = negotiations.find((n: Negotiation) => n.id === negotiationId);

    if (!negotiation) throw new Error('Negotiation not found');

    legacyAuthService.updateNegotiation(negotiationId, { status: 'accepted' });

    const updateData = {
      reward: negotiation.proposedReward,
      status: 'in_progress' as const,
      assassinId: btoa(negotiation.proposedByEmail),
      assassinName: negotiation.proposedByName,
      negotiation: undefined,
    };

    legacyAuthService.updatePublicMission(negotiation.contractId, updateData);

    return legacyAuthService.getMissionById(negotiation.contractId)!;
  },

  rejectNegotiation: async (negotiationId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    legacyAuthService.updateNegotiation(negotiationId, { status: 'rejected' });
  },

  submitReview: async (missionId: string, data: ReviewData): Promise<Review> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const review: Review = {
      id: `review_${Date.now()}`,
      contractId: missionId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date(),
    };

    legacyAuthService.updateMission(currentUser.email, missionId, { review });
    legacyAuthService.updatePublicMission(missionId, { review });

    return review;
  },
};

// Exportar servicio según modo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;
export const missionsService = USE_MOCK ? missionsMockService : missionsApiService;

export default missionsService;
