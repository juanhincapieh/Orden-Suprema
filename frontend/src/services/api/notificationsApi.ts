// Notifications API Service - Supports both mock and real backend
import { api } from './index';
import { USE_MOCK, getCurrentUserEmail } from './config';

export interface Notification {
  id: string;
  recipientEmail?: string;
  userId?: string;
  type: 'transfer' | 'debt_request' | 'payment_request' | 'completion_request' | 'mission_assignment' | 'negotiation';
  senderEmail?: string;
  senderId?: string;
  senderName?: string;
  amount?: number;
  message?: string;
  debtId?: string;
  missionId?: string;
  missionTitle?: string;
  missionReward?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  read: boolean;
}

const NOTIFICATIONS_KEY = 'notifications';

// ============================================
// MOCK IMPLEMENTATION
// ============================================

const mockNotificationsService = {
  getAll: async (): Promise<Notification[]> => {
    const email = getCurrentUserEmail();
    if (!email) return [];
    
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];
    return notifications.filter(n => n.recipientEmail === email);
  },

  getUnreadCount: async (): Promise<number> => {
    const notifications = await mockNotificationsService.getAll();
    return notifications.filter(n => !n.read).length;
  },

  getPendingMissionAssignments: async (): Promise<Notification[]> => {
    const notifications = await mockNotificationsService.getAll();
    return notifications.filter(
      n => n.type === 'mission_assignment' && n.status === 'pending'
    );
  },

  create: async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
    };
    
    notifications.unshift(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    
    return newNotification;
  },

  createMissionAssignment: async (
    recipientEmail: string,
    senderEmail: string,
    senderName: string,
    missionId: string,
    missionTitle: string,
    missionReward: number
  ): Promise<Notification> => {
    return mockNotificationsService.create({
      recipientEmail,
      type: 'mission_assignment',
      senderEmail,
      senderName,
      missionId,
      missionTitle,
      missionReward,
      status: 'pending',
    });
  },

  createTransferNotification: async (
    recipientEmail: string,
    senderEmail: string,
    senderName: string,
    amount: number,
    message?: string
  ): Promise<Notification> => {
    return mockNotificationsService.create({
      recipientEmail,
      type: 'transfer',
      senderEmail,
      senderName,
      amount,
      message,
    });
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];
    
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  markAllAsRead: async (): Promise<void> => {
    const email = getCurrentUserEmail();
    if (!email) return;
    
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];
    
    const updated = notifications.map(n =>
      n.recipientEmail === email ? { ...n, read: true } : n
    );
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  updateMissionAssignmentStatus: async (
    notificationId: string,
    status: 'accepted' | 'rejected' | 'expired'
  ): Promise<void> => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];
    
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, status, read: true } : n
    );
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  delete: async (notificationId: string): Promise<void> => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: Notification[] = stored ? JSON.parse(stored) : [];
    
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  },
};

// ============================================
// REAL API IMPLEMENTATION
// ============================================

const realNotificationsService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<{ notifications: Notification[] }>('/notifications');
    return response.notifications;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  },

  getPendingMissionAssignments: async (): Promise<Notification[]> => {
    const response = await api.get<{ notifications: Notification[] }>('/notifications/mission-assignments/pending');
    return response.notifications;
  },

  create: async (_notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> => {
    // El backend crea notificaciones internamente, este método es solo para mock
    throw new Error('Use specific notification creation methods');
  },

  createMissionAssignment: async (
    recipientEmail: string,
    _senderEmail: string,
    _senderName: string,
    missionId: string,
    missionTitle: string,
    missionReward: number
  ): Promise<Notification> => {
    const response = await api.post<{ notification: Notification }>('/notifications/mission-assignment', {
      recipientEmail,
      missionId,
      missionTitle,
      missionReward,
    });
    return response.notification;
  },

  createTransferNotification: async (
    _recipientEmail: string,
    _senderEmail: string,
    _senderName: string,
    _amount: number,
    _message?: string
  ): Promise<Notification> => {
    // Las notificaciones de transferencia se crean automáticamente en el backend
    throw new Error('Transfer notifications are created automatically by the backend');
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  updateMissionAssignmentStatus: async (
    notificationId: string,
    status: 'accepted' | 'rejected' | 'expired'
  ): Promise<void> => {
    await api.put(`/notifications/mission-assignment/${notificationId}/status`, { status });
  },

  delete: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};

// ============================================
// EXPORT
// ============================================

export const notificationsApi = USE_MOCK ? mockNotificationsService : realNotificationsService;
export default notificationsApi;
