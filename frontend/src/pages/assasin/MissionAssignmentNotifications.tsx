import { useState, useEffect } from 'react';
import { Bell, Check, X, Coins, AlertTriangle } from 'lucide-react';
import { notificationService, Notification } from '../../services/notificationService';
import { authService } from '../../services/authService';
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

  const loadPendingAssignments = () => {
    const pending = notificationService.getPendingMissionAssignments(userEmail);
    setPendingAssignments(pending);
  };

  useEffect(() => {
    loadPendingAssignments();
    // Recargar cada 30 segundos
    const interval = setInterval(loadPendingAssignments, 30000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const checkMissionAvailability = (missionId: string): { available: boolean; reason?: string } => {
    // Buscar la misión en publicMissions y userMissions
    const publicMissions = authService.getPublicMissions();
    const allMissions = authService.getAllMissions();
    
    const mission = publicMissions.find(m => m.id === missionId) || 
                    allMissions.find(m => m.id === missionId);

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
  };

  const handleAccept = async (notification: Notification) => {
    if (!notification.missionId) return;
    
    setProcessingId(notification.id);

    // Verificar disponibilidad de la misión
    const availability = checkMissionAvailability(notification.missionId);
    
    if (!availability.available) {
      alert(availability.reason);
      notificationService.updateMissionNotificationStatus(notification.id, 'expired');
      loadPendingAssignments();
      setProcessingId(null);
      return;
    }

    try {
      const assassinId = btoa(userEmail);
      const nicknames = localStorage.getItem('nicknames');
      const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
      const assassinName = nicknamesDict[userEmail] || userEmail.split('@')[0];

      const updateData = {
        assassinId,
        assassinName,
        status: 'in_progress' as const,
        updatedAt: new Date().toISOString()
      };

      console.log('🎯 Aceptando misión:', notification.missionId);
      console.log('🎯 Datos de actualización:', updateData);

      // Buscar y actualizar la misión en publicMissions
      const publicMissionsStr = localStorage.getItem('publicMissions');
      const publicMissions = publicMissionsStr ? JSON.parse(publicMissionsStr) : [];
      const publicIndex = publicMissions.findIndex((m: any) => m.id === notification.missionId);
      
      let missionUpdated = false;

      if (publicIndex !== -1) {
        console.log('✅ Misión encontrada en publicMissions, índice:', publicIndex);
        publicMissions[publicIndex] = {
          ...publicMissions[publicIndex],
          ...updateData
        };
        localStorage.setItem('publicMissions', JSON.stringify(publicMissions));
        missionUpdated = true;
        console.log('✅ Misión actualizada en publicMissions');
      }
      
      // También buscar en userMissions
      const userMissionsStr = localStorage.getItem('userMissions');
      const userMissionsDict = userMissionsStr ? JSON.parse(userMissionsStr) : {};
      
      for (const email of Object.keys(userMissionsDict)) {
        const missions = userMissionsDict[email];
        const missionIndex = missions.findIndex((m: any) => m.id === notification.missionId);
        if (missionIndex !== -1) {
          console.log('✅ Misión encontrada en userMissions de:', email);
          userMissionsDict[email][missionIndex] = {
            ...userMissionsDict[email][missionIndex],
            ...updateData
          };
          localStorage.setItem('userMissions', JSON.stringify(userMissionsDict));
          missionUpdated = true;
          console.log('✅ Misión actualizada en userMissions');
          break;
        }
      }

      if (!missionUpdated) {
        console.error('❌ No se encontró la misión en ningún lugar');
      }

      // Marcar notificación como aceptada
      notificationService.updateMissionNotificationStatus(notification.id, 'accepted');

      alert(
        isSpanish
          ? `¡Has aceptado la misión "${notification.missionTitle}"!`
          : `You have accepted the mission "${notification.missionTitle}"!`
      );

      loadPendingAssignments();
      
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

  const handleReject = (notification: Notification) => {
    if (confirm(
      isSpanish
        ? `¿Estás seguro de rechazar la misión "${notification.missionTitle}"?`
        : `Are you sure you want to reject the mission "${notification.missionTitle}"?`
    )) {
      notificationService.updateMissionNotificationStatus(notification.id, 'rejected');
      loadPendingAssignments();
      
      alert(
        isSpanish
          ? 'Misión rechazada. La misión quedará disponible para otros asesinos.'
          : 'Mission rejected. The mission will be available for other assassins.'
      );
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
