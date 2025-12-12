import { useState, useEffect } from 'react';
import { Bell, Check, X, Coins, AlertTriangle } from 'lucide-react';
import { notificationsApi, missionsApi, Notification } from '../../services/api';
import styles from './Assassin.module.css';

interface MissionAssignmentNotificationsProps {
  userEmail: string;
  isSpanish: boolean;
  onMissionAccepted?: () => void;
}

export const MissionAssignmentNotifications = ({
  userEmail,
  isSpanish,
  onMissionAccepted
}: MissionAssignmentNotificationsProps) => {
  const [pendingAssignments, setPendingAssignments] = useState<Notification[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPendingAssignments = async () => {
    try {
      const pending = await notificationsApi.getPendingMissionAssignments();
      setPendingAssignments(pending);
    } catch (error) {
      console.error('Error loading pending assignments:', error);
    }
  };

  useEffect(() => {
    loadPendingAssignments();
    // Recargar cada 30 segundos
    const interval = setInterval(loadPendingAssignments, 30000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const checkMissionAvailability = async (missionId: string): Promise<{ available: boolean; reason?: string }> => {
    try {
      const mission = await missionsApi.getMissionById(missionId);

      if (!mission) {
        return { 
          available: false, 
          reason: isSpanish ? 'La misión ya no existe' : 'Mission no longer exists' 
        };
      }

      if (mission.assassinId && mission.status === 'in_progress') {
        return { 
          available: false, 
          reason: isSpanish 
            ? 'Lo sentimos, esta misión ya ha sido asignada a otro asesino' 
            : 'Sorry, this mission has already been assigned to another assassin' 
        };
      }

      if (mission.status === 'completed' || mission.terminado) {
        return { 
          available: false, 
          reason: isSpanish ? 'Esta misión ya ha sido completada' : 'This mission has been completed' 
        };
      }

      if (mission.status === 'cancelled') {
        return { 
          available: false, 
          reason: isSpanish ? 'Esta misión ha sido cancelada' : 'This mission has been cancelled' 
        };
      }

      return { available: true };
    } catch (error) {
      console.error('Error checking mission availability:', error);
      return { 
        available: false, 
        reason: isSpanish ? 'Error al verificar la misión' : 'Error checking mission' 
      };
    }
  };

  const handleAccept = async (notification: Notification) => {
    if (!notification.missionId) return;
    
    setProcessingId(notification.id);

    // Verificar disponibilidad de la misión
    const availability = await checkMissionAvailability(notification.missionId);
    
    if (!availability.available) {
      alert(availability.reason);
      await notificationsApi.updateMissionAssignmentStatus(notification.id, 'expired');
      await loadPendingAssignments();
      setProcessingId(null);
      return;
    }

    try {
      const assassinId = btoa(userEmail);

      console.log('🎯 Aceptando misión:', notification.missionId);

      // Asignar la misión usando el servicio API unificado
      await missionsApi.assignMission(notification.missionId, assassinId);

      // Marcar notificación como aceptada
      await notificationsApi.updateMissionAssignmentStatus(notification.id, 'accepted');

      alert(
        isSpanish
          ? `¡Has aceptado la misión "${notification.missionTitle}"!`
          : `You have accepted the mission "${notification.missionTitle}"!`
      );

      await loadPendingAssignments();
      
      if (onMissionAccepted) {
        onMissionAccepted();
      }
    } catch (error) {
      console.error('Error accepting mission:', error);
      alert(isSpanish ? 'Error al aceptar la misión' : 'Error accepting mission');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (notification: Notification) => {
    if (confirm(
      isSpanish
        ? `¿Estás seguro de rechazar la misión "${notification.missionTitle}"?`
        : `Are you sure you want to reject the mission "${notification.missionTitle}"?`
    )) {
      try {
        await notificationsApi.updateMissionAssignmentStatus(notification.id, 'rejected');
        await loadPendingAssignments();
        
        alert(
          isSpanish
            ? 'Misión rechazada. La misión quedará disponible para otros asesinos.'
            : 'Mission rejected. The mission will be available for other assassins.'
        );
      } catch (error) {
        console.error('Error rejecting mission:', error);
      }
    }
  };

  if (pendingAssignments.length === 0) {
    return null;
  }

  return (
    <div className={styles.assignmentNotifications}>
      <h3 className={styles.assignmentTitle}>
        <Bell size={20} />
        {isSpanish ? 'Solicitudes de Asignación' : 'Assignment Requests'}
        <span className={styles.assignmentBadge}>{pendingAssignments.length}</span>
      </h3>

      <div className={styles.assignmentList}>
        {pendingAssignments.map((notification) => (
          <div key={notification.id} className={styles.assignmentCard}>
            <div className={styles.assignmentHeader}>
              <h4 className={styles.assignmentMissionTitle}>
                {notification.missionTitle}
              </h4>
              <div className={styles.assignmentReward}>
                <Coins size={16} />
                {notification.missionReward?.toLocaleString()}
              </div>
            </div>

            <p className={styles.assignmentInfo}>
              {isSpanish 
                ? `Solicitado por: ${notification.senderName}`
                : `Requested by: ${notification.senderName}`}
            </p>

            <p className={styles.assignmentDate}>
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>

            <div className={styles.assignmentWarning}>
              <AlertTriangle size={14} />
              <span>
                {isSpanish
                  ? 'Esta misión puede ser asignada a otro asesino si no respondes pronto.'
                  : 'This mission may be assigned to another assassin if you don\'t respond soon.'}
              </span>
            </div>

            <div className={styles.assignmentActions}>
              <button
                className={styles.acceptButton}
                onClick={() => handleAccept(notification)}
                disabled={processingId === notification.id}
              >
                <Check size={16} />
                {isSpanish ? 'Aceptar' : 'Accept'}
              </button>
              <button
                className={styles.rejectButton}
                onClick={() => handleReject(notification)}
                disabled={processingId === notification.id}
              >
                <X size={16} />
                {isSpanish ? 'Rechazar' : 'Reject'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
