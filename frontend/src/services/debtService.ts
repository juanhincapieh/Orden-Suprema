import { ERROR_MESSAGES, type ErrorKey } from './debtService.errors';

// Interfaces
export interface Debt {
  id: string;
  debtorId: string; // Email encoded del asesino que debe
  creditorId: string; // Email encoded del asesino al que se le debe
  favorDescription: string;
  paymentDescription?: string;
  status: 'pending' | 'active' | 'payment_requested' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface DebtNotification {
  id: string;
  recipientId: string; // Email encoded
  senderId: string; // Email encoded
  debtId: string;
  type: 'favor_request' | 'payment_request' | 'completion_request';
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string; // ISO date string
}

export interface TargetStatus {
  assassinId: string; // Email encoded
  debtId: string;
  markedAt: string; // ISO date string
  reason: string;
}

// LocalStorage keys
const DEBTS_KEY = 'assassinDebts';
const NOTIFICATIONS_KEY = 'debtNotifications';
const TARGETS_KEY = 'targetAssassins';

class DebtService {
  // Helper: Generar ID único
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper: Obtener datos de localStorage
  private getDebts(): Debt[] {
    const data = localStorage.getItem(DEBTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private getNotifications(): DebtNotification[] {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private getTargets(): TargetStatus[] {
    const data = localStorage.getItem(TARGETS_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Helper: Guardar datos en localStorage
  private saveDebts(debts: Debt[]): void {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  }

  private saveNotifications(notifications: DebtNotification[]): void {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  private saveTargets(targets: TargetStatus[]): void {
    localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
  }

  // Helper: Obtener mensaje de error
  private getError(key: ErrorKey, lang: 'es' | 'en' = 'en'): string {
    return ERROR_MESSAGES[lang][key];
  }

  // Validaciones
  private validateDescription(description: string, lang: 'es' | 'en' = 'en'): { valid: boolean; error?: string } {
    if (!description || description.trim().length < 10) {
      return { valid: false, error: this.getError('shortDescription', lang) };
    }
    if (description.length > 500) {
      return { valid: false, error: this.getError('longDescription', lang) };
    }
    return { valid: true };
  }

  // 1. Crear solicitud de favor
  createFavorRequest(
    debtorId: string,
    creditorId: string,
    description: string,
    lang: 'es' | 'en' = 'en'
  ): { debt: Debt; notification: DebtNotification } {
    try {
      // Validar que no sea a sí mismo
      if (debtorId === creditorId) {
        throw new Error(this.getError('selfRequest', lang));
      }

      // Validar descripción
      const validation = this.validateDescription(description, lang);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Verificar solicitudes duplicadas pendientes
      const debts = this.getDebts();
      const hasPending = debts.some(
        d => d.debtorId === debtorId && 
             d.creditorId === creditorId && 
             d.status === 'pending'
      );
      if (hasPending) {
        throw new Error(this.getError('duplicateRequest', lang));
      }

    const now = new Date().toISOString();

    // Crear deuda pendiente
    const debt: Debt = {
      id: this.generateId('debt'),
      debtorId,
      creditorId,
      favorDescription: description,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    // Crear notificación para el receptor
    const notification: DebtNotification = {
      id: this.generateId('notif'),
      recipientId: creditorId,
      senderId: debtorId,
      debtId: debt.id,
      type: 'favor_request',
      description,
      status: 'pending',
      createdAt: now
    };

    // Guardar
    debts.push(debt);
    this.saveDebts(debts);

    const notifications = this.getNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);

      console.log('✅ Favor request created:', { debt, notification });
      return { debt, notification };
    } catch (error) {
      console.error('❌ Error creating favor request:', error);
      throw error;
    }
  }

  // 2. Aceptar solicitud de favor
  acceptFavorRequest(notificationId: string, debtId: string): void {
    const debts = this.getDebts();
    const notifications = this.getNotifications();

    const debt = debts.find(d => d.id === debtId);
    const notification = notifications.find(n => n.id === notificationId);

    if (!debt || !notification) {
      throw new Error('Debt or notification not found');
    }

    if (debt.status !== 'pending') {
      throw new Error('Debt is not in pending status');
    }

    // Actualizar deuda a activa
    debt.status = 'active';
    debt.updatedAt = new Date().toISOString();

    // Actualizar notificación
    notification.status = 'accepted';

    this.saveDebts(debts);
    this.saveNotifications(notifications);

    console.log('✅ Favor request accepted:', debtId);
  }

  // 3. Rechazar solicitud de favor
  rejectFavorRequest(notificationId: string, debtId: string): void {
    const debts = this.getDebts();
    const notifications = this.getNotifications();

    const debtIndex = debts.findIndex(d => d.id === debtId);
    const notification = notifications.find(n => n.id === notificationId);

    if (debtIndex === -1 || !notification) {
      throw new Error('Debt or notification not found');
    }

    // Eliminar deuda (no se crea)
    debts.splice(debtIndex, 1);

    // Actualizar notificación
    notification.status = 'rejected';

    this.saveDebts(debts);
    this.saveNotifications(notifications);

    console.log('✅ Favor request rejected:', debtId);
  }

  // 4. Solicitar pago de deuda
  requestPayment(debtId: string, paymentDescription: string): DebtNotification {
    // Validar descripción
    const validation = this.validateDescription(paymentDescription);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const debts = this.getDebts();
    const debt = debts.find(d => d.id === debtId);

    if (!debt) {
      throw new Error('Debt not found');
    }

    if (debt.status !== 'active') {
      throw new Error('Debt must be active to request payment');
    }

    // Actualizar deuda
    debt.status = 'payment_requested';
    debt.paymentDescription = paymentDescription;
    debt.updatedAt = new Date().toISOString();

    // Crear notificación para el deudor
    const notification: DebtNotification = {
      id: this.generateId('notif'),
      recipientId: debt.debtorId,
      senderId: debt.creditorId,
      debtId: debt.id,
      type: 'payment_request',
      description: paymentDescription,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.saveDebts(debts);

    const notifications = this.getNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);

    console.log('✅ Payment requested:', { debtId, notification });
    return notification;
  }

  // 5. Aceptar pago de deuda
  acceptPayment(notificationId: string, debtId: string): void {
    const debts = this.getDebts();
    const notifications = this.getNotifications();

    const debt = debts.find(d => d.id === debtId);
    const notification = notifications.find(n => n.id === notificationId);

    if (!debt || !notification) {
      throw new Error('Debt or notification not found');
    }

    if (debt.status !== 'payment_requested') {
      throw new Error('Debt is not in payment_requested status');
    }

    // Actualizar deuda a en curso
    debt.status = 'in_progress';
    debt.updatedAt = new Date().toISOString();

    // Actualizar notificación
    notification.status = 'accepted';

    this.saveDebts(debts);
    this.saveNotifications(notifications);

    console.log('✅ Payment accepted:', debtId);
  }

  // 6. Rechazar pago de deuda (marca como objetivo)
  rejectPayment(notificationId: string, debtId: string): void {
    const debts = this.getDebts();
    const notifications = this.getNotifications();
    const targets = this.getTargets();

    const debt = debts.find(d => d.id === debtId);
    const notification = notifications.find(n => n.id === notificationId);

    if (!debt || !notification) {
      throw new Error('Debt or notification not found');
    }

    if (debt.status !== 'payment_requested') {
      throw new Error('Debt is not in payment_requested status');
    }

    // Actualizar deuda a rechazada
    debt.status = 'rejected';
    debt.updatedAt = new Date().toISOString();

    // Actualizar notificación
    notification.status = 'rejected';

    // Marcar como objetivo
    const targetStatus: TargetStatus = {
      assassinId: debt.debtorId,
      debtId: debt.id,
      markedAt: new Date().toISOString(),
      reason: `Rejected payment for debt: ${debt.favorDescription}`
    };

    targets.push(targetStatus);

    this.saveDebts(debts);
    this.saveNotifications(notifications);
    this.saveTargets(targets);

    console.log('🎯 Assassin marked as target:', debt.debtorId);
  }

  // 7. Marcar deuda como completada
  markAsCompleted(debtId: string): DebtNotification {
    const debts = this.getDebts();
    const debt = debts.find(d => d.id === debtId);

    if (!debt) {
      throw new Error('Debt not found');
    }

    if (debt.status !== 'in_progress') {
      throw new Error('Debt must be in_progress to mark as completed');
    }

    // Crear notificación de completación para el acreedor
    const notification: DebtNotification = {
      id: this.generateId('notif'),
      recipientId: debt.creditorId,
      senderId: debt.debtorId,
      debtId: debt.id,
      type: 'completion_request',
      description: `Debt payment completed: ${debt.paymentDescription}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const notifications = this.getNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);

    console.log('✅ Completion requested:', { debtId, notification });
    return notification;
  }

  // 8. Confirmar completación
  confirmCompletion(notificationId: string, debtId: string): void {
    const debts = this.getDebts();
    const notifications = this.getNotifications();

    const debtIndex = debts.findIndex(d => d.id === debtId);
    const notification = notifications.find(n => n.id === notificationId);

    if (debtIndex === -1 || !notification) {
      throw new Error('Debt or notification not found');
    }

    const debt = debts[debtIndex];

    // Eliminar deuda (completada)
    debts.splice(debtIndex, 1);

    // Actualizar notificación
    notification.status = 'accepted';

    // Remover Target Status si existe
    this.removeTargetStatus(debt.debtorId, debtId);

    this.saveDebts(debts);
    this.saveNotifications(notifications);

    console.log('✅ Debt completed and removed:', debtId);
  }

  // 9. Rechazar completación
  rejectCompletion(notificationId: string, debtId: string): void {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Actualizar notificación
    notification.status = 'rejected';

    this.saveNotifications(notifications);

    console.log('✅ Completion rejected, debt remains in_progress:', debtId);
  }

  // 10. Obtener deudas de un asesino
  getDebtsForAssassin(assassinId: string): {
    debtsIOwe: Debt[];
    debtsOwedToMe: Debt[];
  } {
    const debts = this.getDebts();

    const debtsIOwe = debts.filter(d => d.debtorId === assassinId && d.status !== 'pending');
    const debtsOwedToMe = debts.filter(d => d.creditorId === assassinId && d.status !== 'pending');

    return { debtsIOwe, debtsOwedToMe };
  }

  // 11. Obtener notificaciones de un asesino
  getNotificationsForAssassin(assassinId: string): DebtNotification[] {
    const notifications = this.getNotifications();
    return notifications.filter(n => n.recipientId === assassinId && n.status === 'pending');
  }

  // 12. Verificar si un asesino es objetivo
  isTarget(assassinId: string): boolean {
    const targets = this.getTargets();
    return targets.some(t => t.assassinId === assassinId);
  }

  // 13. Obtener información de objetivo
  getTargetInfo(assassinId: string): TargetStatus | null {
    const targets = this.getTargets();
    return targets.find(t => t.assassinId === assassinId) || null;
  }

  // 14. Remover estado de objetivo
  removeTargetStatus(assassinId: string, debtId: string): void {
    const targets = this.getTargets();
    const index = targets.findIndex(t => t.assassinId === assassinId && t.debtId === debtId);

    if (index !== -1) {
      targets.splice(index, 1);
      this.saveTargets(targets);
      console.log('✅ Target status removed:', assassinId);
    }
  }
}

// Exportar instancia singleton
export const debtService = new DebtService();
