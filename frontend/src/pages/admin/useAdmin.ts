import { useState, useEffect, useCallback } from 'react';
import { Contract, Assassin, Transaction, Report, AssassinProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  usersApi,
  missionsApi,
  coinsApi,
  reportsApi,
  notificationsApi,
} from '../../services/api';

export const useAdmin = () => {
  const { isSpanish } = useLanguage();

  const [activeTab, setActiveTab] = useState<'assign' | 'manage' | 'transactions' | 'reports'>('assign');
  const [assassins, setAssassins] = useState<Assassin[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedAssassin, setSelectedAssassin] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssassinOnMap, setSelectedAssassinOnMap] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Estados para nueva misión
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionDescription, setNewMissionDescription] = useState('');
  const [newMissionReward, setNewMissionReward] = useState('');
  const [newMissionLocation, setNewMissionLocation] = useState('');
  const [newMissionDeadline, setNewMissionDeadline] = useState('');

  // Estados para modales de edición e historial
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAssassinProfile, setSelectedAssassinProfile] = useState<AssassinProfile | null>(null);

  // Cargar asesinos
  const loadAssassins = useCallback(async () => {
    try {
      const assassinsList = await usersApi.getAllAssassins();
      const mapped: Assassin[] = assassinsList.map((a) => ({
        id: a.id,
        name: a.nickname || a.name,
        email: a.email,
        rating: a.averageRatingAllTime || 0,
        completedContracts: a.completedContracts || 0,
        location: a.location,
        status: a.status,
      }));
      setAssassins(mapped);
    } catch (error) {
      console.error('Error loading assassins:', error);
    }
  }, []);

  // Cargar misiones disponibles
  const loadAvailableMissions = useCallback(async () => {
    try {
      const publicMissions = await missionsApi.getPublicMissions();
      // Filtrar misiones que pueden ser asignadas
      const available = publicMissions.filter(
        (m) => (m.status === 'open' || m.status === 'negotiating') && !m.assassinId && !m.terminado
      );
      setContracts(available);
    } catch (error) {
      console.error('Error loading missions:', error);
    }
  }, []);

  // Cargar transacciones
  const loadTransactions = useCallback(async () => {
    try {
      const txs = await coinsApi.getAllTransactions();
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, []);

  // Cargar reportes
  const loadReports = useCallback(async () => {
    try {
      const reps = await reportsApi.getAll();
      setReports(reps);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadAssassins(), loadAvailableMissions(), loadTransactions(), loadReports()]);
      setIsLoading(false);
    };
    loadData();
  }, [loadAssassins, loadAvailableMissions, loadTransactions, loadReports]);

  // Recargar transacciones cuando se cambia a la pestaña
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab, loadTransactions]);

  const handleAssignContract = async () => {
    if (!selectedAssassin) {
      alert(isSpanish ? 'Selecciona un asesino' : 'Select an assassin');
      return;
    }

    try {
      const assassin = assassins.find((a) => a.id === selectedAssassin);
      if (!assassin) {
        alert(isSpanish ? 'Asesino no encontrado' : 'Assassin not found');
        return;
      }

      const isAssassinBusy = assassin.status === 'busy';

      if (selectedContract) {
        // Asignar misión existente
        if (isAssassinBusy) {
          // Enviar notificación
          await notificationsApi.createMissionAssignment(
            assassin.email,
            'admin@hightable.com',
            'High Table Admin',
            selectedContract.id,
            selectedContract.title,
            selectedContract.reward
          );

          alert(
            isSpanish
              ? `${assassin.name} está ocupado. Se ha enviado una solicitud de asignación.`
              : `${assassin.name} is busy. An assignment request has been sent.`
          );
        } else {
          // Asignar directamente
          await missionsApi.assignMission(selectedContract.id, selectedAssassin);

          alert(
            isSpanish
              ? `Misión "${selectedContract.title}" asignada a ${assassin.name}`
              : `Mission "${selectedContract.title}" assigned to ${assassin.name}`
          );
        }
      } else {
        // Crear nueva misión
        if (!newMissionTitle || !newMissionDescription || !newMissionReward) {
          alert(isSpanish ? 'Completa todos los campos requeridos' : 'Fill all required fields');
          return;
        }

        const reward = parseInt(newMissionReward);

        // Crear la misión
        const newMission = await missionsApi.createMission({
          title: newMissionTitle,
          description: newMissionDescription,
          reward,
          location: newMissionLocation || undefined,
          deadline: newMissionDeadline || undefined,
          isPrivate: false,
        });

        if (isAssassinBusy) {
          // Enviar notificación
          await notificationsApi.createMissionAssignment(
            assassin.email,
            'admin@hightable.com',
            'High Table Admin',
            newMission.id,
            newMissionTitle,
            reward
          );

          alert(
            isSpanish
              ? `${assassin.name} está ocupado. La misión ha sido creada y se envió solicitud.`
              : `${assassin.name} is busy. Mission created and request sent.`
          );
        } else {
          // Asignar directamente
          await missionsApi.assignMission(newMission.id, selectedAssassin);

          alert(
            isSpanish
              ? `Nueva misión creada y asignada a ${assassin.name}`
              : `New mission created and assigned to ${assassin.name}`
          );
        }

        // Limpiar campos
        setNewMissionTitle('');
        setNewMissionDescription('');
        setNewMissionReward('');
        setNewMissionLocation('');
        setNewMissionDeadline('');
      }

      // Recargar datos
      await loadAvailableMissions();
      await loadAssassins();

      setShowAssignModal(false);
      setSelectedContract(null);
      setSelectedAssassin('');
    } catch (error) {
      console.error('Error assigning mission:', error);
      alert(isSpanish ? 'Error al asignar misión' : 'Error assigning mission');
    }
  };

  const handlePenalizeReport = async (reportId: string) => {
    if (
      confirm(
        isSpanish
          ? '¿Estás seguro de que quieres penalizar este reporte?'
          : 'Are you sure you want to penalize this report?'
      )
    ) {
      try {
        await reportsApi.penalize(reportId);
        setReports(reports.map((r) => (r.id === reportId ? { ...r, status: 'resolved' as const } : r)));
        alert(isSpanish ? 'Reporte penalizado exitosamente' : 'Report penalized successfully');
      } catch (error) {
        console.error('Error penalizing report:', error);
      }
    }
  };

  const handleCancelReport = async (reportId: string) => {
    if (
      confirm(
        isSpanish
          ? '¿Estás seguro de que quieres cancelar este reporte?'
          : 'Are you sure you want to cancel this report?'
      )
    ) {
      try {
        await reportsApi.cancel(reportId);
        setReports(reports.map((r) => (r.id === reportId ? { ...r, status: 'cancelled' as const } : r)));
        alert(isSpanish ? 'Reporte cancelado exitosamente' : 'Report cancelled successfully');
      } catch (error) {
        console.error('Error cancelling report:', error);
      }
    }
  };

  const handleSuspendAssassin = async (email: string) => {
    if (
      confirm(
        isSpanish
          ? '¿Estás seguro de que quieres suspender esta cuenta?'
          : 'Are you sure you want to suspend this account?'
      )
    ) {
      try {
        const assassin = assassins.find((a) => a.email === email);
        if (assassin) {
          await usersApi.suspendUser(assassin.id);
          await loadAssassins();
          alert(isSpanish ? 'Cuenta suspendida exitosamente' : 'Account suspended successfully');
        }
      } catch (error) {
        console.error('Error suspending user:', error);
      }
    }
  };

  const handleDeleteAssassin = async (email: string) => {
    if (
      confirm(
        isSpanish
          ? '¿Estás seguro de que quieres eliminar esta cuenta? Esta acción no se puede deshacer.'
          : 'Are you sure you want to delete this account? This action cannot be undone.'
      )
    ) {
      try {
        const assassin = assassins.find((a) => a.email === email);
        if (assassin) {
          await usersApi.deleteUser(assassin.id);
          await loadAssassins();
          alert(isSpanish ? 'Cuenta eliminada exitosamente' : 'Account deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4ade80';
      case 'busy':
        return '#f59e0b';
      case 'inactive':
        return '#ef4444';
      default:
        return '#808080';
    }
  };

  const getStatusText = (status: string) => {
    if (isSpanish) {
      switch (status) {
        case 'available':
          return 'Disponible';
        case 'busy':
          return 'Ocupado';
        case 'inactive':
          return 'Inactivo';
        default:
          return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleEditAssassin = async (email: string) => {
    try {
      const profile = await usersApi.getAssassinProfile(email);
      if (profile) {
        setSelectedAssassinProfile(profile);
        setShowEditModal(true);
      } else {
        alert(isSpanish ? 'No se encontró el perfil del asesino' : 'Assassin profile not found');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleViewHistory = async (email: string) => {
    try {
      const profile = await usersApi.getAssassinProfile(email);
      if (profile) {
        setSelectedAssassinProfile(profile);
        setShowHistoryModal(true);
      } else {
        alert(isSpanish ? 'No se encontró el perfil del asesino' : 'Assassin profile not found');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveAssassinProfile = async (updatedProfile: Partial<AssassinProfile>) => {
    if (!selectedAssassinProfile) return;

    try {
      await usersApi.updateAssassinProfile(selectedAssassinProfile.email, updatedProfile);
      await loadAssassins();
      alert(isSpanish ? 'Perfil actualizado exitosamente' : 'Profile updated successfully');
    } catch (error: unknown) {
      console.error('Error updating assassin profile:', error);
      throw error;
    }
  };

  return {
    activeTab,
    setActiveTab,
    assassins,
    contracts,
    transactions,
    reports,
    selectedContract,
    setSelectedContract,
    selectedAssassin,
    setSelectedAssassin,
    showAssignModal,
    setShowAssignModal,
    selectedAssassinOnMap,
    setSelectedAssassinOnMap,
    newMissionTitle,
    setNewMissionTitle,
    newMissionDescription,
    setNewMissionDescription,
    newMissionReward,
    setNewMissionReward,
    newMissionLocation,
    setNewMissionLocation,
    newMissionDeadline,
    setNewMissionDeadline,
    showEditModal,
    setShowEditModal,
    showHistoryModal,
    setShowHistoryModal,
    selectedAssassinProfile,
    setSelectedAssassinProfile,
    isSpanish,
    isLoading,
    handleAssignContract,
    handlePenalizeReport,
    handleCancelReport,
    handleSuspendAssassin,
    handleDeleteAssassin,
    handleEditAssassin,
    handleViewHistory,
    handleSaveAssassinProfile,
    getStatusColor,
    getStatusText,
    loadTransactions,
  };
};
