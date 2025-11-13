export interface Notification {
  id: string;
  recipientEmail: string;
  type: 'transfer' | 'debt_request' | 'payment_request' | 'completion_request';
  senderEmail: string;
  senderName: string;
  amount?: number;
  message?: string;
  debtId?: string;
  createdAt: string;
  read: boolean;
}

const NOTIFICATIONS_KEY = 'notifications';

const getNotifications = (): Notification[] => {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const setNotifications = (notifications: Notification[]): void => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const notificationService = {
  getAll: (): Notification[] => {
    return getNotifications();
  },

  getForUser: (userEmail: string): Notification[] => {
    const notifications = getNotifications();
    return notifications.filter(n => n.recipientEmail === userEmail && !n.read);
  },

  add: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
    const notifications = getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false
    };
    
    notifications.unshift(newNotification);
    setNotifications(notifications);
    
    return newNotification;
  },

  addTransferNotification: (
    recipientEmail: string,
    senderEmail: string,
    senderName: string,
    amount: number,
    message?: string
  ): Notification => {
    return notificationService.add({
      recipientEmail,
      type: 'transfer',
      senderEmail,
      senderName,
      amount,
      message
    });
  },

  markAsRead: (notificationId: string): void => {
    const notifications = getNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
  },

  markAllAsRead: (userEmail: string): void => {
    const notifications = getNotifications();
    const updated = notifications.map(n => 
      n.recipientEmail === userEmail ? { ...n, read: true } : n
    );
    setNotifications(updated);
  },

  delete: (notificationId: string): void => {
    const notifications = getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    setNotifications(filtered);
  },

  clear: (): void => {
    localStorage.removeItem(NOTIFICATIONS_KEY);
  }
};
