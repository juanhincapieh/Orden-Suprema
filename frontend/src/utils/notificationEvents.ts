// Evento personalizado para sincronizar notificaciones entre componentes

export const NOTIFICATION_UPDATED_EVENT = 'notification-updated';

export const dispatchNotificationUpdate = () => {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_UPDATED_EVENT));
};

export const subscribeToNotificationUpdates = (callback: () => void) => {
  window.addEventListener(NOTIFICATION_UPDATED_EVENT, callback);
  return () => window.removeEventListener(NOTIFICATION_UPDATED_EVENT, callback);
};
