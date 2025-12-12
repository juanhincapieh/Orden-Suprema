import { useState, useEffect } from 'react';
import { Bell, Mailbox, Coins, Banknote, Mail, CheckCircle, Target, Check, X } from 'lucide-react';
import { notificationsApi, missionsApi, debtsApi, Notification, DebtNotification } from '../services/api';
import { dispatchNotificationUpdate, subscribeToNotificationUpdates } from '../utils/notificationEvents';
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
  const loadNotifications = async () => {
    if (!currentUser) return;

    try {
      // Cargar notificaciones de deudas (solo para asesinos) - usando localStorage para compatibilidad
      if (currentUser.role === 'assassin') {
        const userIdEncoded = btoa(currentUser.email);
        const storedNotifications = localStorage.getItem('debtNotifications');
        const allDebtNotifications: DebtNotification[] = storedNotifications ? JSON.parse(storedNotifications) : [];
        const userDebtNotifications = allDebtNotifications.filter(n => n.recipientId === userIdEncoded);
        setDebtNotifications(userDebtNotifications);
      }

      // Cargar notificaciones generales usando el servicio API unificado
      const allNotifications = await notificationsApi.getAll();
      
      // También cargar asignaciones pendientes
      const pendingAssignments = await notificationsApi.getPendingMissionAssignments();
      
      // Combinar y evitar duplicados
      const combined = [...allNotifications];
      pendingAssignments.forEach((n: Notification) => {
        if (!combined.find(existing => existing.id === n.id)) {
          combined.push(n);
        }
      });
      
      // Filtrar notificaciones que ya fueron procesadas (accepted, rejected, expired)
      // y las que ya fueron leídas (excepto transferencias que solo se marcan como leídas)
      const filtered = combined.filter(n => {
        // Para asignaciones de misión, solo mostrar las pendientes
        if (n.type === 'mission_assignment') {
          return n.status === 'pending';
        }
        // Para otras notificaciones, mostrar las no leídas
        return !n.read;
      });
      
      setTransferNotifications(filtered);
      
      console.log('📬 Notificaciones cargadas:', {
        deudas: debtNotifications.length,
        generales: combined.length
      });
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    // Suscribirse a eventos de actualización de notificaciones
    const unsubscribe = subscribeToNotificationUpdates(loadNotifications);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [currentUser]);

  const getAssassinName = (assassinId: string): string => {
    try {
      const email = atob(assassinId);
      // Intentar obtener el nombre del sender de la notificación
      // o usar el email como fallback
      return email.split('@')[0];
    } catch {
      return 'Unknown';
    }
  };

  const handleAcceptFavor = async (_notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      await debtsApi.acceptFavorRequest(debtId);
      alert(isSpanish ? '¡Favor aceptado! Se ha creado una deuda.' : 'Favor accepted! A debt has been created.');
      await loadNotifications();
    } catch (error: any) {
      console.error('Error accepting favor:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectFavor = async (_notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      await debtsApi.rejectFavorRequest(debtId);
      alert(isSpanish ? 'Favor rechazado.' : 'Favor rejected.');
      await loadNotifications();
    } catch (error: any) {
      console.error('Error rejecting favor:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPayment = async (_notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      await debtsApi.acceptPayment(debtId);
      alert(isSpanish ? '¡Pago aceptado! La deuda está en curso.' : 'Payment accepted! The debt is in progress.');
      await loadNotifications();
    } catch (error: any) {
      console.error('Error accepting payment:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectPayment = async (_notificationId: string, debtId: string) => {
    if (!confirm(isSpanish 
      ? '⚠️ Al rechazar el pago, serás marcado como OBJETIVO. ¿Estás seguro?' 
      : '⚠️ By rejecting payment, you will be marked as TARGET. Are you sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      await debtsApi.rejectPayment(debtId);
      alert(isSpanish 
        ? '🎯 Has sido marcado como objetivo por rechazar el pago.' 
        : '🎯 You have been marked as target for rejecting payment.');
      await loadNotifications();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCompletion = async (_notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      await debtsApi.confirmCompletion(debtId);
      alert(isSpanish ? '✅ Deuda completada y eliminada.' : '✅ Debt completed and removed.');
      await loadNotifications();
    } catch (error: any) {
      console.error('Error confirming completion:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectCompletion = async (_notificationId: string, debtId: string) => {
    setIsLoading(true);
    try {
      await debtsApi.rejectCompletion(debtId);
      alert(isSpanish ? 'Completación rechazada. La deuda sigue en curso.' : 'Completion rejected. Debt remains in progress.');
      await loadNotifications();
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

  const handleDismissTransfer = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // Manejar aceptación de misión
  const handleAcceptMission = async (notification: Notification) => {
    if (!notification.missionId || !currentUser) return;
    
    setIsLoading(true);
    try {
      // Verificar si la misión existe y está disponible
      const mission = await missionsApi.getMissionById(notification.missionId);
      
      if (!mission) {
        alert(isSpanish ? 'La misión ya no existe' : 'Mission no longer exists');
        await notificationsApi.updateMissionAssignmentStatus(notification.id, 'expired');
        await loadNotifications();
        setIsLoading(false);
        return;
      }

      if (mission.assassinId && mission.status === 'in_progress') {
        alert(isSpanish 
          ? 'Lo sentimos, esta misión ya ha sido asignada a otro asesino' 
          : 'Sorry, this mission has already been assigned to another assassin');
        await notificationsApi.updateMissionAssignmentStatus(notification.id, 'expired');
        await loadNotifications();
        setIsLoading(false);
        return;
      }

      // Asignar la misión usando el servicio API
      // Usar el ID real del usuario si está disponible, sino usar btoa(email) para compatibilidad
      const userId = (currentUser as any).id || btoa(currentUser.email);
      await missionsApi.assignMission(notification.missionId, userId);

      // Marcar notificación como aceptada
      await notificationsApi.updateMissionAssignmentStatus(notification.id, 'accepted');
      
      alert(isSpanish 
        ? `¡Has aceptado la misión "${notification.missionTitle}"!` 
        : `You have accepted the mission "${notification.missionTitle}"!`);
      
      await loadNotifications();
      
      // Notificar a otros componentes que las notificaciones han cambiado
      dispatchNotificationUpdate();
    } catch (error) {
      console.error('Error accepting mission:', error);
      alert(isSpanish ? 'Error al aceptar la misión' : 'Error accepting mission');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar rechazo de misión
  const handleRejectMission = async (notification: Notification) => {
    if (confirm(isSpanish 
      ? `¿Estás seguro de rechazar la misión "${notification.missionTitle}"?` 
      : `Are you sure you want to reject the mission "${notification.missionTitle}"?`)) {
      try {
        await notificationsApi.updateMissionAssignmentStatus(notification.id, 'rejected');
        alert(isSpanish 
          ? 'Misión rechazada. La misión quedará disponible para otros asesinos.' 
          : 'Mission rejected. The mission will be available for other assassins.');
        await loadNotifications();
        
        // Notificar a otros componentes que las notificaciones han cambiado
        dispatchNotificationUpdate();
      } catch (error) {
        console.error('Error rejecting mission:', error);
      }
    }
  };

  const pendingCount = debtNotifications.length + transferNotifications.length;

  return (
    <div className={styles.container}>
      <button
        className={styles.notificationButton}
        onClick={() => setIsOpen(!isOpen)}
        title={isSpanish ? 'Notificaciones de deudas' : 'Debt notifications'}
      >
        <span className={styles.bellIcon}><Bell size={20} /></span>
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
                <span className={styles.emptyIcon}><Mailbox size={48} /></span>
                <p>{isSpanish ? 'No tienes notificaciones' : 'No notifications'}</p>
              </div>
            ) : (
              <>
                {/* Notificaciones generales (transferencias y asignaciones de misión) */}
                {transferNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`${styles.notificationCard} ${notification.type === 'mission_assignment' ? styles.missionAssignmentCard : ''}`}
                  >
                    {notification.type === 'mission_assignment' ? (
                      <>
                        <div className={styles.notificationHeader}>
                          <span className={styles.notificationIcon} style={{ color: '#f59e0b' }}>
                            <Target size={20} />
                          </span>
                          <span className={styles.notificationTitle} style={{ color: '#f59e0b' }}>
                            {isSpanish ? 'Solicitud de Misión' : 'Mission Request'}
                          </span>
                        </div>
                        <div className={styles.notificationBody}>
                          <p className={styles.missionTitle}>
                            <strong>{notification.missionTitle}</strong>
                          </p>
                          <p className={styles.sender}>
                            {isSpanish ? 'Solicitado por: ' : 'Requested by: '}
                            <strong>{notification.senderName}</strong>
                          </p>
                          <p className={styles.amount}>
                            <span className={styles.amountLabel}>
                              {isSpanish ? 'Recompensa:' : 'Reward:'}
                            </span>
                            <span className={styles.amountValue}>
                              <Coins size={16} /> {notification.missionReward?.toLocaleString()}
                            </span>
                          </p>
                          <p className={styles.warning} style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                            ⚠️ {isSpanish 
                              ? 'Esta misión puede ser asignada a otro si no respondes pronto' 
                              : 'This mission may be assigned to another if you don\'t respond soon'}
                          </p>
                          <p className={styles.timestamp}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className={styles.notificationActions}>
                          <button
                            className={styles.acceptButton}
                            onClick={() => handleAcceptMission(notification)}
                            disabled={isLoading}
                          >
                            <Check size={16} /> {isSpanish ? 'Aceptar' : 'Accept'}
                          </button>
                          <button
                            className={styles.rejectButton}
                            onClick={() => handleRejectMission(notification)}
                            disabled={isLoading}
                          >
                            <X size={16} /> {isSpanish ? 'Rechazar' : 'Reject'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.notificationHeader}>
                          <span className={styles.notificationIcon}><Banknote size={20} /></span>
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
                              <Coins size={16} /> {notification.amount?.toLocaleString()}
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
                      </>
                    )}
                  </div>
                ))}

                {/* Notificaciones de deudas */}
                {debtNotifications.map((notification) => (
                <div key={notification.id} className={styles.notificationCard}>
                  {notification.type === 'favor_request' && (
                    <>
                      <div className={styles.notificationHeader}>
                        <span className={styles.notificationIcon}><Mail size={20} /></span>
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
                        <span className={styles.notificationIcon}><Coins size={20} /></span>
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
                        <span className={styles.notificationIcon}><CheckCircle size={20} style={{ color: '#10b981' }} /></span>
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
