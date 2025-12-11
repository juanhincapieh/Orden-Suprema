// Reports API Service - Supports both mock and real backend
import { api, USE_MOCK, getCurrentUserEmail } from './index';
import { Report } from '../../types';

// ============================================
// MOCK IMPLEMENTATION
// ============================================

const mockReportsService = {
  // Obtener todos los reportes
  getAll: async (): Promise<Report[]> => {
    const stored = localStorage.getItem('reports');
    return stored ? JSON.parse(stored) : [];
  },

  // Crear reporte
  create: async (report: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> => {
    const email = getCurrentUserEmail();
    if (!email) throw new Error('Not authenticated');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const newReport: Report = {
      id: Date.now().toString(),
      ...report,
      reporterEmail: email,
      reporterName: currentUser.nickname || email,
      status: 'pending',
      createdAt: new Date(),
    };
    
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.unshift(newReport);
    localStorage.setItem('reports', JSON.stringify(reports));
    
    return newReport;
  },

  // Actualizar reporte
  update: async (reportId: string, updates: Partial<Report>): Promise<Report> => {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const index = reports.findIndex((r: Report) => r.id === reportId);
    
    if (index === -1) {
      throw new Error('Report not found');
    }
    
    reports[index] = { ...reports[index], ...updates };
    localStorage.setItem('reports', JSON.stringify(reports));
    
    return reports[index];
  },

  // Eliminar reporte
  delete: async (reportId: string): Promise<void> => {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const filtered = reports.filter((r: Report) => r.id !== reportId);
    localStorage.setItem('reports', JSON.stringify(filtered));
  },

  // Penalizar reporte (marcar como resuelto)
  penalize: async (reportId: string): Promise<Report> => {
    return mockReportsService.update(reportId, { status: 'resolved' });
  },

  // Cancelar reporte
  cancel: async (reportId: string): Promise<Report> => {
    return mockReportsService.update(reportId, { status: 'cancelled' });
  },
};

// ============================================
// REAL API IMPLEMENTATION
// ============================================

const realReportsService = {
  getAll: async (): Promise<Report[]> => {
    const response = await api.get<{ reports: Report[] }>('/reports');
    return response.reports;
  },

  create: async (report: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> => {
    const response = await api.post<{ report: Report }>('/reports', report);
    return response.report;
  },

  update: async (reportId: string, updates: Partial<Report>): Promise<Report> => {
    const response = await api.put<{ report: Report }>(`/reports/${reportId}`, updates);
    return response.report;
  },

  delete: async (reportId: string): Promise<void> => {
    await api.delete(`/reports/${reportId}`);
  },

  penalize: async (reportId: string): Promise<Report> => {
    return realReportsService.update(reportId, { status: 'resolved' });
  },

  cancel: async (reportId: string): Promise<Report> => {
    return realReportsService.update(reportId, { status: 'cancelled' });
  },
};

// ============================================
// EXPORT
// ============================================

export const reportsApi = USE_MOCK ? mockReportsService : realReportsService;
export default reportsApi;
