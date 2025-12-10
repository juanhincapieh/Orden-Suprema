import { useState, useEffect } from 'react';
import { useAssassin } from './useAssassin';
import { MissionListSection } from './MissionListSection';
import { DebtsSection } from './DebtsSection';
import { RegisterDebtModal } from './RegisterDebtModal';
import { debtService } from '../../services/debtService';
import MissionDetailModal from '../../components/MissionDetailModal';
import { Star, Calendar, Coins } from 'lucide-react';
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
    handleViewDetails,
    reloadMissions
  } = useAssassin();

  // Estado para deudas
  const [debtsIOwe, setDebtsIOwe] = useState<any[]>([]);
  const [debtsOwedToMe, setDebtsOwedToMe] = useState<any[]>([]);
  const [pendingDebts, setPendingDebts] = useState<any[]>([]);
  const [showRegisterDebtModal, setShowRegisterDebtModal] = useState(false);
  const [availableAssassins, setAvailableAssassins] = useState<any[]>([]);

  // Cargar asesinos disponibles
  const loadAssassins = () => {
    try {
      const users = localStorage.getItem('roles');
      const nicknames = localStorage.getItem('nicknames');
      
      if (!users) return;
      
      const rolesDict = JSON.parse(users);
      const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
      
      const assassins = Object.entries(rolesDict)
        .filter(([, role]) => role === 'assassin')
        .map(([email]) => ({
          email,
          name: email.split('@')[0],
          nickname: nicknamesDict[email] || email.split('@')[0]
        }));
      
      setAvailableAssassins(assassins);
      console.log('🗡️ Asesinos disponibles:', assassins);
    } catch (error) {
      console.error('Error loading assassins:', error);
    }
  };

  // Cargar deudas
  const loadDebts = () => {
    try {
      const userIdEncoded = btoa(userEmail);
      const debts = debtService.getDebtsForAssassin(userIdEncoded);
      
      // Obtener todas las deudas del localStorage
      const allDebtsStored = localStorage.getItem('assassinDebts');
      const allDebts = allDebtsStored ? JSON.parse(allDebtsStored) : [];
      
      // Filtrar deudas pendientes que este usuario creó
      const pending = allDebts.filter((debt: any) => 
        debt.debtorId === userIdEncoded && debt.status === 'pending'
      );
      
      setDebtsIOwe(debts.debtsIOwe);
      setDebtsOwedToMe(debts.debtsOwedToMe);
      setPendingDebts(pending);
      console.log('💰 Deudas cargadas:', { ...debts, pending });
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      loadAssassins();
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

  const handleRegisterDebt = (creditorEmail: string, description: string) => {
    try {
      // YO soy el deudor (quien debe), el otro es el acreedor (a quien le debo)
      const debtorId = btoa(userEmail); // YO
      const creditorId = btoa(creditorEmail); // A QUIEN LE DEBO
      
      // Crear la solicitud de favor - YO solicito registrar que LE DEBO al otro
      debtService.createFavorRequest(
        debtorId, // YO (quien debe)
        creditorId, // EL OTRO (quien me hizo el favor)
        description,
        isSpanish ? 'es' : 'en'
      );
      
      alert(isSpanish 
        ? '¡Deuda registrada! El otro asesino debe aceptar que te hizo el favor.'
        : 'Debt registered! The other assassin must accept that they did you the favor.');
      
      setShowRegisterDebtModal(false);
      loadDebts();
    } catch (error: any) {
      console.error('Error registering debt:', error);
      alert(error.message);
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
              <Star className={styles.statIcon} size={20} />
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
              <Calendar className={styles.statIcon} size={20} />
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
            <Coins className={styles.coinIcon} size={20} />
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
          onRefresh={reloadMissions}
        />

        {/* Debts Section */}
        <DebtsSection
          debtsIOwe={debtsIOwe}
          debtsOwedToMe={debtsOwedToMe}
          pendingDebts={pendingDebts}
          currentUser={{ email: userEmail, role: 'assassin', name: userName }}
          isSpanish={isSpanish}
          onRequestPayment={handleRequestPayment}
          onMarkCompleted={handleMarkCompleted}
          getAssassinName={getAssassinName}
          onRefresh={loadDebts}
        />

        {/* Botón flotante para registrar deuda */}
        <button
          className={styles.registerDebtButton}
          onClick={() => setShowRegisterDebtModal(true)}
          title={isSpanish ? 'Registrar nueva deuda' : 'Register new debt'}
        >
          <Coins className={styles.registerDebtIcon} size={20} />
          <span className={styles.registerDebtText}>
            {isSpanish ? 'Registrar Deuda' : 'Register Debt'}
          </span>
        </button>

        {/* Modal de detalles de misión */}
        <MissionDetailModal
          mission={selectedMission}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          currentUser={{ 
            email: userEmail, 
            role: 'assassin', 
            nickname: userName,
            id: btoa(userEmail)
          }}
          isSpanish={isSpanish}
          showNegotiation={false}
          onCompleteMission={(mission) => {
            console.log('💰 Iniciando completar misión:', mission);
            console.log('💰 Email del asesino:', userEmail);
            console.log('💰 Recompensa de la misión:', mission.reward);
            
            // Obtener saldo actual antes del pago
            const coinsBeforeStr = localStorage.getItem('coins');
            const coinsBefore = coinsBeforeStr ? JSON.parse(coinsBeforeStr) : {};
            console.log('💰 Saldo ANTES del pago:', coinsBefore[userEmail] || 0);
            
            // Marcar misión como completada
            const publicMissions = JSON.parse(localStorage.getItem('publicMissions') || '[]');
            const userMissions = JSON.parse(localStorage.getItem('userMissions') || '{}');
            
            let missionFound = false;
            
            // Buscar en misiones públicas
            const publicIndex = publicMissions.findIndex((m: any) => m.id === mission.id);
            if (publicIndex !== -1) {
              console.log('✅ Misión encontrada en publicMissions');
              publicMissions[publicIndex] = {
                ...publicMissions[publicIndex],
                status: 'completed',
                terminado: true,
                updatedAt: new Date().toISOString()
              };
              localStorage.setItem('publicMissions', JSON.stringify(publicMissions));
              missionFound = true;
            } else {
              // Buscar en misiones privadas
              const contractorEmail = atob(mission.contractorId);
              console.log('🔍 Buscando en misiones privadas del contratista:', contractorEmail);
              
              if (userMissions[contractorEmail]) {
                const missionIndex = userMissions[contractorEmail].findIndex((m: any) => m.id === mission.id);
                if (missionIndex !== -1) {
                  console.log('✅ Misión encontrada en userMissions');
                  userMissions[contractorEmail][missionIndex] = {
                    ...userMissions[contractorEmail][missionIndex],
                    status: 'completed',
                    terminado: true,
                    updatedAt: new Date().toISOString()
                  };
                  localStorage.setItem('userMissions', JSON.stringify(userMissions));
                  missionFound = true;
                } else {
                  console.log('❌ Misión NO encontrada en userMissions del contratista');
                }
              } else {
                console.log('❌ No hay misiones para el contratista:', contractorEmail);
              }
            }
            
            if (!missionFound) {
              console.error('❌ ERROR: Misión no encontrada en ningún lugar');
            }
            
            // Pagar al asesino
            const coins = JSON.parse(localStorage.getItem('coins') || '{}');
            const oldBalance = coins[userEmail] || 0;
            const newBalance = oldBalance + mission.reward;
            
            console.log('💰 Calculando pago:');
            console.log('   - Saldo anterior:', oldBalance);
            console.log('   - Recompensa:', mission.reward);
            console.log('   - Nuevo saldo:', newBalance);
            
            coins[userEmail] = newBalance;
            localStorage.setItem('coins', JSON.stringify(coins));
            console.log('💾 Guardado en localStorage coins:', coins[userEmail]);
            
            // Actualizar usuario actual
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            console.log('👤 Usuario actual antes:', currentUser.coins);
            currentUser.coins = newBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('👤 Usuario actual después:', currentUser.coins);
            
            // Verificar que se guardó correctamente
            const coinsAfterStr = localStorage.getItem('coins');
            const coinsAfter = coinsAfterStr ? JSON.parse(coinsAfterStr) : {};
            console.log('💰 Saldo DESPUÉS del pago (verificación):', coinsAfter[userEmail]);
            
            alert(isSpanish 
              ? `¡Misión completada! Has recibido ${mission.reward.toLocaleString()} monedas.\n\nSaldo anterior: ${oldBalance.toLocaleString()}\nNuevo saldo: ${newBalance.toLocaleString()}`
              : `Mission completed! You received ${mission.reward.toLocaleString()} coins.\n\nPrevious balance: ${oldBalance.toLocaleString()}\nNew balance: ${newBalance.toLocaleString()}`);
            
            // Recargar las misiones sin recargar toda la página
            reloadMissions();
          }}
        />

        {/* Modal de registro de deuda */}
        <RegisterDebtModal
          isOpen={showRegisterDebtModal}
          onClose={() => setShowRegisterDebtModal(false)}
          onSubmit={handleRegisterDebt}
          isSpanish={isSpanish}
          currentUserEmail={userEmail}
          availableAssassins={availableAssassins}
        />
      </div>
    </div>
  );
};

export default Assassin;
