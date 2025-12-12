import { useState, useEffect, useMemo, useCallback } from 'react';
import { Contract } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi, missionsApi, coinsApi, notificationsApi } from '../../services/api';

export interface AssassinProfile {
  id: string;
  email: string;
  name: string;
  nickname: string;
  minContractValue: number;
  averageRatingAllTime: number;
  averageRatingLastMonth: number;
  completedContracts: number;
  avatar?: string;
  specialties: string[];
  status: 'available' | 'busy' | 'inactive';
  isTarget?: boolean;
  targetReason?: string;
}

export const useAssassins = () => {
  const { isSpanish } = useLanguage();
  const { user: currentUser, refreshUser } = useAuth();
  const [assassins, setAssassins] = useState<AssassinProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'both' | 'name' | 'nickname'>('both');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'contracts' | 'price'>('rating');
  const [selectedAssassin, setSelectedAssassin] = useState<AssassinProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para proponer misión
  const [proposeOption, setProposeOption] = useState<'existing' | 'new'>('existing');
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [userMissions, setUserMissions] = useState<Contract[]>([]);

  // Estados para nueva misión
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionDescription, setNewMissionDescription] = useState('');
  const [newMissionReward, setNewMissionReward] = useState('');
  const [newMissionLocation, setNewMissionLocation] = useState('');
  const [newMissionDeadline, setNewMissionDeadline] = useState('');

  // Estados para envío de monedas
  const [showSendCoinsModal, setShowSendCoinsModal] = useState(false);
  const [coinsToSend, setCoinsToSend] = useState('');
  const [transferMessage, setTransferMessage] = useState('');

  const loadAssassins = useCallback(async () => {
    try {
      setIsLoading(true);
      const assassinsList = await usersApi.getAllAssassins();

      // Filtrar al usuario actual si es un asesino (no mostrarse a sí mismo)
      const filteredList = currentUser?.role === 'assassin'
        ? assassinsList.filter((a) => a.email !== currentUser.email && a.id !== currentUser.id)
        : assassinsList;

      const profiles: AssassinProfile[] = filteredList.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.name,
        nickname: a.nickname || a.name,
        minContractValue: a.minContractValue || 50000,
        averageRatingAllTime: a.averageRatingAllTime || 0,
        averageRatingLastMonth: a.averageRatingLastMonth || 0,
        completedContracts: a.completedContracts || 0,
        specialties: a.specialties || ['Sigilo', 'Combate', 'Precisión'],
        status: a.status,
      }));

      setAssassins(profiles);

      // Cargar misiones del usuario si es contratista
      if (currentUser && currentUser.role === 'contractor') {
        const missions = await missionsApi.getUserMissions();
        setUserMissions(missions);
      }
    } catch (error) {
      console.error('Error loading assassins:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAssassins();
  }, [loadAssassins]);

  const filteredAssassins = useMemo(() => {
    let filtered = [...assassins];

    // Filtrar por búsqueda
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();

      filtered = filtered.filter((assassin) => {
        if (searchBy === 'name') {
          return assassin.name.toLowerCase().includes(searchLower);
        } else if (searchBy === 'nickname') {
          return assassin.nickname.toLowerCase().includes(searchLower);
        } else {
          const nameMatch = assassin.name.toLowerCase().includes(searchLower);
          const nicknameMatch = assassin.nickname.toLowerCase().includes(searchLower);
          return nameMatch || nicknameMatch;
        }
      });
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter((assassin) => assassin.status === filterStatus);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averageRatingAllTime - a.averageRatingAllTime;
        case 'contracts':
          return b.completedContracts - a.completedContracts;
        case 'price':
          return a.minContractValue - b.minContractValue;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, searchBy, filterStatus, sortBy, assassins]);

  const handleViewDetails = (assassin: AssassinProfile) => {
    setSelectedAssassin(assassin);
    setShowDetailModal(true);
  };

  const handleProposeClick = (assassin: AssassinProfile) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (currentUser.role !== 'contractor') {
      alert(isSpanish ? 'Solo los contratistas pueden proponer misiones' : 'Only contractors can propose missions');
      return;
    }

    setSelectedAssassin(assassin);
    setProposeOption('existing');
    setSelectedMissionId('');
    setNewMissionTitle('');
    setNewMissionDescription('');
    setNewMissionReward('');
    setNewMissionLocation('');
    setNewMissionDeadline('');
    setShowProposeModal(true);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssassin || !currentUser) {
      alert(isSpanish ? 'Error al enviar propuesta' : 'Error sending proposal');
      return;
    }

    try {
      // Usar el email del asesino directamente del perfil
      const assassinEmail = selectedAssassin.email;

      if (proposeOption === 'existing') {
        // Proponer misión existente
        if (!selectedMissionId) {
          alert(isSpanish ? 'Selecciona una misión' : 'Select a mission');
          return;
        }

        const mission = userMissions.find((m) => m.id === selectedMissionId);
        if (!mission) return;

        // Actualizar la misión para que sea privada y dirigida a este asesino
        await missionsApi.updateMission(mission.id, {
          targetAssassinId: selectedAssassin.id,
          isPrivate: true,
        });

        // Enviar notificación al asesino
        await notificationsApi.createMissionAssignment(
          assassinEmail,
          currentUser.email,
          currentUser.nickname || currentUser.name,
          mission.id,
          mission.title,
          mission.reward
        );

        alert(
          isSpanish
            ? `¡Misión "${mission.title}" propuesta a ${selectedAssassin.name}!`
            : `Mission "${mission.title}" proposed to ${selectedAssassin.name}!`
        );
      } else {
        // Crear nueva misión privada
        const reward = parseInt(newMissionReward);

        if (!newMissionTitle || !newMissionDescription || isNaN(reward) || reward <= 0) {
          alert(isSpanish ? 'Completa todos los campos requeridos' : 'Complete all required fields');
          return;
        }

        if (reward > (currentUser.coins || 0)) {
          alert(
            isSpanish
              ? `No tienes suficientes monedas. Tienes ${(currentUser.coins || 0).toLocaleString()} y necesitas ${reward.toLocaleString()}`
              : `You don't have enough coins. You have ${(currentUser.coins || 0).toLocaleString()} and need ${reward.toLocaleString()}`
          );
          return;
        }

        // Crear la misión
        const newMission = await missionsApi.createMission({
          title: newMissionTitle,
          description: newMissionDescription,
          reward,
          isPrivate: true,
          targetAssassinId: selectedAssassin.id,
          location: newMissionLocation || undefined,
          deadline: newMissionDeadline || undefined,
        });

        // Enviar notificación al asesino
        await notificationsApi.createMissionAssignment(
          assassinEmail,
          currentUser.email,
          currentUser.nickname || currentUser.name,
          newMission.id,
          newMissionTitle,
          reward
        );

        alert(
          isSpanish
            ? `¡Misión creada y propuesta a ${selectedAssassin.name}!`
            : `Mission created and proposed to ${selectedAssassin.name}!`
        );

        // Refrescar usuario para actualizar monedas
        await refreshUser();
      }

      // Recargar datos
      await loadAssassins();

      setShowProposeModal(false);
      setSelectedAssassin(null);
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert(isSpanish ? 'Error al enviar propuesta' : 'Error sending proposal');
    }
  };

  const handleSendCoins = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !selectedAssassin) {
      alert(isSpanish ? 'Error: Usuario no encontrado' : 'Error: User not found');
      return;
    }

    const amount = parseInt(coinsToSend);
    if (isNaN(amount) || amount <= 0) {
      alert(isSpanish ? 'Ingresa una cantidad válida' : 'Enter a valid amount');
      return;
    }

    if (amount > (currentUser.coins || 0)) {
      alert(isSpanish ? 'No tienes suficientes monedas' : "You don't have enough coins");
      return;
    }

    // Confirmar la transferencia
    const confirmMessage = transferMessage
      ? isSpanish
        ? `¿Confirmas enviar ${amount.toLocaleString()} monedas a ${selectedAssassin.name}?\n\nMensaje: "${transferMessage}"`
        : `Do you confirm sending ${amount.toLocaleString()} coins to ${selectedAssassin.name}?\n\nMessage: "${transferMessage}"`
      : isSpanish
        ? `¿Confirmas enviar ${amount.toLocaleString()} monedas a ${selectedAssassin.name}?`
        : `Do you confirm sending ${amount.toLocaleString()} coins to ${selectedAssassin.name}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // Usar el email directamente del perfil del asesino
      const assassinEmail = selectedAssassin.email;
      
      console.log('💰 Enviando monedas:', { assassinEmail, amount, selectedAssassin });
      
      if (!assassinEmail) {
        alert(isSpanish ? 'Error: Email del asesino no encontrado' : 'Error: Assassin email not found');
        return;
      }

      // Transferir monedas
      await coinsApi.transferCoins(assassinEmail, amount, transferMessage || undefined);

      alert(
        isSpanish
          ? `¡Transferencia exitosa! Has enviado ${amount.toLocaleString()} monedas a ${selectedAssassin.name}.`
          : `Transfer successful! You sent ${amount.toLocaleString()} coins to ${selectedAssassin.name}.`
      );

      // Limpiar el formulario
      setCoinsToSend('');
      setTransferMessage('');
      setShowSendCoinsModal(false);
      setShowDetailModal(false);

      // Refrescar usuario para actualizar monedas
      await refreshUser();
    } catch (error) {
      console.error('Error sending coins:', error);
      alert(isSpanish ? 'Error al enviar monedas' : 'Error sending coins');
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

  return {
    currentUser,
    filteredAssassins,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    selectedAssassin,
    showDetailModal,
    setShowDetailModal,
    showProposeModal,
    setShowProposeModal,
    showAuthModal,
    setShowAuthModal,
    proposeOption,
    setProposeOption,
    selectedMissionId,
    setSelectedMissionId,
    userMissions,
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
    showSendCoinsModal,
    setShowSendCoinsModal,
    coinsToSend,
    setCoinsToSend,
    transferMessage,
    setTransferMessage,
    handleViewDetails,
    handleProposeClick,
    handleSubmitProposal,
    handleSendCoins,
    getStatusColor,
    getStatusText,
    isSpanish,
    isLoading,
  };
};
