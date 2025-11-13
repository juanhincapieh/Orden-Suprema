import { useState, useEffect } from 'react';
import { DebtNotification, debtService } from '../services/debtService';
import { Notification, notificationService } from '../services/notificationService';
import styles from './NotificationsPanel.module.css';

interface User {
  email: string;
  role: string;
  name?: string;
  nickname?: string;
}

interface NotificationsPanelProps {
  currentUser: User | null;
  isSpanish: boolean;
}

export const NotificationsPanel = ({ currentUser, isSpanish }: NotificationsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [debtNotifications, setDebtNotifications] = useState<DebtNotification[]>([]);
  const [transferNotifications, setTransferNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar notificaciones
  const loadNotifications = () => {
    if (!currentUser) return;

    try {
      // Cargar notificaciones de deudas (solo para asesinos)
      if (currentUser.role === 'assassin') {
        const userIdEncoded = btoa(currentUser.email);
        const userDebtNotifications = debtService.getNotificationsForAssassin(userIdEncoded);
        setDebtNotifications(userDebtNotifications);
      }

      // Cargar notificaciones de transferencias (para todos)
      const userTransferNotifications = notificationService.getForUser(currentUser.email);
      setTransferNotifications(userTransferNotifications);
      
      console.log('📬 Notificaciones cargadas:', {
        deudas: debtNotifications.length,
        transferencias: userTransferNotifications.length
      });
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const getAssassinName = (assassinId: string): string => {
    try {
      const email = atob(assassinId);
      const nicknames = localStorage.getItem('nicknames');
      const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
      return nicknamesDict[email] || email;
    } catch {
      return 'Unknown';
    }
  };

  const handleAcceptFavor = async (notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      debtService.acceptFavorRequest(notificationId, debtId);
      alert(isSpanish ? '¡Favor aceptado! Se ha creado una deuda.' : 'Favor accepted! A debt has been created.');
      loadNotifications();
    } catch (error: any) {
      console.error('Error accepting favor:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectFavor = async (notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      debtService.rejectFavorRequest(notificationId, debtId);
      alert(isSpanish ? 'Favor rechazado.' : 'Favor rejected.');
      loadNotifications();
    } catch (error: any) {
      console.error('Error rejecting favor:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPayment = async (notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      debtService.acceptPayment(notificationId, debtId);
      alert(isSpanish ? '¡Pago aceptado! La deuda está en curso.' : 'Payment accepted! The debt is in progress.');
      loadNotifications();
    } catch (error: any) {
      console.error('Error accepting payment:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectPayment = async (notificationId: string, debtId: string) => {
    if (!confirm(isSpanish 
      ? '⚠️ Al rechazar el pago, serás marcado como OBJETIVO. ¿Estás seguro?' 
      : '⚠️ By rejecting payment, you will be marked as TARGET. Are you sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      debtService.rejectPayment(notificationId, debtId);
      alert(isSpanish 
        ? '🎯 Has sido marcado como objetivo por rechazar el pago.' 
        : '🎯 You have been marked as target for rejecting payment.');
      loadNotifications();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCompletion = async (notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      debtService.confirmCompletion(notificationId, debtId);
      alert(isSpanish ? '✅ Deuda completada y eliminada.' : '✅ Debt completed and removed.');
      loadNotifications();
    } catch (error: any) {
      console.error('Error confirming completion:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectCompletion = async (notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      debtService.rejectCompletion(notificationId, debtId);
      alert(isSpanish ? 'Completación rechazada. La deuda sigue en curso.' : 'Completion rejected. Debt remains in progress.');
      loadNotifications();
    } catch (error: any) {
      console.error('Error rejecting completion:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const handleDismissTransfer = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const pendingCount = debtNotifications.length + transferNotifications.length;

  return (
    <div className={styles.container}>
      <button
        className={styles.notificationButton}
        onClick={() => setIsOpen(!isOpen)}
        title={isSpanish ? 'Notificaciones de deudas' : 'Debt notifications'}
      >
        <span className={styles.bellIcon}>🔔</span>
        {pendingCount > 0 && (
          <span className={styles.badge}>{pendingCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h3 className={styles.title}>
              {isSpanish ? 'Notificaciones' : 'Notifications'}
              {pendingCount > 0 && ` (${pendingCount})`}
            </h3>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.content}>
            {pendingCount === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>📭</span>
                <p>{isSpanish ? 'No tienes notificaciones' : 'No notifications'}</p>
              </div>
            ) : (
              <>
                {/* Notificaciones de transferencias */}
                {transferNotifications.map((notification) => (
                  <div key={notification.id} className={styles.notificationCard}>
                    <div className={styles.notificationHeader}>
                      <span className={styles.notificationIcon}>💸</span>
                      <span className={styles.notificationTitle}>
                        {isSpanish ? 'Transferencia Recibida' : 'Transfer Received'}
                      </span>
                    </div>
                    <div className={styles.notificationBody}>
                      <p className={styles.sender}>
                        {isSpanish ? 'De: ' : 'From: '}
                        <strong>{notification.senderName}</strong>
                      </p>
                      <p className={styles.amount}>
                        <span className={styles.amountLabel}>
                          {isSpanish ? 'Cantidad:' : 'Amount:'}
                        </span>
                        <span className={styles.amountValue}>
                          🪙 {notification.amount?.toLocaleString()}
                        </span>
                      </p>
                      {notification.message && (
                        <p className={styles.description}>"{notification.message}"</p>
                      )}
                      <p className={styles.timestamp}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={styles.notificationActions}>
                      <button
                        className={styles.dismissButton}
                        onClick={() => handleDismissTransfer(notification.id)}
                      >
                        {isSpanish ? 'Entendido' : 'Got it'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Notificaciones de deudas */}
                {debtNotifications.map((notification) => (
                <div key={notification.id} className={styles.notificationCard}>
                  {notification.type === 'favor_request' && (
                    <>
                      <div className={styles.notificationHeader}>
                        <span className={styles.notificationIcon}>📨</span>
                        <span className={styles.notificationTitle}>
                          {isSpanish ? 'Solicitud de Favor' : 'Favor Request'}
                        </span>
                      </div>
                      <div className={styles.notificationBody}>
                        <p className={styles.sender}>
                          {isSpanish ? 'De: ' : 'From: '}
                          <strong>{getAssassinName(notification.senderId)}</strong>
                        </p>
                        <p className={styles.description}>"{notification.description}"</p>
                      </div>
                      <div className={styles.notificationActions}>
                        <button
                          className={styles.acceptButton}
                          onClick={() => handleAcceptFavor(notification.id, notification.debtId)}
                          disabled={isLoading}
                        >
                          {isSpanish ? 'Aceptar' : 'Accept'}
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleRejectFavor(notification.id, notification.debtId)}
                          disabled={isLoading}
                        >
                          {isSpanish ? 'Rechazar' : 'Reject'}
                        </button>
                      </div>
                    </>
                  )}

                  {notification.type === 'payment_request' && (
                    <>
                      <div className={styles.notificationHeader}>
                        <span className={styles.notificationIcon}>💰</span>
                        <span className={styles.notificationTitle}>
                          {isSpanish ? 'Solicitud de Pago' : 'Payment Request'}
                        </span>
                      </div>
                      <div className={styles.notificationBody}>
                        <p className={styles.sender}>
                          {isSpanish ? 'De: ' : 'From: '}
                          <strong>{getAssassinName(notification.senderId)}</strong>
                        </p>
                        <p className={styles.description}>"{notification.description}"</p>
                        <p className={styles.warning}>
                          ⚠️ {isSpanish 
                            ? 'Si rechazas, serás marcado como objetivo' 
                            : 'If you reject, you will be marked as target'}
                        </p>
                      </div>
                      <div className={styles.notificationActions}>
                        <button
                          className={styles.acceptButton}
                          onClick={() => handleAcceptPayment(notification.id, notification.debtId)}
                          disabled={isLoading}
                        >
                          {isSpanish ? 'Aceptar Pago' : 'Accept Payment'}
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleRejectPayment(notification.id, notification.debtId)}
                          disabled={isLoading}
                        >
                          {isSpanish ? 'Rechazar' : 'Reject'}
                        </button>
                      </div>
                    </>
                  )}

                  {notification.type === 'completion_request' && (
                    <>
                      <div className={styles.notificationHeader}>
                        <span className={styles.notificationIcon}>✅</span>
                        <span className={styles.notificationTitle}>
                          {isSpanish ? 'Pago Completado' : 'Payment Completed'}
                        </span>
                      </div>
                      <div className={styles.notificationBody}>
                        <p className={styles.sender}>
                          {isSpanish ? 'De: ' : 'From: '}
                          <strong>{getAssassinName(notification.senderId)}</strong>
                        </p>
                        <p className={styles.description}>
                          {isSpanish 
                            ? 'El deudor indica que ha completado el pago' 
                            : 'The debtor indicates payment has been completed'}
                        </p>
                      </div>
                      <div className={styles.notificationActions}>
                        <button
                          className={styles.acceptButton}
                          onClick={() => handleConfirmCompletion(notification.id, notification.debtId)}
                          disabled={isLoading}
                        >
                          {isSpanish ? 'Confirmar' : 'Confirm'}
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleRejectCompletion(notification.id, notification.debtId)}
                          disabled={isLoading}
                        >
                          {isSpanish ? 'Rechazar' : 'Reject'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
