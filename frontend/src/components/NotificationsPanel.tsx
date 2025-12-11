import { useState, useEffect } from 'react';
import { Bell, Mailbox, Coins, Banknote, Mail, CheckCircle, Target, Check, X } from 'lucide-react';
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

      // Cargar notificaciones generales (transferencias y asignaciones de misión)
      const userNotifications = notificationService.getForUser(currentUser.email);
      // También incluir notificaciones de asignación de misión pendientes
      const pendingMissionAssignments = notificationService.getPendingMissionAssignments(currentUser.email);
      // Combinar y evitar duplicados
      const allNotifications = [...userNotifications];
      pendingMissionAssignments.forEach(n => {
        if (!allNotifications.find(existing => existing.id === n.id)) {
          allNotifications.push(n);
        }
      });
      setTransferNotifications(allNotifications);
      
      console.log('📬 Notificaciones cargadas:', {
        deudas: debtNotifications.length,
        generales: allNotifications.length
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

  // Manejar aceptación de misión
  const handleAcceptMission = async (notification: Notification) => {
    if (!notification.missionId || !currentUser) return;
    
    setIsLoading(true);
    try {
      // Buscar la misión en publicMissions y userMissions
      const publicMissionsStr = localStorage.getItem('publicMissions');
      const publicMissions = publicMissionsStr ? JSON.parse(publicMissionsStr) : [];
      const userMissionsStr = localStorage.getItem('userMissions');
      const userMissionsDict = userMissionsStr ? JSON.parse(userMissionsStr) : {};
      
      let mission = publicMissions.find((m: any) => m.id === notification.missionId);
      let missionLocation: 'public' | 'private' | null = mission ? 'public' : null;
      let contractorEmail = '';
      
      // Si no está en públicas, buscar en privadas
      if (!mission) {
        for (const email of Object.keys(userMissionsDict)) {
          const found = userMissionsDict[email].find((m: any) => m.id === notification.missionId);
          if (found) {
            mission = found;
            missionLocation = 'private';
            contractorEmail = email;
            break;
          }
        }
      }
      
      if (!mission) {
        alert(isSpanish ? 'La misión ya no existe' : 'Mission no longer exists');
        notificationService.updateMissionNotificationStatus(notification.id, 'expired');
        loadNotifications();
        setIsLoading(false);
        return;
      }

      if (mission.assassinId && mission.status === 'in_progress') {
        alert(isSpanish 
          ? 'Lo sentimos, esta misión ya ha sido asignada a otro asesino' 
          : 'Sorry, this mission has already been assigned to another assassin');
        notificationService.updateMissionNotificationStatus(notification.id, 'expired');
        loadNotifications();
        setIsLoading(false);
        return;
      }

      // Asignar la misión
      const assassinId = btoa(currentUser.email);
      const nicknames = localStorage.getItem('nicknames');
      const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
      const assassinName = nicknamesDict[currentUser.email] || currentUser.email.split('@')[0];

      const updateData = {
        assassinId,
        assassinName,
        status: 'in_progress',
        updatedAt: new Date().toISOString()
      };

      if (missionLocation === 'public') {
        const publicIndex = publicMissions.findIndex((m: any) => m.id === notification.missionId);
        if (publicIndex !== -1) {
          publicMissions[publicIndex] = { ...publicMissions[publicIndex], ...updateData };
          localStorage.setItem('publicMissions', JSON.stringify(publicMissions));
        }
      } else if (missionLocation === 'private' && contractorEmail) {
        const missionIndex = userMissionsDict[contractorEmail].findIndex(
          (m: any) => m.id === notification.missionId
        );
        if (missionIndex !== -1) {
          userMissionsDict[contractorEmail][missionIndex] = {
            ...userMissionsDict[contractorEmail][missionIndex],
            ...updateData
          };
          localStorage.setItem('userMissions', JSON.stringify(userMissionsDict));
        }
      }

      notificationService.updateMissionNotificationStatus(notification.id, 'accepted');
      
      alert(isSpanish 
        ? `¡Has aceptado la misión "${notification.missionTitle}"!` 
        : `You have accepted the mission "${notification.missionTitle}"!`);
      
      loadNotifications();
    } catch (error) {
      console.error('Error accepting mission:', error);
      alert(isSpanish ? 'Error al aceptar la misión' : 'Error accepting mission');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar rechazo de misión
  const handleRejectMission = (notification: Notification) => {
    if (confirm(isSpanish 
      ? `¿Estás seguro de rechazar la misión "${notification.missionTitle}"?` 
      : `Are you sure you want to reject the mission "${notification.missionTitle}"?`)) {
      notificationService.updateMissionNotificationStatus(notification.id, 'rejected');
      alert(isSpanish 
        ? 'Misión rechazada. La misión quedará disponible para otros asesinos.' 
        : 'Mission rejected. The mission will be available for other assassins.');
      loadNotifications();
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
