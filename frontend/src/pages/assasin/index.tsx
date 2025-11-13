import { useState, useEffect } from 'react';
import { useAssassin } from './useAssassin';
import { MissionListSection } from './MissionListSection';
import { DebtsSection } from './DebtsSection';
import { debtService } from '../../services/debtService';
import MissionDetailModal from '../../components/MissionDetailModal';
import styles from './Assassin.module.css';

const Assassin = () => {
  const {
    userName,
    userEmail,
    userCoins,
    userReputationAllTime,
    userReputationLastMonth,
    viewMode,
    handleViewModeChange,
    showFilters,
    toggleFilters,
    isSpanish,
    filters,
    handleFilterChange,
    handleSortChange,
    filteredMissions,
    activeMissionsCount,
    historyMissionsCount,
    getContractorName,
    formatDate,
    formatCurrency,
    getMissionStatus,
    navigate,
    selectedMission,
    showDetailModal,
    setShowDetailModal,
    handleViewDetails
  } = useAssassin();

  // Estado para deudas
  const [debtsIOwe, setDebtsIOwe] = useState<any[]>([]);
  const [debtsOwedToMe, setDebtsOwedToMe] = useState<any[]>([]);

  // Cargar deudas
  const loadDebts = () => {
    try {
      const userIdEncoded = btoa(userEmail);
      const debts = debtService.getDebtsForAssassin(userIdEncoded);
      setDebtsIOwe(debts.debtsIOwe);
      setDebtsOwedToMe(debts.debtsOwedToMe);
      console.log('💰 Deudas cargadas:', debts);
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      loadDebts();
    }
  }, [userEmail]);

  // Handlers para deudas
  const handleRequestPayment = (debtId: string, description: string) => {
    try {
      debtService.requestPayment(debtId, description);
      alert(isSpanish ? '¡Solicitud de pago enviada!' : 'Payment request sent!');
      loadDebts();
    } catch (error: any) {
      console.error('Error requesting payment:', error);
      alert(error.message);
    }
  };

  const handleMarkCompleted = (debtId: string) => {
    try {
      debtService.markAsCompleted(debtId);
      alert(isSpanish 
        ? 'Solicitud de completación enviada al acreedor' 
        : 'Completion request sent to creditor');
      loadDebts();
    } catch (error: any) {
      console.error('Error marking as completed:', error);
      alert(error.message);
    }
  };

  const getAssassinName = (assassinId: string): string => {
    try {
      const email = atob(assassinId);
      const nicknames = localStorage.getItem('nicknames');
      const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
      return nicknamesDict[email] || email;
    } catch {
      return 'Unknown';
    }
  };

  // Mostrar loading si no hay datos del usuario
  if (!userEmail || !userName) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {isSpanish ? 'Cargando...' : 'Loading...'}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isSpanish ? 'Panel del Asesino' : 'Assassin Dashboard'}
          </h1>
        </div>

        {/* User Card */}
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{userName}</h2>
            <p className={styles.userEmail}>{userEmail}</p>
          </div>
          
          {/* Reputation Stats */}
          <div className={styles.userStats}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>⭐</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {userReputationAllTime > 0 
                    ? userReputationAllTime.toFixed(1) 
                    : (isSpanish ? 'N/A' : 'N/A')}
                </span>
                <span className={styles.statLabel}>
                  {isSpanish ? 'Histórica' : 'All-time'}
                </span>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <span className={styles.statIcon}>📅</span>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {userReputationLastMonth > 0 
                    ? userReputationLastMonth.toFixed(1) 
                    : (isSpanish ? 'N/A' : 'N/A')}
                </span>
                <span className={styles.statLabel}>
                  {isSpanish ? 'Último mes' : 'Last month'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.userCoins}>
            <span className={styles.coinIcon}>🪙</span>
            <span className={styles.coinAmount}>{formatCurrency(userCoins)}</span>
          </div>
        </div>

        {/* Mission List Section */}
        <MissionListSection
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          showFilters={showFilters}
          onToggleFilters={toggleFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          missions={filteredMissions}
          activeMissionsCount={activeMissionsCount}
          historyMissionsCount={historyMissionsCount}
          isSpanish={isSpanish}
          getContractorName={getContractorName}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          getMissionStatus={getMissionStatus}
          navigate={navigate}
          onViewDetails={handleViewDetails}
        />

        {/* Debts Section */}
        <DebtsSection
          debtsIOwe={debtsIOwe}
          debtsOwedToMe={debtsOwedToMe}
          currentUser={{ email: userEmail, role: 'assassin', name: userName }}
          isSpanish={isSpanish}
          onRequestPayment={handleRequestPayment}
          onMarkCompleted={handleMarkCompleted}
          getAssassinName={getAssassinName}
          onRefresh={loadDebts}
        />

        {/* Modal de detalles de misión */}
        <MissionDetailModal
          mission={selectedMission}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          currentUser={{ email: userEmail, role: 'assassin', nickname: userName }}
          isSpanish={isSpanish}
          showNegotiation={false}
        />
      </div>
    </div>
  );
};

export default Assassin;
