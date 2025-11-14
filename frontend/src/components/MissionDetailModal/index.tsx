import { Contract } from '../../types';
import { X, Coins, MapPin, Clock, Calendar, Sword, Lock, Globe, CheckCircle, XCircle } from 'lucide-react';
import styles from './MissionDetailModal.module.css';

interface MissionDetailModalProps {
  mission: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  isSpanish?: boolean;
  showNegotiation?: boolean;
  onAcceptNegotiation?: (mission: Contract) => void;
  onRejectNegotiation?: (mission: Contract) => void;
  onCompleteMission?: (mission: Contract) => void;
}

const MissionDetailModal = ({
  mission,
  isOpen,
  onClose,
  currentUser,
  isSpanish = false,
  showNegotiation = true,
  onAcceptNegotiation,
  onRejectNegotiation,
  onCompleteMission
}: MissionDetailModalProps) => {
  if (!isOpen || !mission) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#4ade80';
      case 'negotiating':
        return '#f59e0b';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#8b5cf6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#808080';
    }
  };

  const getStatusText = (status: string) => {
    if (isSpanish) {
      switch (status) {
        case 'open':
          return 'Abierta';
        case 'negotiating':
          return 'En negociación';
        case 'in_progress':
          return 'En progreso';
        case 'completed':
          return 'Completada';
        case 'cancelled':
          return 'Cancelada';
        default:
          return status;
      }
    }

    switch (status) {
      case 'open':
        return 'Open';
      case 'negotiating':
        return 'Negotiating';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const isOwner = currentUser && mission.contractorId === currentUser.id;
  const isAssassin = currentUser && currentUser.role === 'assassin' && mission.assassinId === currentUser.id;
  const shouldShowNegotiationDetails = showNegotiation && mission.negotiation && isOwner;
  const shouldShowNegotiationMessage = showNegotiation && mission.negotiation && !isOwner;
  const canComplete = isAssassin && mission.status === 'in_progress' && !mission.terminado && onCompleteMission;

  // Debug logs
  console.log('🔍 Modal Debug:', {
    isAssassin,
    missionStatus: mission.status,
    terminado: mission.terminado,
    hasCompleteFn: !!onCompleteMission,
    canComplete,
    currentUserRole: currentUser?.role,
    missionAssassinId: mission.assassinId,
    currentUserId: currentUser?.id
  });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{mission.title}</h2>
          <div
            className={styles.modalStatus}
            style={{ backgroundColor: getStatusColor(mission.status) }}
          >
            {getStatusText(mission.status)}
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>
              {isSpanish ? 'Descripción' : 'Description'}
            </h3>
            <p className={styles.description}>{mission.description}</p>
          </div>

          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>
              {isSpanish ? 'Detalles' : 'Details'}
            </h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  {isSpanish ? 'Recompensa' : 'Reward'}
                </span>
                <span className={styles.detailValue}>
                  <Coins size={16} /> {mission.reward.toLocaleString()}
                </span>
              </div>
              {mission.location && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    {isSpanish ? 'Ubicación' : 'Location'}
                  </span>
                  <span className={styles.detailValue}><MapPin size={16} /> {mission.location}</span>
                </div>
              )}
              {mission.deadline && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    {isSpanish ? 'Fecha límite' : 'Deadline'}
                  </span>
                  <span className={styles.detailValue}>
                    <Clock size={16} /> {new Date(mission.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  {isSpanish ? 'Publicada' : 'Posted'}
                </span>
                <span className={styles.detailValue}>
                  <Calendar size={16} /> {new Date(mission.createdAt).toLocaleDateString()}
                </span>
              </div>
              {mission.assassinName && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    {isSpanish ? 'Asesino asignado' : 'Assigned assassin'}
                  </span>
                  <span className={styles.detailValue}><Sword size={16} /> {mission.assassinName}</span>
                </div>
              )}
              {mission.isPrivate !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    {isSpanish ? 'Tipo' : 'Type'}
                  </span>
                  <span className={styles.detailValue}>
                    {mission.isPrivate
                      ? (
                        <>
                          <Lock size={16} /> {isSpanish ? 'Privada' : 'Private'}
                        </>
                      )
                      : (
                        <>
                          <Globe size={16} /> {isSpanish ? 'Pública' : 'Public'}
                        </>
                      )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {shouldShowNegotiationDetails && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>
                {isSpanish ? 'Negociación activa' : 'Active negotiation'}
              </h3>
              <div className={styles.negotiationBox}>
                <p className={styles.negotiationProposer}>
                  <strong>{mission.negotiation!.proposedByName}</strong>{' '}
                  {isSpanish ? 'propone' : 'proposes'}:{' '}
                  <span className={styles.negotiationReward}>
                    <Coins size={16} /> {mission.negotiation!.proposedReward.toLocaleString()}
                  </span>
                </p>
                {mission.negotiation!.message && (
                  <p className={styles.negotiationMessage}>
                    "{mission.negotiation!.message}"
                  </p>
                )}
                <p className={styles.negotiationDate}>
                  {new Date(mission.negotiation!.createdAt).toLocaleString()}
                </p>

                {mission.negotiation!.status === 'pending' && onAcceptNegotiation && onRejectNegotiation && (
                  <div className={styles.negotiationActions}>
                    <button
                      className={styles.acceptButton}
                      onClick={() => onAcceptNegotiation(mission)}
                    >
                      <CheckCircle className={styles.buttonIcon} size={18} />
                      {isSpanish ? 'Aceptar propuesta' : 'Accept proposal'}
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => onRejectNegotiation(mission)}
                    >
                      <XCircle className={styles.buttonIcon} size={18} />
                      {isSpanish ? 'Rechazar propuesta' : 'Reject proposal'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {shouldShowNegotiationMessage && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>
                {isSpanish ? 'Estado de negociación' : 'Negotiation status'}
              </h3>
              <div className={styles.negotiationBox}>
                <p className={styles.negotiationInfo}>
                  <Lock size={16} /> {isSpanish
                    ? 'Esta misión tiene una negociación activa. Los detalles son confidenciales.'
                    : 'This mission has an active negotiation. Details are confidential.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {canComplete && (
          <div className={styles.modalFooter}>
            <button
              className={styles.completeButton}
              onClick={() => {
                const confirmMessage = isSpanish 
                  ? `¿Confirmas que has completado esta misión exitosamente? Recibirás ${mission.reward.toLocaleString()} monedas.`
                  : `Do you confirm that you have completed this mission successfully? You will receive ${mission.reward.toLocaleString()} coins.`;
                
                if (confirm(confirmMessage)) {
                  onCompleteMission!(mission);
                  onClose();
                }
              }}
            >
              <span className={styles.buttonIcon}>✅</span>
              {isSpanish ? 'Completar Misión' : 'Complete Mission'}
              <CheckCircle className={styles.buttonIcon} size={18} />
              {isSpanish ? 'Marcar como Completada' : 'Mark as Completed'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionDetailModal;
