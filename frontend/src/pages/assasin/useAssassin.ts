import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contract } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { missionsApi, usersApi } from '../../services/api';

interface MissionFilters {
  searchTerm: string;
  startDate: string;
  endDate: string;
  dateFilterType: 'created' | 'deadline';
  sortBy: 'date' | 'reward';
  sortOrder: 'asc' | 'desc';
}

type ViewMode = 'active' | 'history';

export const useAssassin = () => {
  const navigate = useNavigate();
  const { isSpanish } = useLanguage();
  const { user: currentUser, refreshUser } = useAuth();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userReputationAllTime, setUserReputationAllTime] = useState<number>(0);
  const [userReputationLastMonth, setUserReputationLastMonth] = useState<number>(0);
  const [activeMissions, setActiveMissions] = useState<Contract[]>([]);
  const [historyMissions, setHistoryMissions] = useState<Contract[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Contract | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros unificados
  const [filters, setFilters] = useState<MissionFilters>({
    searchTerm: '',
    startDate: '',
    endDate: '',
    dateFilterType: 'created',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const loadMissions = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Cargar misiones activas
      const active = await missionsApi.getAssignedMissions('active');
      setActiveMissions(active);

      // Cargar historial
      const completed = await missionsApi.getAssignedMissions('completed');
      setHistoryMissions(completed);

      // Cargar estadísticas del asesino
      const stats = await usersApi.getAssassinStats(currentUser.id);
      setUserReputationAllTime(stats.averageRatingAllTime);
      setUserReputationLastMonth(stats.averageRatingLastMonth);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.role !== 'assassin') {
      navigate('/');
      return;
    }

    setUserEmail(currentUser.email);
    setUserName(currentUser.nickname || currentUser.name || 'Asesino');
    setUserCoins(currentUser.coins || 0);

    loadMissions();
  }, [currentUser, navigate, loadMissions]);

  const isExpired = (deadline: string): boolean => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const getFilteredMissions = useMemo((): Contract[] => {
    const sourceMissions = viewMode === 'active' ? activeMissions : historyMissions;
    let filtered = [...sourceMissions];

    // Filtrar por búsqueda
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter((mission) => {
        const titleMatch = mission.title.toLowerCase().includes(searchLower);
        return titleMatch;
      });
    }

    // Filtrar por rango de fechas
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((mission) => {
        try {
          const dateField = filters.dateFilterType === 'created' ? mission.createdAt : mission.deadline;
          if (!dateField) return true;
          const missionDate = new Date(dateField);
          missionDate.setHours(0, 0, 0, 0);
          return missionDate >= startDate;
        } catch {
          return true;
        }
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((mission) => {
        try {
          const dateField = filters.dateFilterType === 'created' ? mission.createdAt : mission.deadline;
          if (!dateField) return true;
          const missionDate = new Date(dateField);
          return missionDate <= endDate;
        } catch {
          return true;
        }
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        comparison = dateA - dateB;
      } else if (filters.sortBy === 'reward') {
        comparison = (a.reward || 0) - (b.reward || 0);
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [viewMode, activeMissions, historyMissions, filters]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handleFilterChange = (key: keyof MissionFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (sortBy: 'date' | 'reward') => {
    setFilters((prev) => {
      if (prev.sortBy === sortBy) {
        return { ...prev, sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' };
      }
      return { ...prev, sortBy, sortOrder: 'desc' };
    });
  };

  const getContractorName = (contractorId: string): string => {
    try {
      const email = atob(contractorId);
      return email.split('@')[0];
    } catch {
      return 'Desconocido';
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(isSpanish ? 'es-ES' : 'en-US').format(amount);
  };

  const getMissionStatus = (mission: Contract): 'completed' | 'expired' | 'active' => {
    if (mission.terminado) return 'completed';
    if (mission.deadline && isExpired(mission.deadline)) return 'expired';
    return 'active';
  };

  const handleViewDetails = (mission: Contract) => {
    setSelectedMission(mission);
    setShowDetailModal(true);
  };

  const reloadMissions = async () => {
    await loadMissions();
    await refreshUser();
    if (currentUser) {
      setUserCoins(currentUser.coins || 0);
    }
  };

  const completeMission = async (mission: Contract) => {
    try {
      await missionsApi.completeMission(mission.id);

      // Refrescar datos
      await refreshUser();
      await loadMissions();

      const newBalance = (currentUser?.coins || 0) + mission.reward;
      setUserCoins(newBalance);

      return { oldBalance: currentUser?.coins || 0, newBalance, reward: mission.reward };
    } catch (error) {
      console.error('Error completing mission:', error);
      throw error;
    }
  };

  return {
    currentUser,
    userEmail,
    userName,
    userCoins,
    userReputationAllTime,
    userReputationLastMonth,
    activeMissions,
    historyMissions,
    viewMode,
    handleViewModeChange,
    showFilters,
    toggleFilters,
    isSpanish,
    filters,
    handleFilterChange,
    handleSortChange,
    filteredMissions: getFilteredMissions,
    activeMissionsCount: activeMissions.length,
    historyMissionsCount: historyMissions.length,
    getContractorName,
    formatDate,
    formatCurrency,
    getMissionStatus,
    navigate,
    selectedMission,
    showDetailModal,
    setShowDetailModal,
    handleViewDetails,
    reloadMissions,
    completeMission,
    isLoading,
  };
};
