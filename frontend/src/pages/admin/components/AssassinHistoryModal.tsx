import { useState, useEffect, useMemo } from 'react';
import { AssassinProfile } from '../../../types';
import { authService } from '../../../services/authService';
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

    const assassinId = assassin.id;
    const allMissions = authService.getAllMissions();
    
    // Filter missions for this assassin
    const assassinMissions = allMissions.filter(m => m.assassinId === assassinId);
    setMissions(assassinMissions);

    // Calculate statistics
    const completed = assassinMissions.filter(m => m.status === 'completed');
    const inProgress = assassinMissions.filter(m => m.status === 'in_progress');
    const cancelled = assassinMissions.filter(m => m.status === 'cancelled');

    // Calculate average rating from completed missions with reviews
    const missionsWithReviews = completed.filter(m => m.review && m.review.rating);
    const averageRating = missionsWithReviews.length > 0
      ? missionsWithReviews.reduce((sum, m) => sum + m.review.rating, 0) / missionsWithReviews.length
      : 0;

    // Calculate total earnings from completed missions
    const totalEarnings = completed.reduce((sum, m) => sum + (m.reward || 0), 0);

    setStats({
      totalMissions: assassinMissions.length,
      completed: completed.length,
      inProgress: inProgress.length,
      cancelled: cancelled.length,
      averageRating,
      totalEarnings
    });
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
          ✕
        </button>

        <h2 className={styles.modalTitle}>
          {translations.title} - {assassin.nickname}
        </h2>

        {/* Statistics Section */}
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>{translations.performanceStats}</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statValue}>
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className={styles.statLabel}>{translations.averageRating}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>✓</div>
              <div className={styles.statValue}>{stats.completed}</div>
              <div className={styles.statLabel}>{translations.completedMissions}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statValue}>
                {stats.totalEarnings.toLocaleString()}
              </div>
              <div className={styles.statLabel}>{translations.totalEarnings}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔄</div>
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
              <div className={styles.emptyIcon}>📋</div>
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
                  // Get contractor name
                  const contractorEmail = atob(mission.contractorId);
                  const allUsers = authService.getAllUsers();
                  const contractor = allUsers.find(u => u.email === contractorEmail);
                  const contractorName = contractor?.nickname || contractor?.name || 'Unknown';

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
                          <span className={styles.detailValue}>💰 {mission.reward.toLocaleString()}</span>
                        </div>

                        {mission.status === 'completed' && mission.review && (
                          <div className={styles.missionDetail}>
                            <span className={styles.detailLabel}>Rating:</span>
                            <span className={styles.detailValue}>
                              ⭐ {mission.review.rating.toFixed(1)}
                            </span>
                          </div>
                        )}

                        <div className={styles.missionDetail}>
                          <span className={styles.detailLabel}>
                            {mission.status === 'completed' ? translations.completedOn : translations.status}:
                          </span>
                          <span className={styles.detailValue}>📅 {formattedDate}</span>
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
