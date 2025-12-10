import { useState, useEffect } from 'react';
import { Contract, Assassin, Transaction, Report, User, AssassinProfile } from '../../types';
import { authService } from '../../services/authService';
import { transactionService } from '../../services/transactionService';
import { assassinProfileService } from '../../services/assassinProfileService';
import { useLanguage } from '../../context/LanguageContext';

// Función para convertir User a Assassin
const userToAssassin = (user: User): Assassin => {
  // Generar ubicación aleatoria en Bogotá
  const baseLatBogota = 4.6097;
  const baseLngBogota = -74.0817;
  const randomOffset = () => (Math.random() - 0.5) * 0.1;

  return {
    id: btoa(user.email),
    name: user.nickname || user.email.split('@')[0],
    email: user.email,
    rating: 4.5 + Math.random() * 0.5, // Rating entre 4.5 y 5.0
    completedContracts: Math.floor(Math.random() * 100) + 20, // Entre 20 y 120 contratos
    location: {
      lat: baseLatBogota + randomOffset(),
      lng: baseLngBogota + randomOffset()
    },
    status: Math.random() > 0.3 ? 'available' : 'busy' // 70% disponibles
  };
};

// Función para obtener misiones disponibles para asignar
const getAvailableMissions = (): Contract[] => {
  // Obtener todas las misiones del sistema
  const allMissions = authService.getAllMissions();
  const publicMissions = authService.getPublicMissions();
  
  // Combinar misiones, evitando duplicados por ID
  const missionMap = new Map<string, Contract>();
  [...allMissions, ...publicMissions].forEach(mission => {
    if (!missionMap.has(mission.id)) {
      missionMap.set(mission.id, mission);
    }
  });
  
  const combinedMissions = Array.from(missionMap.values());
  
  // Filtrar misiones que pueden ser asignadas:
  // - Status open o negotiating
  // - No tienen asesino asignado (assassinId vacío o undefined)
  // - No están completadas ni en progreso
  return combinedMissions.filter(mission => 
    (mission.status === 'open' || mission.status === 'negotiating') &&
    !mission.assassinId &&
    !mission.terminado
  );
};

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

  const loadTransactions = () => {
    const realTransactions = transactionService.getAll();
    console.log('💰 Transacciones cargadas:', realTransactions.length, realTransactions);
    setTransactions(realTransactions);
  };

  useEffect(() => {
    // Migrar usuarios asesinos existentes a perfiles si no existen
    const migrationResult = assassinProfileService.migrateExistingUsers();
    console.log('📋 Perfiles migrados:', migrationResult);

    // Cargar asesinos reales del sistema
    const realAssassins = authService.getAllAssassins();
    const assassinsList = realAssassins.map(user => userToAssassin(user));
    setAssassins(assassinsList);

    // Cargar misiones disponibles
    const availableMissions = getAvailableMissions();
    setContracts(availableMissions);

    // Cargar transacciones reales
    loadTransactions();

    // Cargar reportes
    const loadedReports = authService.getReports();
    setReports(loadedReports);
  }, []);

  // Recargar transacciones cuando se cambia a la pestaña de transacciones
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab]);

  const handleAssignContract = () => {
    if (!selectedAssassin) {
      alert(isSpanish ? 'Selecciona un asesino' : 'Select an assassin');
      return;
    }

    try {
      if (selectedContract) {
        // Asignar misión existente
        const assassin = assassins.find(a => a.id === selectedAssassin);
        if (!assassin) {
          alert(isSpanish ? 'Asesino no encontrado' : 'Assassin not found');
          return;
        }

        const updateData = {
          assassinId: selectedAssassin, // Este es btoa(email) del asesino
          assassinName: assassin.name,
          status: 'in_progress' as const,
          updatedAt: new Date().toISOString()
        };

        // Intentar actualizar en misiones públicas primero
        const publicMissions = authService.getPublicMissions();
        const publicIndex = publicMissions.findIndex(m => m.id === selectedContract.id);
        
        if (publicIndex !== -1) {
          // Actualizar en misiones públicas
          authService.updatePublicMission(selectedContract.id, updateData);
          console.log('✅ Misión actualizada en publicMissions');
        } else {
          // Actualizar en misiones privadas del contratista
          const missionOwnerEmail = atob(selectedContract.contractorId);
          authService.updateMission(missionOwnerEmail, selectedContract.id, updateData);
          console.log('✅ Misión actualizada en userMissions');
        }

        alert(
          isSpanish
            ? `Misión "${selectedContract.title}" asignada a ${assassin.name}`
            : `Mission "${selectedContract.title}" assigned to ${assassin.name}`
        );
      } else {
        // Crear nueva misión
        if (!newMissionTitle || !newMissionDescription || !newMissionReward) {
          alert(isSpanish 
            ? 'Completa todos los campos requeridos' 
            : 'Fill all required fields');
          return;
        }

        const assassin = assassins.find(a => a.id === selectedAssassin);
        if (!assassin) {
          alert(isSpanish ? 'Asesino no encontrado' : 'Assassin not found');
          return;
        }

        // Crear la nueva misión
        const newMission: Contract = {
          id: `admin_${Date.now()}`,
          title: newMissionTitle,
          description: newMissionDescription,
          reward: parseInt(newMissionReward),
          status: 'in_progress',
          terminado: false,
          contractorId: btoa('admin@system.com'), // Admin como contratista
          assassinId: selectedAssassin,
          assassinName: assassin.name,
          location: newMissionLocation || undefined,
          deadline: newMissionDeadline || undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Agregar a misiones públicas
        authService.addPublicMission(newMission);

        alert(
          isSpanish
            ? `Nueva misión "${newMissionTitle}" creada y asignada a ${assassin.name}`
            : `New mission "${newMissionTitle}" created and assigned to ${assassin.name}`
        );

        // Limpiar campos
        setNewMissionTitle('');
        setNewMissionDescription('');
        setNewMissionReward('');
        setNewMissionLocation('');
        setNewMissionDeadline('');
      }

      // Recargar misiones disponibles
      const availableMissions = getAvailableMissions();
      setContracts(availableMissions);

      setShowAssignModal(false);
      setSelectedContract(null);
      setSelectedAssassin('');
    } catch (error) {
      console.error('Error assigning mission:', error);
      alert(isSpanish ? 'Error al asignar misión' : 'Error assigning mission');
    }
  };

  const handlePenalizeReport = (reportId: string) => {
    if (confirm(isSpanish 
      ? '¿Estás seguro de que quieres penalizar este reporte?' 
      : 'Are you sure you want to penalize this report?')) {
      
      authService.updateReport(reportId, { status: 'resolved' });
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'resolved' } : r
      ));

      alert(isSpanish 
        ? 'Reporte penalizado exitosamente' 
        : 'Report penalized successfully');
    }
  };

  const handleCancelReport = (reportId: string) => {
    if (confirm(isSpanish 
      ? '¿Estás seguro de que quieres cancelar este reporte?' 
      : 'Are you sure you want to cancel this report?')) {
      
      authService.updateReport(reportId, { status: 'cancelled' });
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'cancelled' } : r
      ));

      alert(isSpanish 
        ? 'Reporte cancelado exitosamente' 
        : 'Report cancelled successfully');
    }
  };

  const handleSuspendAssassin = (email: string) => {
    if (confirm(isSpanish 
      ? '¿Estás seguro de que quieres suspender esta cuenta?' 
      : 'Are you sure you want to suspend this account?')) {
      
      authService.suspendUser(email);
      
      // Actualizar la lista de asesinos
      const realAssassins = authService.getAllAssassins();
      const assassinsList = realAssassins.map(user => userToAssassin(user));
      setAssassins(assassinsList);

      alert(isSpanish 
        ? 'Cuenta suspendida exitosamente' 
        : 'Account suspended successfully');
    }
  };

  const handleDeleteAssassin = (email: string) => {
    if (confirm(isSpanish 
      ? '¿Estás seguro de que quieres eliminar esta cuenta? Esta acción no se puede deshacer.' 
      : 'Are you sure you want to delete this account? This action cannot be undone.')) {
      
      authService.deleteUser(email);
      
      // Actualizar la lista de asesinos
      const realAssassins = authService.getAllAssassins();
      const assassinsList = realAssassins.map(user => userToAssassin(user));
      setAssassins(assassinsList);

      alert(isSpanish 
        ? 'Cuenta eliminada exitosamente' 
        : 'Account deleted successfully');
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

  const handleEditAssassin = (email: string) => {
    const profile = assassinProfileService.getProfile(email);
    if (profile) {
      setSelectedAssassinProfile(profile);
      setShowEditModal(true);
    } else {
      alert(isSpanish 
        ? 'No se encontró el perfil del asesino' 
        : 'Assassin profile not found');
    }
  };

  const handleViewHistory = (email: string) => {
    const profile = assassinProfileService.getProfile(email);
    if (profile) {
      setSelectedAssassinProfile(profile);
      setShowHistoryModal(true);
    } else {
      alert(isSpanish 
        ? 'No se encontró el perfil del asesino' 
        : 'Assassin profile not found');
    }
  };

  const handleSaveAssassinProfile = async (updatedProfile: Partial<AssassinProfile>) => {
    if (!selectedAssassinProfile) return;

    try {
      const result = assassinProfileService.updateProfile(selectedAssassinProfile.email, updatedProfile);
      
      if (result.success) {
        // Reload assassins list
        const realAssassins = authService.getAllAssassins();
        const assassinsList = realAssassins.map(user => userToAssassin(user));
        setAssassins(assassinsList);

        alert(isSpanish 
          ? 'Perfil actualizado exitosamente' 
          : 'Profile updated successfully');
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error: any) {
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
    loadTransactions
  };
};
