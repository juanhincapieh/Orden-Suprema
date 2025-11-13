import { useState, useEffect, useMemo } from 'react';
import { authService } from '../../services/authService';
import { debtService } from '../../services/debtService';
import { transactionService } from '../../services/transactionService';
import { notificationService } from '../../services/notificationService';

export interface AssassinProfile {
  id: string;
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

const mockAssassins: AssassinProfile[] = [
  {
    id: '1',
    name: 'John Wick',
    nickname: 'Baba Yaga',
    minContractValue: 50000,
    averageRatingAllTime: 4.9,
    averageRatingLastMonth: 5.0,
    completedContracts: 127,
    specialties: ['Sigilo', 'Combate cuerpo a cuerpo', 'Armas de fuego'],
    status: 'available'
  },
  {
    id: '2',
    name: 'Vincent Grisset de Gramont',
    nickname: 'El Marqués',
    minContractValue: 100000,
    averageRatingAllTime: 4.8,
    averageRatingLastMonth: 4.9,
    completedContracts: 89,
    specialties: ['Estrategia', 'Coordinación', 'Alta sociedad'],
    status: 'available'
  },
  {
    id: '3',
    name: 'Killa Harkan',
    nickname: 'El Berlinés',
    minContractValue: 75000,
    averageRatingAllTime: 4.7,
    averageRatingLastMonth: 4.8,
    completedContracts: 156,
    specialties: ['Combate', 'Resistencia', 'Intimidación'],
    status: 'busy'
  },
  {
    id: '4',
    name: 'Caine',
    nickname: 'El Ciego',
    minContractValue: 80000,
    averageRatingAllTime: 5.0,
    averageRatingLastMonth: 5.0,
    completedContracts: 203,
    specialties: ['Percepción aumentada', 'Precisión', 'Sigilo'],
    status: 'available'
  },
  {
    id: '5',
    name: 'Sofia Al-Azwar',
    nickname: 'La Guardiana',
    minContractValue: 60000,
    averageRatingAllTime: 4.9,
    averageRatingLastMonth: 4.9,
    completedContracts: 98,
    specialties: ['Tácticas caninas', 'Defensa', 'Infiltración'],
    status: 'available'
  },
  {
    id: '6',
    name: 'Zero',
    nickname: 'El Sushi Master',
    minContractValue: 70000,
    averageRatingAllTime: 4.6,
    averageRatingLastMonth: 4.7,
    completedContracts: 134,
    specialties: ['Armas blancas', 'Sigilo', 'Acrobacia'],
    status: 'available'
  },
  {
    id: '7',
    name: 'Akira',
    nickname: 'La Sombra',
    minContractValue: 55000,
    averageRatingAllTime: 4.8,
    averageRatingLastMonth: 4.9,
    completedContracts: 112,
    specialties: ['Ninjutsu', 'Venenos', 'Desaparición'],
    status: 'busy'
  },
  {
    id: '8',
    name: 'Cassian',
    nickname: 'El Vengador',
    minContractValue: 65000,
    averageRatingAllTime: 4.7,
    averageRatingLastMonth: 4.6,
    completedContracts: 87,
    specialties: ['Rastreo', 'Combate', 'Persistencia'],
    status: 'available'
  }
];

export const useAssassins = () => {
  const currentUser = authService.getCurrentUser();
  const [assassins, setAssassins] = useState<AssassinProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'both' | 'name' | 'nickname'>('both');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'contracts' | 'price'>('rating');
  const [selectedAssassin, setSelectedAssassin] = useState<AssassinProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Estados para proponer misión
  const [proposeOption, setProposeOption] = useState<'existing' | 'new'>('existing');
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [userMissions, setUserMissions] = useState<any[]>([]);
  
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

  const isSpanish = navigator.language.toLowerCase().startsWith('es');

  const loadAssassins = () => {
    // Simular carga de datos
    setAssassins(mockAssassins);
    
    // Cargar misiones del usuario si es contratista
    if (currentUser && currentUser.role === 'contractor') {
      const missions = authService.getUserMissions(currentUser.email);
      const publicMissions = authService.getPublicMissions().filter(
        m => m.contractorId === currentUser.id
      );
      setUserMissions([...missions, ...publicMissions]);
    }
  };

  useEffect(() => {
    loadAssassins();
  }, [currentUser]);

  const filteredAssassins = useMemo(() => {
    console.log('🔍 Recalculando asesinos filtrados:', { searchTerm, searchBy, filterStatus, sortBy });
    console.log('📋 Array fuente:', assassins.length, 'asesinos');
    let filtered = [...assassins];

    // Filtrar por búsqueda
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      console.log('Buscando:', searchLower, 'en campo:', searchBy);
      
      filtered = filtered.filter((assassin) => {
        if (searchBy === 'name') {
          const matches = assassin.name.toLowerCase().includes(searchLower);
          console.log(`  ${assassin.name}: ${matches ? '✓' : '✗'} (nombre)`);
          return matches;
        } else if (searchBy === 'nickname') {
          const matches = assassin.nickname.toLowerCase().includes(searchLower);
          console.log(`  ${assassin.nickname}: ${matches ? '✓' : '✗'} (apodo)`);
          return matches;
        } else {
          // 'both' o default
          const nameMatch = assassin.name.toLowerCase().includes(searchLower);
          const nicknameMatch = assassin.nickname.toLowerCase().includes(searchLower);
          const matches = nameMatch || nicknameMatch;
          console.log(`  ${assassin.name} / ${assassin.nickname}: ${matches ? '✓' : '✗'} (ambos)`);
          return matches;
        }
      });
      
      console.log('Resultados después de búsqueda:', filtered.length);
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter((assassin) => assassin.status === filterStatus);
      console.log('Resultados después de filtro de estado:', filtered.length);
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

    console.log('✅ Total de asesinos filtrados:', filtered.length, 'IDs:', filtered.map(a => a.id));
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

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssassin || !currentUser) {
      alert(isSpanish ? 'Error al enviar propuesta' : 'Error sending proposal');
      return;
    }

    if (proposeOption === 'existing') {
      // Proponer misión existente
      if (!selectedMissionId) {
        alert(isSpanish ? 'Selecciona una misión' : 'Select a mission');
        return;
      }

      const mission = userMissions.find(m => m.id === selectedMissionId);
      if (!mission) return;

      // Actualizar la misión para que sea privada y dirigida a este asesino
      if (mission.isPrivate) {
        authService.updateMission(currentUser.email, mission.id, {
          targetAssassinId: selectedAssassin.id,
          isPrivate: true
        });
      } else {
        authService.updatePublicMission(mission.id, {
          targetAssassinId: selectedAssassin.id,
          isPrivate: true
        });
      }

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

      if (reward > currentUser.coins) {
        alert(
          isSpanish
            ? `No tienes suficientes monedas. Tienes ${currentUser.coins.toLocaleString()} y necesitas ${reward.toLocaleString()}`
            : `You don't have enough coins. You have ${currentUser.coins.toLocaleString()} and need ${reward.toLocaleString()}`
        );
        return;
      }

      const newMission = {
        id: Date.now().toString(),
        title: newMissionTitle,
        description: newMissionDescription,
        reward,
        status: 'open',
        terminado: false,
        contractorId: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPrivate: true,
        targetAssassinId: selectedAssassin.id,
        location: newMissionLocation || undefined,
        deadline: newMissionDeadline || undefined
      };

      authService.updateCoins(currentUser.email, -reward);
      authService.addMission(currentUser.email, newMission);

      alert(
        isSpanish
          ? `¡Misión creada y propuesta a ${selectedAssassin.name}!`
          : `Mission created and proposed to ${selectedAssassin.name}!`
      );

      // Recargar la lista de asesinos
      loadAssassins();
    }

    setShowProposeModal(false);
    setSelectedAssassin(null);
  };

  const handleSendCoins = (e: React.FormEvent) => {
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

    if (amount > currentUser.coins) {
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
      // Obtener el email del asesino desde su ID (que está en base64)
      const assassinEmail = atob(selectedAssassin.id);

      // Descontar monedas del remitente
      const success = authService.updateCoins(currentUser.email, -amount);
      if (!success) {
        alert(isSpanish ? 'Error al procesar la transferencia' : 'Error processing transfer');
        return;
      }

      // Agregar monedas al receptor
      authService.updateCoins(assassinEmail, amount);

      // Registrar las transacciones
      transactionService.addTransfer(
        currentUser.email,
        currentUser.nickname,
        assassinEmail,
        selectedAssassin.name,
        amount,
        transferMessage || undefined
      );

      // Crear notificación para el receptor
      notificationService.addTransferNotification(
        assassinEmail,
        currentUser.email,
        currentUser.nickname,
        amount,
        transferMessage || undefined
      );

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

      // Nota: El saldo se actualizará cuando el usuario navegue o cuando se refresque el Header
      // Para una actualización inmediata, se necesitaría un contexto global o callback
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
    isSpanish
  };
};
