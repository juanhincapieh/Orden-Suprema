import { useState, useEffect, useCallback } from 'react';
import { Contract, Review } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { missionsApi, reportsApi } from '../../services/api';

export const useContractor = () => {
  const { isSpanish } = useLanguage();
  const { user: currentUser, refreshUser } = useAuth();
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
  const [isLoading, setIsLoading] = useState(true);

  const [missionTitle, setMissionTitle] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [missionReward, setMissionReward] = useState('');
  const [missionLocation, setMissionLocation] = useState('');
  const [missionDeadline, setMissionDeadline] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [targetAssassinId, setTargetAssassinId] = useState('');

  const loadContracts = useCallback(async () => {
    if (currentUser) {
      try {
        setIsLoading(true);
        const userMissions = await missionsApi.getUserMissions();
        setContracts(userMissions);
      } catch (error) {
        console.error('Error loading contracts:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

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

  const handleSubmitReview = async () => {
    if (!selectedContract || rating === 0 || !currentUser) {
      alert(isSpanish ? 'Por favor selecciona una calificación' : 'Please select a rating');
      return;
    }

    try {
      const newReview: Review = {
        id: Date.now().toString(),
        contractId: selectedContract.id,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };

      await missionsApi.updateMission(selectedContract.id, { review: newReview });

      setContracts(
        contracts.map((c) => (c.id === selectedContract.id ? { ...c, review: newReview } : c))
      );

      setShowReviewModal(false);
      setSelectedContract(null);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(isSpanish ? 'Error al enviar reseña' : 'Error submitting review');
    }
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

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContract || !currentUser || !reportDescription.trim()) {
      alert(isSpanish ? 'Por favor describe el problema' : 'Please describe the issue');
      return;
    }

    try {
      await reportsApi.create({
        contractId: selectedContract.id,
        contractTitle: selectedContract.title,
        reporterEmail: currentUser.email,
        reporterName: currentUser.nickname,
        description: reportDescription,
      });

      alert(
        isSpanish
          ? '¡Reporte enviado exitosamente! Un administrador lo revisará pronto.'
          : 'Report submitted successfully! An admin will review it soon.'
      );

      setShowReportModal(false);
      setSelectedContract(null);
      setReportDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(isSpanish ? 'Error al enviar reporte' : 'Error submitting report');
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert(isSpanish ? 'Debes iniciar sesión' : 'You must log in');
      return;
    }

    const reward = parseInt(missionReward);

    if (reward > (currentUser.coins || 0)) {
      alert(
        isSpanish
          ? `No tienes suficientes monedas. Tienes ${(currentUser.coins || 0).toLocaleString()} y necesitas ${reward.toLocaleString()}`
          : `You don't have enough coins. You have ${(currentUser.coins || 0).toLocaleString()} and need ${reward.toLocaleString()}`
      );
      return;
    }

    if (isPrivate && !targetAssassinId) {
      alert(
        isSpanish ? 'Selecciona un asesino para la misión privada' : 'Select an assassin for the private mission'
      );
      return;
    }

    try {
      await missionsApi.createMission({
        title: missionTitle,
        description: missionDescription,
        reward,
        isPrivate,
        targetAssassinId: isPrivate ? targetAssassinId : undefined,
        location: missionLocation || undefined,
        deadline: missionDeadline || undefined,
      });

      setMissionTitle('');
      setMissionDescription('');
      setMissionReward('');
      setMissionLocation('');
      setMissionDeadline('');
      setIsPrivate(false);
      setTargetAssassinId('');
      setShowCreateModal(false);

      alert(isSpanish ? '¡Misión creada exitosamente!' : 'Mission created successfully!');

      // Refrescar usuario y misiones
      await refreshUser();
      await loadContracts();
    } catch (error) {
      console.error('Error creating mission:', error);
      alert(isSpanish ? 'Error al crear misión' : 'Error creating mission');
    }
  };

  const handleAcceptNegotiation = async (mission: Contract) => {
    if (!currentUser || !mission.negotiation) return;

    if (
      confirm(
        isSpanish
          ? `¿Aceptar la propuesta de ${mission.negotiation.proposedReward.toLocaleString()} monedas?`
          : `Accept the proposal of ${mission.negotiation.proposedReward.toLocaleString()} coins?`
      )
    ) {
      try {
        // Asignar la misión al asesino que propuso
        const assassinId = btoa(mission.negotiation.proposedByEmail);
        await missionsApi.assignMission(mission.id, assassinId);

        // Actualizar la misión con el nuevo reward
        await missionsApi.updateMission(mission.id, {
          reward: mission.negotiation.proposedReward,
        });

        alert(isSpanish ? '¡Propuesta aceptada! La misión ha sido asignada.' : 'Proposal accepted! Mission has been assigned.');

        await loadContracts();
        setShowDetailModal(false);
      } catch (error) {
        console.error('Error accepting negotiation:', error);
        alert(isSpanish ? 'Error al aceptar propuesta' : 'Error accepting proposal');
      }
    }
  };

  const handleCompleteMission = async (mission: Contract) => {
    if (!currentUser) return;

    try {
      await missionsApi.completeMission(mission.id);

      alert(
        isSpanish
          ? `¡Misión completada! Se han transferido ${mission.reward.toLocaleString()} monedas al asesino.`
          : `Mission completed! ${mission.reward.toLocaleString()} coins have been transferred to the assassin.`
      );

      await loadContracts();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error completing mission:', error);
      alert(isSpanish ? 'Error al completar misión' : 'Error completing mission');
    }
  };

  const handleRejectNegotiation = async (mission: Contract) => {
    if (!mission.negotiation) return;

    if (confirm(isSpanish ? '¿Rechazar esta propuesta?' : 'Reject this proposal?')) {
      try {
        await missionsApi.updateMission(mission.id, {
          status: 'open',
          negotiation: undefined,
        });

        alert(
          isSpanish ? 'Propuesta rechazada. La misión vuelve a estar abierta.' : 'Proposal rejected. Mission is open again.'
        );

        await loadContracts();
        setShowDetailModal(false);
      } catch (error) {
        console.error('Error rejecting negotiation:', error);
        alert(isSpanish ? 'Error al rechazar propuesta' : 'Error rejecting proposal');
      }
    }
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
    isLoading,
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
    getStatusText,
  };
};
