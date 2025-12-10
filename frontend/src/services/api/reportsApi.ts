// Servicio API para Reportes
import api from '../apiService';
import { Report } from '../../types';

// Tipos de respuesta
export interface ReportsResponse {
  reports: Report[];
}

export interface ReportResponse {
  report: Report;
}

export interface CreateReportData {
  contractId: string;
  description: string;
}

// Servicio de reportes con API real
export const reportsApiService = {
  // Obtener todos los reportes (admin)
  getReports: async (): Promise<Report[]> => {
    const response = await api.get<ReportsResponse>('/reports');
    return response.reports;
  },

  // Crear reporte
  createReport: async (data: CreateReportData): Promise<Report> => {
    const response = await api.post<ReportResponse>('/reports', data);
    return response.report;
  },

  // Resolver reporte (penalizar)
  resolveReport: async (reportId: string): Promise<void> => {
    await api.put(`/reports/${reportId}/resolve`);
  },

  // Cancelar reporte
  cancelReport: async (reportId: string): Promise<void> => {
    await api.put(`/reports/${reportId}/cancel`);
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

import { authService as legacyAuthService } from '../authService';

export const reportsMockService = {
  getReports: async (): Promise<Report[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return legacyAuthService.getReports();
  },

  createReport: async (data: CreateReportData): Promise<Report> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Obtener título de la misión
    const mission = legacyAuthService.getMissionById(data.contractId);
    const contractTitle = mission?.title || 'Unknown Mission';

    const report: Report = {
      id: Date.now().toString(),
      contractId: data.contractId,
      contractTitle,
      reporterEmail: currentUser.email,
      reporterName: currentUser.nickname,
      description: data.description,
      status: 'pending',
      createdAt: new Date(),
    };

    legacyAuthService.addReport(report);
    return report;
  },

  resolveReport: async (reportId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    legacyAuthService.updateReport(reportId, { status: 'resolved' });
  },

  cancelReport: async (reportId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    legacyAuthService.updateReport(reportId, { status: 'cancelled' });
  },
};

// Exportar servicio según modo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;
export const reportsService = USE_MOCK ? reportsMockService : reportsApiService;

export default reportsService;
