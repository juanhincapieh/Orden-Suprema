import { useNavigate } from 'react-router-dom';
import { useAssassins } from './useAssassins';
import { RequestFavorButton } from './RequestFavorButton';
import { debtService } from '../../services/debtService';
import styles from './Assassins.module.css';

const Assassins = () => {
  const navigate = useNavigate();
  const {
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
  } = useAssassins();

  console.log('🎨 Assassins render:', {
    filteredCount: filteredAssassins.length,
    searchBy,
    filterStatus,
    sortBy,
    assassinIds: filteredAssassins.map(a => a.id)
  });

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {isSpanish ? 'DIRECTORIO DE ASESINOS' : 'ASSASSINS DIRECTORY'}
        </h1>

        <p className={styles.subtitle}>
          {isSpanish
            ? 'Encuentra al profesional perfecto para tu misión'
            : 'Find the perfect professional for your mission'}
        </p>

        {/* Filtros y búsqueda */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={
                searchBy === 'name'
                  ? isSpanish ? 'Buscar por nombre...' : 'Search by name...'
                  : searchBy === 'nickname'
                  ? isSpanish ? 'Buscar por apodo...' : 'Search by nickname...'
                  : isSpanish ? 'Buscar por nombre o apodo...' : 'Search by name or nickname...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as any)}
              className={styles.select}
            >
              <option value="both">{isSpanish ? 'Nombre y apodo' : 'Name and nickname'}</option>
              <option value="name">{isSpanish ? 'Solo nombre' : 'Name only'}</option>
              <option value="nickname">{isSpanish ? 'Solo apodo' : 'Nickname only'}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={styles.select}
            >
              <option value="all">{isSpanish ? 'Todos los estados' : 'All statuses'}</option>
              <option value="available">{isSpanish ? 'Disponibles' : 'Available'}</option>
              <option value="busy">{isSpanish ? 'Ocupados' : 'Busy'}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.select}
            >
              <option value="rating">{isSpanish ? 'Mejor calificación' : 'Best rating'}</option>
              <option value="contracts">{isSpanish ? 'Más contratos' : 'Most contracts'}</option>
              <option value="price">{isSpanish ? 'Menor precio' : 'Lowest price'}</option>
            </select>
          </div>
        </div>

        {/* Lista de asesinos */}
        <div className={styles.assassinsGrid} key={`grid-${searchTerm}-${searchBy}-${filterStatus}-${sortBy}`}>
          {filteredAssassins.map((assassin) => {
            const isTarget = debtService.isTarget(assassin.id);
            const targetInfo = isTarget ? debtService.getTargetInfo(assassin.id) : null;
            
            return (
              <div key={assassin.id} className={`${styles.assassinCard} ${isTarget ? styles.targetCard : ''}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {assassin.name.charAt(0)}
                  </div>
                  <div className={styles.statusBadges}>
                    <div
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(assassin.status) }}
                    >
                      {getStatusText(assassin.status)}
                    </div>
                    {isTarget && (
                      <div 
                        className={styles.targetBadge}
                        title={targetInfo?.reason || (isSpanish ? 'Rechazó pagar una deuda' : 'Rejected debt payment')}
                      >
                        🎯 {isSpanish ? 'OBJETIVO' : 'TARGET'}
                      </div>
                    )}
                  </div>
                </div>

              <div className={styles.cardBody}>
                <h3 className={styles.assassinName}>{assassin.name}</h3>
                <p className={styles.assassinNickname}>"{assassin.nickname}"</p>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>
                      {isSpanish ? 'Valor mínimo' : 'Min. value'}
                    </span>
                    <span className={styles.statValue}>
                      🪙 {assassin.minContractValue.toLocaleString()}
                    </span>
                  </div>

                  <div className={styles.stat}>
                    <span className={styles.statLabel}>
                      {isSpanish ? 'Puntuación histórica' : 'All-time rating'}
                    </span>
                    <span className={styles.statValue}>
                      ⭐ {assassin.averageRatingAllTime.toFixed(1)}
                    </span>
                  </div>

                  <div className={styles.stat}>
                    <span className={styles.statLabel}>
                      {isSpanish ? 'Último mes' : 'Last month'}
                    </span>
                    <span className={styles.statValue}>
                      ⭐ {assassin.averageRatingLastMonth.toFixed(1)}
                    </span>
                  </div>

                  <div className={styles.stat}>
                    <span className={styles.statLabel}>
                      {isSpanish ? 'Contratos completados' : 'Completed contracts'}
                    </span>
                    <span className={styles.statValue}>
                      ✓ {assassin.completedContracts}
                    </span>
                  </div>
                </div>

                <div className={styles.specialties}>
                  {assassin.specialties.slice(0, 3).map((specialty, index) => (
                    <span key={index} className={styles.specialtyTag}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.detailsButton}
                  onClick={() => handleViewDetails(assassin)}
                >
                  {isSpanish ? 'Ver detalles' : 'View details'}
                </button>
                {(!currentUser || currentUser.role === 'contractor') && (
                  <button
                    className={styles.proposeButton}
                    onClick={() => handleProposeClick(assassin)}
                  >
                    {isSpanish ? 'Proponer misión' : 'Propose mission'}
                  </button>
                )}
                <RequestFavorButton
                  targetAssassin={assassin}
                  currentUser={currentUser}
                  isSpanish={isSpanish}
                  onRequestSent={() => {
                    // Opcional: Refrescar o mostrar mensaje
                    console.log('Favor request sent to', assassin.name);
                  }}
                />
              </div>
            </div>
            );
          })}
        </div>

        {filteredAssassins.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>{isSpanish ? 'No se encontraron asesinos' : 'No assassins found'}</p>
          </div>
        )}
      </main>

      {/* Modal de detalles */}
      {showDetailModal && selectedAssassin && (() => {
        const isTarget = debtService.isTarget(selectedAssassin.id);
        const targetInfo = isTarget ? debtService.getTargetInfo(selectedAssassin.id) : null;
        
        return (
          <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setShowDetailModal(false)}>
                ✕
              </button>

              <div className={styles.modalHeader}>
                <div className={styles.modalAvatar}>
                  {selectedAssassin.name.charAt(0)}
                </div>
                <div>
                  <h2 className={styles.modalName}>{selectedAssassin.name}</h2>
                  <p className={styles.modalNickname}>"{selectedAssassin.nickname}"</p>
                </div>
                <div className={styles.modalStatusBadges}>
                  <div
                    className={styles.modalStatus}
                    style={{ backgroundColor: getStatusColor(selectedAssassin.status) }}
                  >
                    {getStatusText(selectedAssassin.status)}
                  </div>
                  {isTarget && (
                    <div className={styles.modalTargetBadge}>
                      🎯 {isSpanish ? 'OBJETIVO' : 'TARGET'}
                    </div>
                  )}
                </div>
              </div>

              {isTarget && targetInfo && (
                <div className={styles.targetWarning}>
                  <span className={styles.targetWarningIcon}>⚠️</span>
                  <div className={styles.targetWarningContent}>
                    <strong>{isSpanish ? 'Asesino marcado como objetivo' : 'Assassin marked as target'}</strong>
                    <p>{targetInfo.reason}</p>
                    <p className={styles.targetWarningDate}>
                      {isSpanish ? 'Marcado el:' : 'Marked on:'} {new Date(targetInfo.markedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.modalBody}>
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>
                    {isSpanish ? 'Estadísticas' : 'Statistics'}
                  </h3>
                  <div className={styles.modalStats}>
                    <div className={styles.modalStat}>
                      <span className={styles.modalStatLabel}>
                        {isSpanish ? 'Valor mínimo de contrato' : 'Minimum contract value'}
                      </span>
                      <span className={styles.modalStatValue}>
                        🪙 {selectedAssassin.minContractValue.toLocaleString()}
                      </span>
                    </div>
                    <div className={styles.modalStat}>
                      <span className={styles.modalStatLabel}>
                        {isSpanish ? 'Puntuación histórica' : 'All-time rating'}
                      </span>
                      <span className={styles.modalStatValue}>
                        ⭐ {selectedAssassin.averageRatingAllTime.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className={styles.modalStat}>
                      <span className={styles.modalStatLabel}>
                        {isSpanish ? 'Puntuación último mes' : 'Last month rating'}
                      </span>
                      <span className={styles.modalStatValue}>
                        ⭐ {selectedAssassin.averageRatingLastMonth.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className={styles.modalStat}>
                      <span className={styles.modalStatLabel}>
                        {isSpanish ? 'Contratos completados' : 'Completed contracts'}
                      </span>
                      <span className={styles.modalStatValue}>
                        ✓ {selectedAssassin.completedContracts}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>
                    {isSpanish ? 'Especialidades' : 'Specialties'}
                  </h3>
                  <div className={styles.modalSpecialties}>
                    {selectedAssassin.specialties.map((specialty, index) => (
                      <span key={index} className={styles.modalSpecialtyTag}>
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sección de envío de monedas */}
                {currentUser && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.sectionTitle}>
                      {isSpanish ? 'Enviar Monedas' : 'Send Coins'}
                    </h3>
                    
                    {!showSendCoinsModal ? (
                      <button
                        className={styles.sendCoinsButton}
                        onClick={() => setShowSendCoinsModal(true)}
                      >
                        <span className={styles.sendCoinsIcon}>💰</span>
                        {isSpanish ? 'Enviar Monedas' : 'Send Coins'}
                      </button>
                    ) : (
                      <form className={styles.sendCoinsForm} onSubmit={handleSendCoins}>
                        <div className={styles.userCoinsInfo}>
                          <span className={styles.userCoinsLabel}>
                            {isSpanish ? 'Tus monedas:' : 'Your coins:'}
                          </span>
                          <span className={styles.userCoinsAmount}>
                            🪙 {currentUser.coins.toLocaleString()}
                          </span>
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="coinsAmount" className={styles.label}>
                            {isSpanish ? 'Cantidad de monedas' : 'Amount of coins'}
                          </label>
                          <input
                            id="coinsAmount"
                            type="number"
                            value={coinsToSend}
                            onChange={(e) => setCoinsToSend(e.target.value)}
                            className={styles.input}
                            placeholder="1000"
                            min="1"
                            max={currentUser.coins}
                            required
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="transferMessage" className={styles.label}>
                            {isSpanish ? 'Mensaje (opcional)' : 'Message (optional)'}
                          </label>
                          <textarea
                            id="transferMessage"
                            value={transferMessage}
                            onChange={(e) => setTransferMessage(e.target.value)}
                            className={styles.textarea}
                            placeholder={isSpanish ? 'Ej: Pago por servicios prestados' : 'Ex: Payment for services rendered'}
                            rows={3}
                          />
                        </div>

                        <div className={styles.sendCoinsActions}>
                          <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => {
                              setShowSendCoinsModal(false);
                              setCoinsToSend('');
                              setTransferMessage('');
                            }}
                          >
                            {isSpanish ? 'Cancelar' : 'Cancel'}
                          </button>
                          <button
                            type="submit"
                            className={styles.confirmSendButton}
                            disabled={!coinsToSend || parseInt(coinsToSend) <= 0 || parseInt(coinsToSend) > currentUser.coins}
                          >
                            <span className={styles.buttonIcon}>💸</span>
                            {isSpanish ? 'Enviar' : 'Send'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de proponer misión */}
      {showProposeModal && selectedAssassin && currentUser && (
        <div className={styles.modalOverlay} onClick={() => setShowProposeModal(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowProposeModal(false)}>
              ✕
            </button>

            <h2 className={styles.modalTitle}>
              {isSpanish ? 'Proponer Misión' : 'Propose Mission'}
            </h2>

            <div className={styles.proposeInfo}>
              <div className={styles.proposeAssassin}>
                <div className={styles.proposeAvatar}>
                  {selectedAssassin.name.charAt(0)}
                </div>
                <div>
                  <h3 className={styles.proposeName}>{selectedAssassin.name}</h3>
                  <p className={styles.proposeNickname}>"{selectedAssassin.nickname}"</p>
                  <p className={styles.proposeMinValue}>
                    {isSpanish ? 'Valor mínimo:' : 'Min. value:'}{' '}
                    <span className={styles.proposeAmount}>
                      🪙 {selectedAssassin.minContractValue.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <form className={styles.proposeForm} onSubmit={handleSubmitProposal}>
              {/* Selector de opción */}
              <div className={styles.optionSelector}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    proposeOption === 'existing' ? styles.optionActive : ''
                  }`}
                  onClick={() => setProposeOption('existing')}
                >
                  <span className={styles.optionIcon}>📋</span>
                  <span className={styles.optionLabel}>
                    {isSpanish ? 'Misión existente' : 'Existing mission'}
                  </span>
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    proposeOption === 'new' ? styles.optionActive : ''
                  }`}
                  onClick={() => setProposeOption('new')}
                >
                  <span className={styles.optionIcon}>✨</span>
                  <span className={styles.optionLabel}>
                    {isSpanish ? 'Nueva misión' : 'New mission'}
                  </span>
                </button>
              </div>

              {proposeOption === 'existing' ? (
                <div className={styles.formGroup}>
                  <label htmlFor="missionSelect" className={styles.label}>
                    {isSpanish ? 'Selecciona una misión' : 'Select a mission'}
                  </label>
                  <select
                    id="missionSelect"
                    value={selectedMissionId}
                    onChange={(e) => setSelectedMissionId(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">
                      {isSpanish ? 'Selecciona una misión...' : 'Select a mission...'}
                    </option>
                    {userMissions
                      .filter(m => m.status === 'open' || m.status === 'negotiating')
                      .map((mission) => (
                        <option key={mission.id} value={mission.id}>
                          {mission.title} - 🪙 {mission.reward.toLocaleString()}
                        </option>
                      ))}
                  </select>
                  {userMissions.filter(m => m.status === 'open' || m.status === 'negotiating').length === 0 && (
                    <p className={styles.hint}>
                      {isSpanish
                        ? 'No tienes misiones disponibles. Crea una nueva.'
                        : 'You have no available missions. Create a new one.'}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>
                      {isSpanish ? 'Título de la misión' : 'Mission title'}
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={newMissionTitle}
                      onChange={(e) => setNewMissionTitle(e.target.value)}
                      className={styles.input}
                      placeholder={
                        isSpanish
                          ? 'Ej: Eliminar objetivo de alta prioridad'
                          : 'Ex: Eliminate high priority target'
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>
                      {isSpanish ? 'Descripción' : 'Description'}
                    </label>
                    <textarea
                      id="description"
                      value={newMissionDescription}
                      onChange={(e) => setNewMissionDescription(e.target.value)}
                      className={styles.textarea}
                      placeholder={
                        isSpanish
                          ? 'Describe los detalles de la misión...'
                          : 'Describe the mission details...'
                      }
                      rows={4}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="reward" className={styles.label}>
                        {isSpanish ? 'Recompensa (monedas)' : 'Reward (coins)'}
                      </label>
                      <input
                        id="reward"
                        type="number"
                        value={newMissionReward}
                        onChange={(e) => setNewMissionReward(e.target.value)}
                        className={styles.input}
                        placeholder={selectedAssassin.minContractValue.toString()}
                        min={selectedAssassin.minContractValue}
                        max={currentUser.coins}
                        required
                      />
                      <p className={styles.hint}>
                        {isSpanish ? 'Monedas disponibles:' : 'Available coins:'}{' '}
                        🪙 {currentUser.coins.toLocaleString()}
                      </p>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="location" className={styles.label}>
                        {isSpanish ? 'Ubicación' : 'Location'}
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={newMissionLocation}
                        onChange={(e) => setNewMissionLocation(e.target.value)}
                        className={styles.input}
                        placeholder={isSpanish ? 'Ej: Bogotá, Colombia' : 'Ex: Bogotá, Colombia'}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="deadline" className={styles.label}>
                      {isSpanish ? 'Fecha límite' : 'Deadline'}
                    </label>
                    <input
                      id="deadline"
                      type="date"
                      value={newMissionDeadline}
                      onChange={(e) => setNewMissionDeadline(e.target.value)}
                      className={styles.input}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </>
              )}

              <button type="submit" className={styles.submitButton}>
                {isSpanish ? 'Enviar propuesta' : 'Send proposal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de autenticación requerida */}
      {showAuthModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowAuthModal(false)}>
              ✕
            </button>

            <div className={styles.authIcon}>🔐</div>

            <h2 className={styles.authTitle}>
              {isSpanish ? 'Autenticación Requerida' : 'Authentication Required'}
            </h2>

            <p className={styles.authMessage}>
              {isSpanish
                ? 'Para proponer misiones a asesinos debes:'
                : 'To propose missions to assassins you must:'}
            </p>

            <div className={styles.authButtons}>
              <button
                className={styles.authLoginButton}
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/login');
                }}
              >
                <span className={styles.authButtonIcon}>🔑</span>
                {isSpanish ? 'Iniciar Sesión' : 'Log In'}
              </button>

              <button
                className={styles.authRegisterButton}
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/register');
                }}
              >
                <span className={styles.authButtonIcon}>✨</span>
                {isSpanish ? 'Registrarse' : 'Sign Up'}
              </button>
            </div>

            <p className={styles.authNote}>
              {isSpanish
                ? '💡 Regístrate como contratista para publicar misiones'
                : '💡 Register as a contractor to post missions'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assassins;
