import { Contract } from '../../types';
import { MissionCard } from './MissionCard';
import { FilterPanel } from './FilterPanel';
import styles from './Assassin.module.css';

interface MissionFilters {
  searchTerm: string;
  startDate: string;
  endDate: string;
  dateFilterType: 'created' | 'deadline';
  sortBy: 'date' | 'reward';
  sortOrder: 'asc' | 'desc';
}

interface MissionListSectionProps {
  viewMode: 'active' | 'history';
  onViewModeChange: (mode: 'active' | 'history') => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filters: MissionFilters;
  onFilterChange: (key: keyof MissionFilters, value: any) => void;
  onSortChange: (sortBy: 'date' | 'reward') => void;
  missions: Contract[];
  activeMissionsCount: number;
  historyMissionsCount: number;
  isSpanish: boolean;
  getContractorName: (id: string) => string;
  formatDate: (date: Date | string | undefined) => string;
  formatCurrency: (amount: number) => string;
  getMissionStatus: (mission: Contract) => 'completed' | 'expired' | 'active';
  navigate: (path: string) => void;
  onViewDetails: (mission: Contract) => void;
}

export const MissionListSection = ({
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  filters,
  onFilterChange,
  onSortChange,
  missions,
  activeMissionsCount,
  historyMissionsCount,
  isSpanish,
  getContractorName,
  formatDate,
  formatCurrency,
  getMissionStatus,
  navigate,
  onViewDetails
}: MissionListSectionProps) => {
  console.log('🎨 MissionListSection render:', {
    viewMode,
    missionsCount: missions.length,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    missionIds: missions.map(m => m.id)
  });

  return (
    <div className={styles.missionListSection}>
      {/* View Selector (Tabs) */}
      <div className={styles.viewSelector}>
        <button
          className={`${styles.viewTab} ${viewMode === 'active' ? styles.viewTabActive : ''}`}
          onClick={() => onViewModeChange('active')}
        >
          {isSpanish ? 'Activas' : 'Active'}
          <span className={styles.viewTabCounter}>({activeMissionsCount})</span>
        </button>
        <button
          className={`${styles.viewTab} ${viewMode === 'history' ? styles.viewTabActive : ''}`}
          onClick={() => onViewModeChange('history')}
        >
          {isSpanish ? 'Historial' : 'History'}
          <span className={styles.viewTabCounter}>({historyMissionsCount})</span>
        </button>
      </div>

      {/* Filter Toggle Button */}
      <button
        className={styles.filterToggleButton}
        onClick={onToggleFilters}
        aria-expanded={showFilters}
        aria-controls="filter-panel"
        aria-label={isSpanish ? 'Mostrar u ocultar filtros' : 'Show or hide filters'}
      >
        {showFilters ? (
          <>
            <span>−</span>
            <span>{isSpanish ? 'Ocultar filtros' : 'Hide filters'}</span>
          </>
        ) : (
          <>
            <span>+</span>
            <span>{isSpanish ? 'Filtrar' : 'Filter'}</span>
          </>
        )}
      </button>

      {/* Filter Panel */}
      <FilterPanel
        isVisible={showFilters}
        filters={filters}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        isSpanish={isSpanish}
      />

      {/* Mission List */}
      <div className={styles.missionsList} key={`${viewMode}-${filters.sortBy}-${filters.sortOrder}`}>
        {missions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {viewMode === 'active' ? '🎯' : '📭'}
            </div>
            <p>
              {viewMode === 'active'
                ? isSpanish
                  ? 'No tienes misiones activas en este momento'
                  : 'You have no active missions at the moment'
                : isSpanish
                ? filters.searchTerm || filters.startDate || filters.endDate
                  ? 'No se encontraron misiones con los filtros aplicados'
                  : 'Aún no tienes misiones en tu historial'
                : filters.searchTerm || filters.startDate || filters.endDate
                ? 'No missions found with the applied filters'
                : 'You have no missions in your history yet'}
            </p>
            {viewMode === 'active' && (
              <button
                className={styles.historyButton}
                onClick={() => navigate('/missions')}
                style={{ marginTop: '1rem' }}
              >
                {isSpanish ? 'Ver Misiones Públicas' : 'View Public Missions'}
              </button>
            )}
          </div>
        ) : (
          missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              viewMode={viewMode}
              contractorName={getContractorName(mission.contractorId)}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              status={getMissionStatus(mission)}
              isSpanish={isSpanish}
              onViewDetails={() => onViewDetails(mission)}
            />
          ))
        )}
      </div>
    </div>
  );
};
