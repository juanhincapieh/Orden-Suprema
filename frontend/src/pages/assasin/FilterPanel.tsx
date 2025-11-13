import styles from './Assassin.module.css';

interface MissionFilters {
  searchTerm: string;
  startDate: string;
  endDate: string;
  dateFilterType: 'created' | 'deadline';
  sortBy: 'date' | 'reward';
  sortOrder: 'asc' | 'desc';
}

interface FilterPanelProps {
  isVisible: boolean;
  filters: MissionFilters;
  onFilterChange: (key: keyof MissionFilters, value: string) => void;
  onSortChange: (sortBy: 'date' | 'reward') => void;
  isSpanish: boolean;
}

export const FilterPanel = ({
  isVisible,
  filters,
  onFilterChange,
  onSortChange,
  isSpanish
}: FilterPanelProps) => {
  if (!isVisible) return null;

  return (
    <div className={`${styles.filterPanel} ${isVisible ? styles.filterPanelExpanded : ''}`}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>
          {isSpanish ? 'Buscar' : 'Search'}
        </label>
        <input
          type="text"
          className={styles.filterInput}
          placeholder={
            isSpanish
              ? 'Nombre de misión o contratista...'
              : 'Mission or contractor name...'
          }
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>
          {isSpanish ? 'Filtrar por' : 'Filter by'}
        </label>
        <select
          className={styles.filterInput}
          value={filters.dateFilterType}
          onChange={(e) => onFilterChange('dateFilterType', e.target.value)}
        >
          <option value="created">
            {isSpanish ? 'Fecha de creación' : 'Creation date'}
          </option>
          <option value="deadline">
            {isSpanish ? 'Fecha límite' : 'Deadline'}
          </option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>
          {isSpanish ? 'Desde' : 'From'}
        </label>
        <input
          type="date"
          className={styles.filterInput}
          value={filters.startDate}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>
          {isSpanish ? 'Hasta' : 'To'}
        </label>
        <input
          type="date"
          className={styles.filterInput}
          value={filters.endDate}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>
          {isSpanish ? 'Ordenar por' : 'Sort by'}
        </label>
        <div className={styles.sortButtons}>
          <button
            className={`${styles.sortButton} ${
              filters.sortBy === 'date' ? styles.sortButtonActive : ''
            }`}
            onClick={() => onSortChange('date')}
          >
            <span>📅</span>
            <span>{isSpanish ? 'Fecha' : 'Date'}</span>
            {filters.sortBy === 'date' && (
              <span className={styles.sortArrow}>
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button
            className={`${styles.sortButton} ${
              filters.sortBy === 'reward' ? styles.sortButtonActive : ''
            }`}
            onClick={() => onSortChange('reward')}
          >
            <span>🪙</span>
            <span>{isSpanish ? 'Recompensa' : 'Reward'}</span>
            {filters.sortBy === 'reward' && (
              <span className={styles.sortArrow}>
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
