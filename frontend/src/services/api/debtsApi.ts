// Servicio API para Sistema de Deudas (Favores)
import api from '../apiService';
import { Debt, DebtNotification, TargetStatus, debtService as legacyDebtService } from '../debtService';

// Re-exportar tipos
export type { Debt, DebtNotification, TargetStatus };

// Tipos de respuesta
export interface DebtsResponse {
  debtsIOwe: Debt[];
  debtsOwedToMe: Debt[];
}

export interface DebtResponse {
  debt: Debt;
}

export interface CreateFavorData {
  creditorEmail: string;
  description: string;
}

export interface PaymentRequestData {
  paymentDescription: string;
}

// Servicio de deudas con API real
export const debtsApiService = {
  // Obtener deudas del usuario
  getDebts: async (): Promise<DebtsResponse> => {
    return api.get<DebtsResponse>('/debts');
  },

  // Crear solicitud de favor
  createFavorRequest: async (data: CreateFavorData): Promise<Debt> => {
    const response = await api.post<DebtResponse>('/debts/favor-request', data);
    return response.debt;
  },

  // Aceptar solicitud de favor
  acceptFavorRequest: async (debtId: string): Promise<Debt> => {
    const response = await api.put<DebtResponse>(`/debts/${debtId}/accept`);
    return response.debt;
  },

  // Rechazar solicitud de favor
  rejectFavorRequest: async (debtId: string): Promise<void> => {
    await api.put(`/debts/${debtId}/reject`);
  },

  // Solicitar pago de deuda
  requestPayment: async (debtId: string, data: PaymentRequestData): Promise<Debt> => {
    const response = await api.post<DebtResponse>(`/debts/${debtId}/request-payment`, data);
    return response.debt;
  },

  // Aceptar solicitud de pago
  acceptPayment: async (debtId: string): Promise<Debt> => {
    const response = await api.put<DebtResponse>(`/debts/${debtId}/accept-payment`);
    return response.debt;
  },

  // Rechazar solicitud de pago (marca como objetivo)
  rejectPayment: async (debtId: string): Promise<TargetStatus> => {
    const response = await api.put<{ targetStatus: TargetStatus }>(`/debts/${debtId}/reject-payment`);
    return response.targetStatus;
  },

  // Marcar deuda como completada
  markAsCompleted: async (debtId: string): Promise<void> => {
    await api.post(`/debts/${debtId}/mark-completed`);
  },

  // Confirmar completación
  confirmCompletion: async (debtId: string): Promise<void> => {
    await api.put(`/debts/${debtId}/confirm-completion`);
  },

  // Rechazar completación
  rejectCompletion: async (debtId: string): Promise<void> => {
    await api.put(`/debts/${debtId}/reject-completion`);
  },

  // Verificar si es objetivo
  checkTargetStatus: async (): Promise<{ isTarget: boolean; targetInfo: TargetStatus | null }> => {
    return api.get('/targets');
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

export const debtsMockService = {
  getDebts: async (): Promise<DebtsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const encodedEmail = btoa(currentUser.email);

    return legacyDebtService.getDebtsForAssassin(encodedEmail);
  },

  createFavorRequest: async (data: CreateFavorData): Promise<Debt> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const debtorId = btoa(currentUser.email);
    const creditorId = btoa(data.creditorEmail);

    const lang = navigator.language.startsWith('es') ? 'es' : 'en';
    const result = legacyDebtService.createFavorRequest(debtorId, creditorId, data.description, lang);

    return result.debt;
  },

  acceptFavorRequest: async (debtId: string): Promise<Debt> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Buscar la notificación correspondiente
    const notifications = legacyDebtService.getNotificationsForAssassin(btoa(currentUser.email));
    const notification = notifications.find((n) => n.debtId === debtId);

    if (notification) {
      legacyDebtService.acceptFavorRequest(notification.id, debtId);
    }

    // Obtener deuda actualizada
    const debts = JSON.parse(localStorage.getItem('assassinDebts') || '[]');
    return debts.find((d: Debt) => d.id === debtId);
  },

  rejectFavorRequest: async (debtId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const notifications = legacyDebtService.getNotificationsForAssassin(btoa(currentUser.email));
    const notification = notifications.find((n) => n.debtId === debtId);

    if (notification) {
      legacyDebtService.rejectFavorRequest(notification.id, debtId);
    }
  },

  requestPayment: async (debtId: string, data: PaymentRequestData): Promise<Debt> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    legacyDebtService.requestPayment(debtId, data.paymentDescription);

    const debts = JSON.parse(localStorage.getItem('assassinDebts') || '[]');
    return debts.find((d: Debt) => d.id === debtId);
  },

  acceptPayment: async (debtId: string): Promise<Debt> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const notifications = legacyDebtService.getNotificationsForAssassin(btoa(currentUser.email));
    const notification = notifications.find((n) => n.debtId === debtId && n.type === 'payment_request');

    if (notification) {
      legacyDebtService.acceptPayment(notification.id, debtId);
    }

    const debts = JSON.parse(localStorage.getItem('assassinDebts') || '[]');
    return debts.find((d: Debt) => d.id === debtId);
  },

  rejectPayment: async (debtId: string): Promise<TargetStatus> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const notifications = legacyDebtService.getNotificationsForAssassin(btoa(currentUser.email));
    const notification = notifications.find((n) => n.debtId === debtId && n.type === 'payment_request');

    if (notification) {
      legacyDebtService.rejectPayment(notification.id, debtId);
    }

    const debts = JSON.parse(localStorage.getItem('assassinDebts') || '[]');
    const debt = debts.find((d: Debt) => d.id === debtId);

    return {
      assassinId: debt?.debtorId || '',
      debtId,
      markedAt: new Date().toISOString(),
      reason: `Rejected payment for debt`,
    };
  },

  markAsCompleted: async (debtId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    legacyDebtService.markAsCompleted(debtId);
  },

  confirmCompletion: async (debtId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const notifications = legacyDebtService.getNotificationsForAssassin(btoa(currentUser.email));
    const notification = notifications.find((n) => n.debtId === debtId && n.type === 'completion_request');

    if (notification) {
      legacyDebtService.confirmCompletion(notification.id, debtId);
    }
  },

  rejectCompletion: async (debtId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const notifications = legacyDebtService.getNotificationsForAssassin(btoa(currentUser.email));
    const notification = notifications.find((n) => n.debtId === debtId && n.type === 'completion_request');

    if (notification) {
      legacyDebtService.rejectCompletion(notification.id, debtId);
    }
  },

  checkTargetStatus: async (): Promise<{ isTarget: boolean; targetInfo: TargetStatus | null }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const encodedEmail = btoa(currentUser.email);

    const isTarget = legacyDebtService.isTarget(encodedEmail);
    const targetInfo = legacyDebtService.getTargetInfo(encodedEmail);

    return { isTarget, targetInfo };
  },
};

// Exportar servicio según modo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;
export const debtsService = USE_MOCK ? debtsMockService : debtsApiService;

export default debtsService;
