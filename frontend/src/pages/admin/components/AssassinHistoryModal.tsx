import { useState, useEffect, useMemo } from 'react';
import { X, Star, CheckCircle, Coins, RefreshCw, ClipboardList, Calendar } from 'lucide-react';
import { AssassinProfile } from '../../../types';
import { missionsApi, usersApi } from '../../../services/api';
import styles from './AssassinHistoryModal.module.css';

export interface AssassinHistoryModalProps {
  isOpen: boolean;
  assassin: AssassinProfile | null;
  onClose: () => void;
  isSpanish: boolean;
}

export const AssassinHistoryModal = ({
  isOpen,
  assassin,
  onClose,
  isSpanish
}: AssassinHistoryModalProps) => {
  const [missions, setMissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMissions: 0,
    completed: 0,
    inProgress: 0,
    cancelled: 0,
    averageRating: 0,
    totalEarnings: 0
  });

  const translations = useMemo(() => ({
    title: isSpanish ? 'Historial de Misiones' : 'Mission History',
    performanceStats: isSpanish ? 'Estadísticas de Rendimiento' : 'Performance Statistics',
    averageRating: isSpanish ? 'Calificación Promedio' : 'Average Rating',
    completedMissions: isSpanish ? 'Misiones Completadas' : 'Completed Missions',
    totalEarnings: isSpanish ? 'Ganancias Totales' : 'Total Earnings',
    inProgress: isSpanish ? 'En Progreso' : 'In Progress',
    cancelled: isSpanish ? 'Canceladas' : 'Cancelled',
    totalMissions: isSpanish ? 'Total de Misiones' : 'Total Missions',
    recentMissions: isSpanish ? 'Misiones Recientes' : 'Recent Missions',
    contractor: isSpanish ? 'Contratista' : 'Contractor',
    reward: isSpanish ? 'Recompensa' : 'Reward',
    status: isSpanish ? 'Estado' : 'Status',
    completedOn: isSpanish ? 'Completada el' : 'Completed on',
    noMissions: isSpanish ? 'No hay historial de misiones' : 'No mission history',
    noMissionsDesc: isSpanish 
      ? 'Este asesino aún no ha participado en ninguna misión.' 
      : 'This assassin has not participated in any missions yet.',
    close: isSpanish ? 'Cerrar' : 'Close',
    statusLabels: {
      completed: isSpanish ? 'Completada' : 'Completed',
      in_progress: isSpanish ? 'En Progreso' : 'In Progress',
      cancelled: isSpanish ? 'Cancelada' : 'Cancelled',
      open: isSpanish ? 'Abierta' : 'Open',
      negotiating: isSpanish ? 'Negociando' : 'Negotiating'
    }
  }), [isSpanish]);

  // Fetch missions and calculate statistics
  useEffect(() => {
    if (!assassin) return;

    const loadMissionsAndStats = async () => {
      try {
        // Obtener estadísticas del asesino usando el servicio API
        const assassinStats = await usersApi.getAssassinStats(assassin.id);
        
        setStats({
          totalMissions: assassinStats.completedContracts + assassinStats.activeContracts,
          completed: assassinStats.completedContracts,
          inProgress: assassinStats.activeContracts,
          cancelled: 0,
          averageRating: assassinStats.averageRatingAllTime,
          totalEarnings: assassinStats.totalEarnings
        });

        // Obtener misiones del asesino usando el nuevo endpoint
        const assassinMissions = await missionsApi.getAssassinMissions(assassin.id);
        setMissions(assassinMissions);
      } catch (error) {
        console.error('Error loading assassin history:', error);
      }
    };

    loadMissionsAndStats();
  }, [assassin]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !assassin) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label={translations.close}
        >
          <X size={24} />
        </button>

        <h2 className={styles.modalTitle}>
          {translations.title} - {assassin.nickname}
        </h2>

        {/* Statistics Section */}
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>{translations.performanceStats}</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Star size={24} /></div>
              <div className={styles.statValue}>
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className={styles.statLabel}>{translations.averageRating}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><CheckCircle size={24} /></div>
              <div className={styles.statValue}>{stats.completed}</div>
              <div className={styles.statLabel}>{translations.completedMissions}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><Coins size={24} /></div>
              <div className={styles.statValue}>
                {stats.totalEarnings.toLocaleString()}
              </div>
              <div className={styles.statLabel}>{translations.totalEarnings}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><RefreshCw size={24} /></div>
              <div className={styles.statValue}>{stats.inProgress}</div>
              <div className={styles.statLabel}>{translations.inProgress}</div>
            </div>
          </div>
        </div>

        {/* Mission List Section */}
        <div className={styles.missionsSection}>
          <h3 className={styles.sectionTitle}>{translations.recentMissions}</h3>
          
          {missions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><ClipboardList size={48} /></div>
              <h4 className={styles.emptyTitle}>{translations.noMissions}</h4>
              <p className={styles.emptyDescription}>{translations.noMissionsDesc}</p>
            </div>
          ) : (
            <div className={styles.missionsList}>
              {missions
                .sort((a, b) => {
                  // Sort by date (most recent first)
                  const dateA = new Date(a.updatedAt || a.createdAt);
                  const dateB = new Date(b.updatedAt || b.createdAt);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((mission) => {
                  // Get contractor name from mission details (comes from backend)
                  const contractorName = mission.contractorName || 'Unknown';

                  // Format date
                  const missionDate = new Date(mission.updatedAt || mission.createdAt);
                  const formattedDate = missionDate.toLocaleDateString(
                    isSpanish ? 'es-ES' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  );

                  return (
                    <div key={mission.id} className={styles.missionCard}>
                      <div className={styles.missionHeader}>
                        <h4 className={styles.missionTitle}>{mission.title}</h4>
                        <span 
                          className={styles.statusBadge}
                          data-status={mission.status}
                        >
                          {translations.statusLabels[mission.status as keyof typeof translations.statusLabels] || mission.status}
                        </span>
                      </div>

                      <div className={styles.missionDetails}>
                        <div className={styles.missionDetail}>
                          <span className={styles.detailLabel}>{translations.contractor}:</span>
                          <span className={styles.detailValue}>{contractorName}</span>
                        </div>

                        <div className={styles.missionDetail}>
                          <span className={styles.detailLabel}>{translations.reward}:</span>
                          <span className={styles.detailValue}><Coins size={16} /> {mission.reward.toLocaleString()}</span>
                        </div>

                        {mission.status === 'completed' && mission.review && (
                          <div className={styles.missionDetail}>
                            <span className={styles.detailLabel}>Rating:</span>
                            <span className={styles.detailValue}>
                              <Star size={16} /> {mission.review.rating.toFixed(1)}
                            </span>
                          </div>
                        )}

                        <div className={styles.missionDetail}>
                          <span className={styles.detailLabel}>
                            {mission.status === 'completed' ? translations.completedOn : translations.status}:
                          </span>
                          <span className={styles.detailValue}><Calendar size={16} /> {formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className={styles.modalActions}>
          <button className={styles.closeActionButton} onClick={onClose}>
            {translations.close}
          </button>
        </div>
      </div>
    </div>
  );
};
