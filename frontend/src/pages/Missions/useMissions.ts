import { useState, useEffect } from 'react';
import { Contract, Negotiation } from '../../types';
import { authService } from '../../services/authService';

export const useMissions = () => {
  const currentUser = authService.getCurrentUser();
  const [missions, setMissions] = useState<Contract[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'negotiating'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'reward' | 'deadline'>('recent');
  
  const [selectedMission, setSelectedMission] = useState<Contract | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  
  const [proposedReward, setProposedReward] = useState('');
  const [negotiationMessage, setNegotiationMessage] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [acceptedMission, setAcceptedMission] = useState<Contract | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isSpanish = navigator.language.toLowerCase().startsWith('es');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = () => {
    const publicMissions = authService.getPublicMissions();
    setMissions(publicMissions);
    setFilteredMissions(publicMissions);
  };

  useEffect(() => {
    let filtered = [...missions];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (mission) =>
          mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mission.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter((mission) => mission.status === filterStatus);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'reward':
          return b.reward - a.reward;
        case 'deadline':
          if (!a.deadline || !b.deadline) return 0;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        default:
          return 0;
      }
    });

    setFilteredMissions(filtered);
  }, [searchTerm, filterStatus, sortBy, missions]);

  const handleViewDetails = (mission: Contract) => {
    setSelectedMission(mission);
    setShowDetailModal(true);
  };

  const handleNegotiateClick = (mission: Contract) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setSelectedMission(mission);
    setProposedReward(mission.reward.toString());
    setNegotiationMessage('');
    setShowNegotiateModal(true);
  };

  const handleSubmitNegotiation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMission || !currentUser) {
      alert(isSpanish ? 'Debes iniciar sesión' : 'You must log in');
      return;
    }

    const reward = parseInt(proposedReward);
    if (isNaN(reward) || reward <= 0) {
      alert(isSpanish ? 'Ingresa un valor válido' : 'Enter a valid value');
      return;
    }

    const negotiation: Negotiation = {
      id: Date.now().toString(),
      contractId: selectedMission.id,
      proposedBy: currentUser.role === 'contractor' ? 'contractor' : 'assassin',
      proposedByEmail: currentUser.email,
      proposedByName: currentUser.nickname,
      proposedReward: reward,
      message: negotiationMessage,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    authService.addNegotiation(negotiation);

    // Actualizar estado de la misión
    authService.updatePublicMission(selectedMission.id, {
      status: 'negotiating',
      negotiation
    });

    alert(
      isSpanish
        ? '¡Propuesta enviada exitosamente!'
        : 'Proposal sent successfully!'
    );

    setShowNegotiateModal(false);
    setSelectedMission(null);
    setProposedReward('');
    setNegotiationMessage('');
    loadMissions();
  };

  const handleAcceptMission = (mission: Contract) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (currentUser.role !== 'assassin') {
      alert(isSpanish ? 'Solo los asesinos pueden aceptar misiones' : 'Only assassins can accept missions');
      return;
    }

    // Actualizar la misión pública
    authService.updatePublicMission(mission.id, {
      status: 'in_progress',
      assassinId: currentUser.id,
      assassinName: currentUser.nickname,
      updatedAt: new Date()
    });

    // Agregar la misión a las misiones del asesino
    const assignedMission: Contract = {
      ...mission,
      status: 'in_progress' as const,
      assassinId: currentUser.id,
      assassinName: currentUser.nickname,
      updatedAt: new Date()
    };

    authService.addMission(currentUser.email, assignedMission);

    // Mostrar modal de éxito
    setAcceptedMission(assignedMission);
    setShowSuccessModal(true);

    // Recargar misiones
    loadMissions();
  };

  const handleAcceptCurrentTerms = (mission: Contract) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (currentUser.role !== 'assassin') {
      alert(isSpanish ? 'Solo los asesinos pueden aceptar misiones' : 'Only assassins can accept missions');
      return;
    }

    // Actualizar la misión pública
    authService.updatePublicMission(mission.id, {
      status: 'in_progress',
      assassinId: currentUser.id,
      assassinName: currentUser.nickname,
      updatedAt: new Date()
    });

    // Agregar la misión a las misiones del asesino
    const assignedMission: Contract = {
      ...mission,
      status: 'in_progress' as const,
      assassinId: currentUser.id,
      assassinName: currentUser.nickname,
      updatedAt: new Date()
    };

    authService.addMission(currentUser.email, assignedMission);

    // Cerrar modal de negociación
    setShowNegotiateModal(false);

    // Mostrar modal de éxito
    setAcceptedMission(assignedMission);
    setShowSuccessModal(true);

    // Recargar misiones
    loadMissions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#4ade80';
      case 'negotiating':
        return '#f59e0b';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#8b5cf6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#808080';
    }
  };

  const getStatusText = (status: string) => {
    if (isSpanish) {
      switch (status) {
        case 'open':
          return 'Abierta';
        case 'negotiating':
          return 'En negociación';
        case 'in_progress':
          return 'En progreso';
        case 'completed':
          return 'Completada';
        case 'cancelled':
          return 'Cancelada';
        default:
          return status;
      }
    }
    
    switch (status) {
      case 'open':
        return 'Open';
      case 'negotiating':
        return 'Negotiating';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return {
    currentUser,
    filteredMissions,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    selectedMission,
    showDetailModal,
    setShowDetailModal,
    showNegotiateModal,
    setShowNegotiateModal,
    showSuccessModal,
    setShowSuccessModal,
    showAuthModal,
    setShowAuthModal,
    acceptedMission,
    proposedReward,
    setProposedReward,
    negotiationMessage,
    setNegotiationMessage,
    handleViewDetails,
    handleNegotiateClick,
    handleSubmitNegotiation,
    handleAcceptMission,
    handleAcceptCurrentTerms,
    getStatusColor,
    getStatusText,
    isSpanish
  };
};
