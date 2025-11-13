import { Contract } from '../../types';
import styles from './Assassin.module.css';

interface MissionCardProps {
  mission: Contract;
  viewMode: 'active' | 'history';
  contractorName: string;
  formatDate: (date: Date | string | undefined) => string;
  formatCurrency: (amount: number) => string;
  status: 'completed' | 'expired' | 'active';
  isSpanish: boolean;
  onViewDetails?: () => void;
}

export const MissionCard = ({
  mission,
  viewMode,
  contractorName,
  formatDate,
  formatCurrency,
  status,
  isSpanish,
  onViewDetails
}: MissionCardProps) => {
  return (
    <div className={`${styles.missionCard} ${viewMode === 'history' ? styles.missionCardHistory : styles.missionCardActive}`}>
      <div className={styles.missionInfo}>
        <h3 className={styles.missionTitle}>{mission.title}</h3>
        <div className={styles.missionDetails}>
          <span>
            {isSpanish ? 'Contratista: ' : 'Contractor: '}
            <strong>{contractorName}</strong>
          </span>
          
          {viewMode === 'active' ? (
            <span className={styles.missionDeadline}>
              <span>⏰</span>
              <span>
                {isSpanish ? 'Fecha límite: ' : 'Deadline: '}
                {formatDate(mission.deadline)}
              </span>
            </span>
          ) : (
            <>
              <span>
                📅 {isSpanish ? 'Fecha: ' : 'Date: '}
                {formatDate(mission.createdAt)}
              </span>
              <span>
                ⏰ {isSpanish ? 'Límite: ' : 'Deadline: '}
                {formatDate(mission.deadline)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.missionActions}>
        {viewMode === 'history' && (
          <div
            className={`${styles.statusBadge} ${
              status === 'completed'
                ? styles.statusCompleted
                : styles.statusExpired
            }`}
          >
            <span>{status === 'completed' ? '✓' : '⏰'}</span>
            <span>
              {status === 'completed'
                ? isSpanish
                  ? 'Completada'
                  : 'Completed'
                : isSpanish
                ? 'Expirada'
                : 'Expired'}
            </span>
          </div>
        )}
        
        <span className={styles.missionReward}>
          🪙 {formatCurrency(mission.reward)}
        </span>
        
        <button 
          className={styles.detailsButton}
          onClick={onViewDetails}
        >
          {isSpanish ? 'Ver Detalles' : 'View Details'}
        </button>
      </div>
    </div>
  );
};
