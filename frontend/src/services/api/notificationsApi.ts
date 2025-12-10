// Servicio API para Notificaciones
import api from '../apiService';

// Tipos
export interface Notification {
  id: string;
  type: 'transfer' | 'debt_request' | 'payment_request' | 'completion_request' | 'mission_assigned' | 'negotiation';
  senderEmail: string;
  senderName: string;
  amount?: number;
  message?: string;
  debtId?: string;
  missionId?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

// Servicio de notificaciones con API real
export const notificationsApiService = {
  // Obtener notificaciones del usuario
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<NotificationsResponse>('/notifications');
    return response.notifications;
  },

  // Obtener cantidad de notificaciones no leídas
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  // Marcar todas como leídas
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  // Eliminar notificación
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};

// ============================================
// MODO MOCK - Para desarrollo sin backend
// ============================================

import { notificationService as legacyNotificationService } from '../notificationService';
import { debtService } from '../debtService';

export const notificationsMockService = {
  getNotifications: async (): Promise<Notification[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Combinar notificaciones de transferencias y deudas
    const transferNotifications = legacyNotificationService.getForUser(currentUser.email);
    const debtNotifications = debtService.getNotificationsForAssassin(btoa(currentUser.email));

    const combined: Notification[] = [
      ...transferNotifications.map((n) => ({
        id: n.id,
        type: n.type as Notification['type'],
        senderEmail: n.senderEmail,
        senderName: n.senderName,
        amount: n.amount,
        message: n.message,
        debtId: n.debtId,
        read: n.read,
        createdAt: n.createdAt,
      })),
      ...debtNotifications.map((n) => ({
        id: n.id,
        type: n.type as Notification['type'],
        senderEmail: atob(n.senderId),
        senderName: getNameFromId(n.senderId),
        debtId: n.debtId,
        message: n.description,
        read: n.status !== 'pending',
        createdAt: n.createdAt,
      })),
    ];

    // Ordenar por fecha
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadCount: async (): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const transferNotifications = legacyNotificationService.getForUser(currentUser.email);
    const debtNotifications = debtService.getNotificationsForAssassin(btoa(currentUser.email));

    return transferNotifications.filter((n) => !n.read).length + debtNotifications.length;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    legacyNotificationService.markAsRead(notificationId);
  },

  markAllAsRead: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    legacyNotificationService.markAllAsRead(currentUser.email);
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    legacyNotificationService.delete(notificationId);
  },
};

// Helper para obtener nombre desde ID
function getNameFromId(encodedId: string): string {
  try {
    const email = atob(encodedId);
    const nicknames = JSON.parse(localStorage.getItem('nicknames') || '{}');
    return nicknames[email] || email;
  } catch {
    return 'Unknown';
  }
}

// Exportar servicio según modo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;
export const notificationsService = USE_MOCK ? notificationsMockService : notificationsApiService;

export default notificationsService;
