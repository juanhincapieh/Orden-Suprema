import { useState, useEffect } from 'react';
import { Contract, Review } from '../../types';
import { authService } from '../../services/authService';
import { transactionService } from '../../services/transactionService';

export const useContractor = () => {
  const currentUser = authService.getCurrentUser();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [missionReward, setMissionReward] = useState('');
  const [missionLocation, setMissionLocation] = useState('');
  const [missionDeadline, setMissionDeadline] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [targetAssassinId, setTargetAssassinId] = useState('');

  const isSpanish = navigator.language.toLowerCase().startsWith('es');

  useEffect(() => {
    if (currentUser) {
      const userMissions = authService.getUserMissions(currentUser.email);
      setContracts(userMissions);
    }
  }, [currentUser]);

  const handleReviewClick = (contract: Contract) => {
    setSelectedContract(contract);
    if (contract.review) {
      setRating(contract.review.rating);
      setComment(contract.review.comment);
    } else {
      setRating(0);
      setComment('');
    }
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (!selectedContract || rating === 0 || !currentUser) {
      alert(isSpanish ? 'Por favor selecciona una calificación' : 'Please select a rating');
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      contractId: selectedContract.id,
      rating,
      comment,
      createdAt: new Date()
    };

    const updatedContract = { ...selectedContract, review: newReview };
    
    authService.updateMission(currentUser.email, selectedContract.id, { review: newReview });
    
    setContracts(contracts.map(c => 
      c.id === selectedContract.id ? updatedContract : c
    ));

    setShowReviewModal(false);
    setSelectedContract(null);
    setRating(0);
    setComment('');
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetailModal(true);
  };

  const handleReportClick = (contract: Contract) => {
    setSelectedContract(contract);
    setReportDescription('');
    setShowReportModal(true);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContract || !currentUser || !reportDescription.trim()) {
      alert(isSpanish ? 'Por favor describe el problema' : 'Please describe the issue');
      return;
    }

    const newReport = {
      id: Date.now().toString(),
      contractId: selectedContract.id,
      contractTitle: selectedContract.title,
      reporterEmail: currentUser.email,
      reporterName: currentUser.nickname,
      description: reportDescription,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    authService.addReport(newReport);

    alert(
      isSpanish
        ? '¡Reporte enviado exitosamente! Un administrador lo revisará pronto.'
        : 'Report submitted successfully! An admin will review it soon.'
    );

    setShowReportModal(false);
    setSelectedContract(null);
    setReportDescription('');
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert(isSpanish ? 'Debes iniciar sesión' : 'You must log in');
      return;
    }

    const reward = parseInt(missionReward);

    if (reward > currentUser.coins) {
      alert(
        isSpanish
          ? `No tienes suficientes monedas. Tienes ${currentUser.coins.toLocaleString()} y necesitas ${reward.toLocaleString()}`
          : `You don't have enough coins. You have ${currentUser.coins.toLocaleString()} and need ${reward.toLocaleString()}`
      );
      return;
    }

    if (isPrivate && !targetAssassinId) {
      alert(isSpanish ? 'Selecciona un asesino para la misión privada' : 'Select an assassin for the private mission');
      return;
    }

    const newContract: Contract = {
      id: Date.now().toString(),
      title: missionTitle,
      description: missionDescription,
      reward,
      status: 'open',
      terminado: false,
      contractorId: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPrivate,
      targetAssassinId: isPrivate ? targetAssassinId : undefined,
      location: missionLocation || undefined,
      deadline: missionDeadline || undefined
    };

    authService.updateCoins(currentUser.email, -reward);
    
    if (isPrivate) {
      // Misión privada: agregar a las misiones del usuario
      authService.addMission(currentUser.email, newContract);
    } else {
      // Misión pública: agregar al listado público
      authService.addPublicMission(newContract);
    }

    setContracts([newContract, ...contracts]);

    setMissionTitle('');
    setMissionDescription('');
    setMissionReward('');
    setMissionLocation('');
    setMissionDeadline('');
    setIsPrivate(false);
    setTargetAssassinId('');
    setShowCreateModal(false);

    alert(
      isSpanish
        ? '¡Misión creada exitosamente!'
        : 'Mission created successfully!'
    );

    // Recargar las misiones del usuario
    if (currentUser) {
      const updatedMissions = authService.getUserMissions(currentUser.email);
      setContracts(updatedMissions);
    }
  };

  const handleAcceptNegotiation = (mission: Contract) => {
    if (!currentUser || !mission.negotiation) return;

    if (confirm(isSpanish 
      ? `¿Aceptar la propuesta de ${mission.negotiation.proposedReward.toLocaleString()} monedas?`
      : `Accept the proposal of ${mission.negotiation.proposedReward.toLocaleString()} coins?`)) {
      
      // Actualizar la negociación
      authService.updateNegotiation(mission.negotiation.id, {
        status: 'accepted',
        respondedAt: new Date().toISOString()
      });

      // Actualizar la misión con el nuevo valor y asignar al asesino
      const updatedMission = {
        ...mission,
        reward: mission.negotiation.proposedReward,
        status: 'in_progress' as const,
        assassinId: mission.negotiation.proposedByEmail,
        assassinName: mission.negotiation.proposedByName,
        negotiation: undefined
      };

      // Actualizar en la lista correspondiente
      if (mission.isPrivate && currentUser) {
        authService.updateMission(currentUser.email, mission.id, updatedMission);
      } else {
        authService.updatePublicMission(mission.id, updatedMission);
      }

      // Agregar misión al asesino
      authService.addMission(mission.negotiation.proposedByEmail, updatedMission);

      alert(isSpanish 
        ? '¡Propuesta aceptada! La misión ha sido asignada.'
        : 'Proposal accepted! Mission has been assigned.');

      // Recargar las misiones del usuario
      if (currentUser) {
        const updatedMissions = authService.getUserMissions(currentUser.email);
        setContracts(updatedMissions);
      }
      setShowDetailModal(false);
    }
  };

  const handleCompleteMission = (mission: Contract) => {
    if (!currentUser) return;

    // Marcar la misión como completada
    const updatedMission = {
      ...mission,
      terminado: true,
      status: 'completed' as const,
      completedAt: new Date()
    };

    // Actualizar la misión
    authService.updateMission(currentUser.email, mission.id, updatedMission);

    // Pagar al asesino
    if (mission.assassinId) {
      const assassinEmail = atob(mission.assassinId);
      authService.updateCoins(assassinEmail, mission.reward);

      // Registrar la transacción de recompensa
      const nicknames = localStorage.getItem('nicknames');
      const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
      const assassinName = nicknamesDict[assassinEmail] || mission.assassinName || assassinEmail;

      transactionService.addReward(
        assassinEmail,
        assassinName,
        mission.reward,
        `Recompensa por misión completada: ${mission.title}`
      );

      alert(
        isSpanish
          ? `¡Misión completada! Se han transferido ${mission.reward.toLocaleString()} monedas a ${assassinName}.`
          : `Mission completed! ${mission.reward.toLocaleString()} coins have been transferred to ${assassinName}.`
      );
    }

    // Recargar las misiones
    const updatedMissions = authService.getUserMissions(currentUser.email);
    setContracts(updatedMissions);
    setShowDetailModal(false);
  };

  const handleRejectNegotiation = (mission: Contract) => {
    if (!mission.negotiation) return;

    if (confirm(isSpanish 
      ? '¿Rechazar esta propuesta?'
      : 'Reject this proposal?')) {
      
      // Actualizar la negociación
      authService.updateNegotiation(mission.negotiation.id, {
        status: 'rejected',
        respondedAt: new Date().toISOString()
      });

      // Volver la misión a estado abierto
      const updatedMission = {
        status: 'open',
        negotiation: undefined
      };

      // Actualizar en la lista correspondiente
      if (currentUser && mission.isPrivate) {
        authService.updateMission(currentUser.email, mission.id, updatedMission);
      } else {
        authService.updatePublicMission(mission.id, updatedMission);
      }

      alert(isSpanish 
        ? 'Propuesta rechazada. La misión vuelve a estar abierta.'
        : 'Proposal rejected. Mission is open again.');

      // Recargar las misiones del usuario
      if (currentUser) {
        const updatedMissions = authService.getUserMissions(currentUser.email);
        setContracts(updatedMissions);
      }
      setShowDetailModal(false);
    }
  };

  return {
    currentUser,
    contracts,
    selectedContract,
    showReviewModal,
    setShowReviewModal,
    rating,
    setRating,
    hoveredRating,
    setHoveredRating,
    comment,
    setComment,
    showCreateModal,
    setShowCreateModal,
    showReportModal,
    setShowReportModal,
    showDetailModal,
    setShowDetailModal,
    reportDescription,
    setReportDescription,
    missionTitle,
    setMissionTitle,
    missionDescription,
    setMissionDescription,
    missionReward,
    setMissionReward,
    missionLocation,
    setMissionLocation,
    missionDeadline,
    setMissionDeadline,
    isPrivate,
    setIsPrivate,
    targetAssassinId,
    setTargetAssassinId,
    isSpanish,
    handleReviewClick,
    handleSubmitReview,
    handleViewDetails,
    handleReportClick,
    handleSubmitReport,
    handleCreateMission,
    handleAcceptNegotiation,
    handleRejectNegotiation,
    handleCompleteMission,
    getStatusColor,
    getStatusText
  };
};

// Funciones auxiliares
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

const getStatusText = (status: string, isSpanish: boolean) => {
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
