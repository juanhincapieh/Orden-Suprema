import { useState, useEffect, useMemo } from 'react';
import styles from './AssassinFilters.module.css';

export interface AssassinFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: 'all' | 'available' | 'busy' | 'inactive' | 'suspended';
  onStatusFilterChange: (status: 'all' | 'available' | 'busy' | 'inactive' | 'suspended') => void;
  sortBy: 'name' | 'rating' | 'contracts';
  onSortChange: (sort: 'name' | 'rating' | 'contracts') => void;
  resultCount: number;
  totalCount: number;
  isSpanish: boolean;
}

export const AssassinFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  resultCount,
  totalCount,
  isSpanish
}: AssassinFiltersProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange]);

  // Sync with external changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const translations = useMemo(() => ({
    searchPlaceholder: isSpanish 
      ? 'Buscar por nombre, apodo o email...' 
      : 'Search by name, nickname, or email...',
    status: isSpanish ? 'Estado:' : 'Status:',
    sortBy: isSpanish ? 'Ordenar:' : 'Sort:',
    results: isSpanish ? 'Resultados:' : 'Results:',
    statusOptions: {
      all: isSpanish ? 'Todos' : 'All',
      available: isSpanish ? 'Disponible' : 'Available',
      busy: isSpanish ? 'Ocupado' : 'Busy',
      inactive: isSpanish ? 'Inactivo' : 'Inactive',
      suspended: isSpanish ? 'Suspendido' : 'Suspended'
    },
    sortOptions: {
      name: isSpanish ? 'Nombre' : 'Name',
      rating: isSpanish ? 'Calificación' : 'Rating',
      contracts: isSpanish ? 'Contratos' : 'Contracts'
    }
  }), [isSpanish]);

  return (
    <div className={styles.filterContainer}>
      <div className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={translations.searchPlaceholder}
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.filterControls}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{translations.status}</label>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
          >
            <option value="all">{translations.statusOptions.all}</option>
            <option value="available">{translations.statusOptions.available}</option>
            <option value="busy">{translations.statusOptions.busy}</option>
            <option value="inactive">{translations.statusOptions.inactive}</option>
            <option value="suspended">{translations.statusOptions.suspended}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{translations.sortBy}</label>
          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
          >
            <option value="name">{translations.sortOptions.name}</option>
            <option value="rating">{translations.sortOptions.rating}</option>
            <option value="contracts">{translations.sortOptions.contracts}</option>
          </select>
        </div>

        <div className={styles.resultCount}>
          <span className={styles.resultLabel}>{translations.results}</span>
          <span className={styles.resultValue}>
            {resultCount}/{totalCount}
          </span>
        </div>
      </div>
    </div>
  );
};
