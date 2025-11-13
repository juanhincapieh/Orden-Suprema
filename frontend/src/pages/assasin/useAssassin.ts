import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contract } from '../../types';

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
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userReputationAllTime, setUserReputationAllTime] = useState<number>(0);
  const [userReputationLastMonth, setUserReputationLastMonth] = useState<number>(0);
  const [activeMissions, setActiveMissions] = useState<Contract[]>([]);
  const [historyMissions, setHistoryMissions] = useState<Contract[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [showFilters, setShowFilters] = useState(false);
  const [isSpanish, setIsSpanish] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Contract | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filtros unificados
  const [filters, setFilters] = useState<MissionFilters>({
    searchTerm: '',
    startDate: '',
    endDate: '',
    dateFilterType: 'created',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    // Verificar autenticación
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      navigate('/login');
      return;
    }

    const currentUser = JSON.parse(currentUserStr);
    const email = currentUser.email;

    // Verificar rol
    if (currentUser.role !== 'assassin') {
      navigate('/');
      return;
    }

    // Cargar datos del usuario
    setUserEmail(email);
    setUserName(currentUser.nickname || currentUser.name || 'Asesino');
    setUserCoins(currentUser.coins || 0);

    // Detectar idioma
    const language = localStorage.getItem('language');
    setIsSpanish(language === 'es' || navigator.language.toLowerCase().startsWith('es'));

    // Cargar misiones
    loadMissions(email);
  }, [navigate]);

  const loadMissions = (email: string) => {
    const encodedEmail = btoa(email);
    
    // Cargar misiones públicas
    const publicMissionsStr = localStorage.getItem('publicMissions');
    const publicMissions = publicMissionsStr ? JSON.parse(publicMissionsStr) : [];
    
    // Cargar misiones privadas de usuarios
    const userMissionsStr = localStorage.getItem('userMissions');
    const userMissionsDict = userMissionsStr ? JSON.parse(userMissionsStr) : {};
    
    // Combinar todas las misiones
    const allMissions: any[] = [...publicMissions];
    Object.values(userMissionsDict).forEach((missions: any) => {
      if (Array.isArray(missions)) {
        allMissions.push(...missions);
      }
    });
    
    // Filtrar misiones activas del asesino (en progreso y no completadas)
    const activeMissionsList = allMissions.filter(
      (mission: any) => 
        mission.assassinId === encodedEmail && 
        !mission.terminado &&
        mission.status !== 'completed' &&
        (mission.status === 'in-progress' || mission.status === 'in_progress')
    ) as Contract[];

    setActiveMissions(activeMissionsList);

    // Cargar historial (solo misiones completadas o con estado completed)
    // Las misiones expiradas pero no completadas siguen en activas
    const historyMissionsList = allMissions.filter(
      (mission: any) => 
        mission.assassinId === encodedEmail && 
        (mission.terminado || mission.status === 'completed')
    ) as Contract[];

    setHistoryMissions(historyMissionsList);
    
    // Calcular reputación histórica (promedio de ratings de todas las misiones completadas con reseña)
    const completedMissions = historyMissionsList.filter((m: any) => m.terminado && m.review && m.review.rating);
    if (completedMissions.length > 0) {
      const totalRating = completedMissions.reduce((sum: number, m: any) => sum + (m.review?.rating || 0), 0);
      const avgRating = totalRating / completedMissions.length;
      setUserReputationAllTime(avgRating);
      console.log('✨ Reputación histórica:', avgRating.toFixed(1), 'de', completedMissions.length, 'misiones con reseña');
    } else {
      setUserReputationAllTime(0);
      console.log('📊 Sin reputación histórica (sin reseñas)');
    }
    
    // Calcular reputación del último mes
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recentCompletedMissions = completedMissions.filter((m: any) => {
      try {
        const completedDate = new Date(m.updatedAt || m.createdAt);
        return completedDate >= oneMonthAgo;
      } catch {
        return false;
      }
    });
    
    if (recentCompletedMissions.length > 0) {
      const totalRecentRating = recentCompletedMissions.reduce((sum: number, m: any) => sum + (m.review?.rating || 0), 0);
      const avgRecentRating = totalRecentRating / recentCompletedMissions.length;
      setUserReputationLastMonth(avgRecentRating);
      console.log('📅 Reputación último mes:', avgRecentRating.toFixed(1), 'de', recentCompletedMissions.length, 'misiones con reseña');
    } else {
      setUserReputationLastMonth(0);
      console.log('📊 Sin reputación del último mes (sin reseñas recientes)');
    }
    
    console.log('Misiones activas encontradas:', activeMissionsList.length);
    console.log('Misiones en historial:', historyMissionsList.length);
  };

  const isExpired = (deadline: string): boolean => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const getFilteredMissions = useMemo((): Contract[] => {
    console.log('🔄 Recalculando misiones filtradas con:', { viewMode, filters });
    
    // Seleccionar misiones según viewMode (REEMPLAZA completamente el array)
    const sourceMissions = viewMode === 'active' ? activeMissions : historyMissions;
    console.log(`📋 Array fuente (${viewMode}):`, sourceMissions.length, 'misiones');
    
    let filtered = [...sourceMissions];

    // Filtrar por búsqueda
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(mission => {
        // Buscar en título
        const titleMatch = mission.title.toLowerCase().includes(searchLower);
        
        // Buscar nombre del contratista
        try {
          const nicknames = localStorage.getItem('nicknames');
          const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
          const contractorEmail = atob(mission.contractorId);
          const contractorName = nicknamesDict[contractorEmail] || '';
          const contractorMatch = contractorName.toLowerCase().includes(searchLower);
          
          return titleMatch || contractorMatch;
        } catch (error) {
          return titleMatch;
        }
      });
    }

    // Filtrar por rango de fechas (usando el tipo de fecha seleccionado)
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0); // Inicio del día
      
      filtered = filtered.filter(mission => {
        try {
          const dateField = filters.dateFilterType === 'created' ? mission.createdAt : mission.deadline;
          if (!dateField) return true; // Incluir si no tiene la fecha
          
          const missionDate = new Date(dateField);
          missionDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
          return missionDate >= startDate;
        } catch (error) {
          console.error('Error parsing date:', error);
          return true; // Incluir si hay error
        }
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Fin del día
      
      filtered = filtered.filter(mission => {
        try {
          const dateField = filters.dateFilterType === 'created' ? mission.createdAt : mission.deadline;
          if (!dateField) return true; // Incluir si no tiene la fecha
          
          const missionDate = new Date(dateField);
          return missionDate <= endDate;
        } catch (error) {
          console.error('Error parsing date:', error);
          return true; // Incluir si hay error
        }
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'date') {
        try {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          
          // Verificar que las fechas sean válidas
          if (isNaN(dateA) || isNaN(dateB)) {
            console.warn('Invalid date found:', { a: a.createdAt, b: b.createdAt });
            return 0;
          }
          
          // Comparación base: A - B (ascendente natural)
          comparison = dateA - dateB;
        } catch (error) {
          console.error('Error comparing dates:', error);
          return 0;
        }
      } else if (filters.sortBy === 'reward') {
        const rewardA = a.reward || 0;
        const rewardB = b.reward || 0;
        // Comparación base: A - B (ascendente natural)
        comparison = rewardA - rewardB;
      }

      // Si es descendente, invertir el resultado
      // asc: comparison (A-B: menor primero, más antiguo primero)
      // desc: -comparison (B-A: mayor primero, más reciente primero)
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    console.log(`✅ Resultado final (${viewMode}):`, filtered.length, 'misiones filtradas');
    return filtered;
  }, [viewMode, activeMissions, historyMissions, filters]);

  const handleViewModeChange = (mode: ViewMode) => {
    console.log('Cambiando vista a:', mode);
    setViewMode(mode);
  };

  const toggleFilters = () => {
    console.log('Toggle filtros:', !showFilters);
    setShowFilters(prev => !prev);
  };

  const handleFilterChange = (key: keyof MissionFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      console.log('Filtros actualizados:', newFilters);
      return newFilters;
    });
  };

  const handleSortChange = (sortBy: 'date' | 'reward') => {
    setFilters(prev => {
      console.log('Estado anterior:', prev);
      
      let newFilters: MissionFilters;
      
      // Si es el mismo criterio, alternar orden
      if (prev.sortBy === sortBy) {
        const newOrder: 'asc' | 'desc' = prev.sortOrder === 'desc' ? 'asc' : 'desc';
        newFilters = {
          ...prev,
          sortOrder: newOrder
        };
        console.log(`Alternando orden de ${prev.sortOrder} a ${newOrder}`);
      } else {
        // Si es nuevo criterio, empezar con descendente
        newFilters = {
          ...prev,
          sortBy,
          sortOrder: 'desc' as const
        };
        console.log(`Nuevo criterio: ${sortBy}, orden: desc`);
      }
      
      console.log('Nuevo estado:', newFilters);
      return newFilters;
    });
  };

  const getContractorName = (contractorId: string): string => {
    try {
      const email = atob(contractorId);
      const nicknames = localStorage.getItem('nicknames');
      const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
      return nicknamesDict[email] || email;
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
      day: 'numeric'
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

  return {
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
    handleViewDetails
  };
};
