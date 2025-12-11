// Missions API Service - Supports both mock and real backend
import { api, USE_MOCK, getCurrentUserEmail } from './index';
import { Contract, Negotiation } from '../../types';

// ============================================
// MOCK IMPLEMENTATION
// ============================================

const mockMissionsService = {
  // Obtener misiones públicas
  getPublicMissions: async (): Promise<Contract[]> => {
    const stored = localStorage.getItem('publicMissions');
    return stored ? JSON.parse(stored) : [];
  },

  // Obtener misiones del usuario (contratista)
  getUserMissions: async (): Promise<Contract[]> => {
    const email = getCurrentUserEmail();
    if (!email) return [];
    
    const stored = localStorage.getItem('userMissions');
    const dict = stored ? JSON.parse(stored) : {};
    return dict[email] || [];
  },

  // Obtener misiones asignadas (asesino)
  getAssignedMissions: async (status?: 'active' | 'completed'): Promise<Contract[]> => {
    const email = getCurrentUserEmail();
    if (!email) return [];
    
    const encodedEmail = btoa(email);
    
    // Combinar misiones públicas y privadas
    const publicMissions = JSON.parse(localStorage.getItem('publicMissions') || '[]');
    const userMissionsDict = JSON.parse(localStorage.getItem('userMissions') || '{}');
    
    const allMissions: Contract[] = [...publicMissions];
    Object.values(userMissionsDict).forEach((missions: any) => {
      if (Array.isArray(missions)) {
        allMissions.push(...missions);
      }
    });
    
    // Filtrar por asesino
    let filtered = allMissions.filter((m: any) => m.assassinId === encodedEmail);
    
    if (status === 'active') {
      filtered = filtered.filter((m: any) => !m.terminado && m.status !== 'completed');
    } else if (status === 'completed') {
      filtered = filtered.filter((m: any) => m.terminado || m.status === 'completed');
    }
    
    return filtered;
  },

  // Obtener misión por ID
  getMissionById: async (missionId: string): Promise<Contract | null> => {
    const publicMissions = JSON.parse(localStorage.getItem('publicMissions') || '[]');
    const found = publicMissions.find((m: any) => m.id === missionId);
    if (found) return found;
    
    const userMissionsDict = JSON.parse(localStorage.getItem('userMissions') || '{}');
    for (const missions of Object.values(userMissionsDict) as any[]) {
      const mission = missions.find((m: any) => m.id === missionId);
      if (mission) return mission;
    }
    
    return null;
  },

  // Crear misión
  createMission: async (mission: Partial<Contract>): Promise<Contract> => {
    const email = getCurrentUserEmail();
    if (!email) throw new Error('Not authenticated');
    
    const newMission: Contract = {
      id: Date.now().toString(),
      title: mission.title || '',
      description: mission.description || '',
      reward: mission.reward || 0,
      status: 'open',
      terminado: false,
      contractorId: btoa(email),
      createdAt: new Date(),
      updatedAt: new Date(),
      isPrivate: mission.isPrivate || false,
      location: mission.location,
      deadline: mission.deadline,
      targetAssassinId: mission.targetAssassinId,
    };
    
    if (mission.isPrivate) {
      const stored = localStorage.getItem('userMissions');
      const dict = stored ? JSON.parse(stored) : {};
      if (!dict[email]) dict[email] = [];
      dict[email].unshift(newMission);
      localStorage.setItem('userMissions', JSON.stringify(dict));
    } else {
      const stored = localStorage.getItem('publicMissions');
      const missions = stored ? JSON.parse(stored) : [];
      missions.unshift(newMission);
      localStorage.setItem('publicMissions', JSON.stringify(missions));
    }
    
    return newMission;
  },

  // Actualizar misión
  updateMission: async (missionId: string, updates: Partial<Contract>): Promise<Contract> => {
    // Buscar en misiones públicas
    const publicMissions = JSON.parse(localStorage.getItem('publicMissions') || '[]');
    const publicIndex = publicMissions.findIndex((m: any) => m.id === missionId);
    
    if (publicIndex !== -1) {
      publicMissions[publicIndex] = { ...publicMissions[publicIndex], ...updates, updatedAt: new Date() };
      localStorage.setItem('publicMissions', JSON.stringify(publicMissions));
      return publicMissions[publicIndex];
    }
    
    // Buscar en misiones privadas
    const userMissionsDict = JSON.parse(localStorage.getItem('userMissions') || '{}');
    for (const email of Object.keys(userMissionsDict)) {
      const missions = userMissionsDict[email];
      const index = missions.findIndex((m: any) => m.id === missionId);
      if (index !== -1) {
        userMissionsDict[email][index] = { ...missions[index], ...updates, updatedAt: new Date() };
        localStorage.setItem('userMissions', JSON.stringify(userMissionsDict));
        return userMissionsDict[email][index];
      }
    }
    
    throw new Error('Mission not found');
  },

  // Asignar misión
  assignMission: async (missionId: string, assassinId: string, sendNotificationOnly?: boolean): Promise<any> => {
    if (sendNotificationOnly) {
      // Solo enviar notificación (implementado en notificationsApi)
      return { notificationSent: true };
    }
    
    return mockMissionsService.updateMission(missionId, {
      assassinId,
      status: 'in_progress',
    });
  },

  // Completar misión
  completeMission: async (missionId: string): Promise<Contract> => {
    return mockMissionsService.updateMission(missionId, {
      status: 'completed',
      terminado: true,
    });
  },

  // Eliminar misión
  deleteMission: async (missionId: string): Promise<void> => {
    // Buscar en misiones públicas
    const publicMissions = JSON.parse(localStorage.getItem('publicMissions') || '[]');
    const publicIndex = publicMissions.findIndex((m: any) => m.id === missionId);
    
    if (publicIndex !== -1) {
      publicMissions.splice(publicIndex, 1);
      localStorage.setItem('publicMissions', JSON.stringify(publicMissions));
      return;
    }
    
    // Buscar en misiones privadas
    const userMissionsDict = JSON.parse(localStorage.getItem('userMissions') || '{}');
    for (const email of Object.keys(userMissionsDict)) {
      const missions = userMissionsDict[email];
      const index = missions.findIndex((m: any) => m.id === missionId);
      if (index !== -1) {
        userMissionsDict[email].splice(index, 1);
        localStorage.setItem('userMissions', JSON.stringify(userMissionsDict));
        return;
      }
    }
  },

  // Crear negociación
  createNegotiation: async (missionId: string, negotiation: Partial<Negotiation>): Promise<Negotiation> => {
    const stored = localStorage.getItem('negotiations');
    const negotiations = stored ? JSON.parse(stored) : [];
    
    const newNegotiation: Negotiation = {
      id: Date.now().toString(),
      contractId: missionId,
      proposedBy: negotiation.proposedBy || 'assassin',
      proposedByEmail: negotiation.proposedByEmail || '',
      proposedByName: negotiation.proposedByName || '',
      proposedReward: negotiation.proposedReward || 0,
      message: negotiation.message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    negotiations.unshift(newNegotiation);
    localStorage.setItem('negotiations', JSON.stringify(negotiations));
    
    // Actualizar misión con la negociación
    await mockMissionsService.updateMission(missionId, {
      status: 'negotiating',
      negotiation: newNegotiation,
    });
    
    return newNegotiation;
  },
};

// ============================================
// REAL API IMPLEMENTATION
// ============================================

const realMissionsService = {
  getPublicMissions: async (): Promise<Contract[]> => {
    const response = await api.get<{ missions: Contract[] }>('/missions');
    return response.missions;
  },

  getUserMissions: async (): Promise<Contract[]> => {
    const response = await api.get<{ missions: Contract[] }>('/missions/user');
    return response.missions;
  },

  getAssignedMissions: async (status?: 'active' | 'completed'): Promise<Contract[]> => {
    const query = status ? `?status=${status}` : '';
    const response = await api.get<{ missions: Contract[] }>(`/missions/assigned${query}`);
    return response.missions;
  },

  getMissionById: async (missionId: string): Promise<Contract | null> => {
    try {
      const response = await api.get<{ mission: Contract }>(`/missions/${missionId}`);
      return response.mission;
    } catch {
      return null;
    }
  },

  createMission: async (mission: Partial<Contract>): Promise<Contract> => {
    const response = await api.post<{ mission: Contract }>('/missions', mission);
    return response.mission;
  },

  updateMission: async (missionId: string, updates: Partial<Contract>): Promise<Contract> => {
    const response = await api.put<{ mission: Contract }>(`/missions/${missionId}`, updates);
    return response.mission;
  },

  assignMission: async (missionId: string, assassinId: string, sendNotificationOnly?: boolean): Promise<any> => {
    const response = await api.post<any>(`/missions/${missionId}/assign`, {
      assassinId,
      sendNotificationOnly,
    });
    return response;
  },

  completeMission: async (missionId: string): Promise<Contract> => {
    const response = await api.post<{ mission: Contract }>(`/missions/${missionId}/complete`);
    return response.mission;
  },

  deleteMission: async (missionId: string): Promise<void> => {
    await api.delete(`/missions/${missionId}`);
  },

  createNegotiation: async (missionId: string, negotiation: Partial<Negotiation>): Promise<Negotiation> => {
    const response = await api.post<{ negotiation: Negotiation }>(`/missions/${missionId}/negotiate`, negotiation);
    return response.negotiation;
  },
};

// ============================================
// EXPORT
// ============================================

export const missionsApi = USE_MOCK ? mockMissionsService : realMissionsService;
export default missionsApi;
